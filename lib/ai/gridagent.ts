/* ──────────────────────────────────────────────────────────
   GRIDAGENT — aprendizaje por refuerzo (Q-learning tabular)
   Usado por EXP—02 (Laboratorio IA).

   Un agente aprende solo, por prueba y error, a llegar a la meta
   de una cuadrícula con muros. Solo recibe recompensa (+1) al
   llegar; el descuento γ hace que prefiera los caminos cortos.
   Además repasa experiencias recordadas (Dyna-Q): aprende más
   con menos pasos, como quien repasa mentalmente un camino.
   - `step()` da un paso de entrenamiento (ε-greedy + actualización Q).
   - `value(c)` es lo que el agente cree que vale estar en la casilla c:
     se pinta como mapa de calor y forma una "ola" que nace en la meta.
   ────────────────────────────────────────────────────────── */

import { rng } from "./pixelnet";

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export type GridAgentOptions = {
  cols: number;
  rows: number;
  walls?: number[];
  goal?: number;
  alpha?: number;
  gamma?: number;
  /** Repasos de memoria por cada paso real (Dyna-Q). */
  planning?: number;
  seed?: number;
};

export class GridAgent {
  readonly cols: number;
  readonly rows: number;
  readonly count: number;
  readonly walls: Uint8Array;
  readonly Q: Float32Array;
  goal: number;
  epsilon = 1;
  episodes = 0;
  steps = 0;
  /** Casilla del agente que entrena y pasos del episodio en curso. */
  pos = 0;
  epSteps = 0;
  /** Longitud de los últimos episodios que llegaron a la meta. */
  readonly history: number[] = [];

  private readonly alpha: number;
  private readonly gamma: number;
  private readonly rand: () => number;
  private readonly maxSteps: number;
  /** Modelo aprendido (Dyna-Q): adónde llevó cada acción probada (-1 = no se sabe). */
  private readonly model: Int32Array;
  private readonly seen: Int32Array;
  private readonly inSeen: Uint8Array;
  private seenCount = 0;
  private readonly planning: number;

  constructor(opts: GridAgentOptions) {
    const { cols, rows, walls = [], goal = cols * rows - 1, alpha = 0.5, gamma = 0.94, planning = 4, seed = 11 } = opts;
    this.cols = cols;
    this.rows = rows;
    this.count = cols * rows;
    this.walls = new Uint8Array(this.count);
    for (const w of walls) this.walls[w] = 1;
    this.goal = goal;
    this.walls[goal] = 0;
    this.Q = new Float32Array(this.count * 4);
    this.alpha = alpha;
    this.gamma = gamma;
    this.rand = rng(seed);
    this.maxSteps = this.count * 3;
    this.planning = planning;
    this.model = new Int32Array(this.count * 4).fill(-1);
    this.seen = new Int32Array(this.count * 4);
    this.inSeen = new Uint8Array(this.count * 4);
    this.respawn();
  }

  /** Celda vecina en la dirección a (o la misma si hay muro o borde). */
  next(cell: number, a: number) {
    const x = (cell % this.cols) + DX[a];
    const y = Math.floor(cell / this.cols) + DY[a];
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return cell;
    const n = y * this.cols + x;
    return this.walls[n] ? cell : n;
  }

  value(cell: number) {
    const o = cell * 4;
    const q = this.Q;
    return Math.max(q[o], q[o + 1], q[o + 2], q[o + 3]);
  }

  /** Mejor acción; los empates se rompen al azar (sin preferencia oculta). */
  best(cell: number) {
    const o = cell * 4;
    let best = -Infinity;
    let pick = 0;
    let ties = 0;
    for (let a = 0; a < 4; a++) {
      const q = this.Q[o + a];
      if (q > best + 1e-9) {
        best = q;
        pick = a;
        ties = 1;
      } else if (Math.abs(q - best) <= 1e-9 && this.rand() * ++ties < 1) {
        pick = a;
      }
    }
    return pick;
  }

  randomFree(avoid = -1) {
    for (let i = 0; i < 500; i++) {
      const c = (this.rand() * this.count) | 0;
      if (!this.walls[c] && c !== this.goal && c !== avoid) return c;
    }
    return this.goal === 0 ? 1 : 0;
  }

  respawn() {
    this.pos = this.randomFree();
    this.epSteps = 0;
  }

  /** Un paso de entrenamiento. Devuelve true si el episodio terminó en la meta. */
  step() {
    const s = this.pos;
    const a = this.rand() < this.epsilon ? (this.rand() * 4) | 0 : this.best(s);
    const n = this.next(s, a);
    const done = n === this.goal;
    const r = done ? 1 : 0;
    const target = done ? r : r + this.gamma * this.value(n);
    const i = s * 4 + a;
    this.Q[i] += this.alpha * (target - this.Q[i]);
    this.remember(i, n);
    this.replay();
    this.pos = n;
    this.steps++;
    this.epSteps++;
    if (done || this.epSteps >= this.maxSteps) {
      if (done) {
        this.history.push(this.epSteps);
        if (this.history.length > 120) this.history.shift();
      }
      this.episodes++;
      this.epsilon = Math.max(0.08, this.epsilon * 0.985);
      this.respawn();
      return done;
    }
    return false;
  }

  private remember(i: number, n: number) {
    this.model[i] = n;
    if (!this.inSeen[i]) {
      this.inSeen[i] = 1;
      this.seen[this.seenCount++] = i;
    }
  }

  /** Repasa transiciones recordadas al azar con la meta actual. */
  private replay() {
    for (let k = 0; k < this.planning && this.seenCount; k++) {
      const j = this.seen[(this.rand() * this.seenCount) | 0];
      const n = this.model[j];
      if (n < 0) continue;
      const t = n === this.goal ? 1 : this.gamma * this.value(n);
      this.Q[j] += this.alpha * (t - this.Q[j]);
    }
  }

  /** Olvida lo que el modelo sabía de una casilla y de cómo se entraba en ella. */
  private invalidate(cell: number) {
    this.model.fill(-1, cell * 4, cell * 4 + 4);
    const x = cell % this.cols;
    const y = Math.floor(cell / this.cols);
    for (let a = 0; a < 4; a++) {
      const nx = x + DX[a];
      const ny = y + DY[a];
      if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
      // Desde el vecino, la acción opuesta apunta a esta casilla.
      this.model[(ny * this.cols + nx) * 4 + ((a + 2) % 4)] = -1;
    }
  }

  /** Distancia real (BFS) desde cada casilla a la meta; -1 si no se llega. */
  distances() {
    const d = new Int32Array(this.count).fill(-1);
    const queue = [this.goal];
    d[this.goal] = 0;
    for (let h = 0; h < queue.length; h++) {
      const c = queue[h];
      for (let a = 0; a < 4; a++) {
        // Movimiento inverso: quien está en n llega a c con la acción opuesta.
        const n = this.next(c, a);
        if (n !== c && d[n] < 0 && !this.walls[n]) {
          d[n] = d[c] + 1;
          queue.push(n);
        }
      }
    }
    return d;
  }

  /** Proporción de casillas libres desde las que la política voraz llega a la meta. */
  mastery() {
    let ok = 0;
    let free = 0;
    const d = this.distances();
    for (let c = 0; c < this.count; c++) {
      if (this.walls[c] || c === this.goal || d[c] < 0) continue;
      free++;
      let cur = c;
      let n = 0;
      while (cur !== this.goal && n < d[c] * 2 + 4) {
        const o = cur * 4;
        let a = 0;
        for (let k = 1; k < 4; k++) if (this.Q[o + k] > this.Q[o + a]) a = k;
        cur = this.next(cur, a);
        n++;
      }
      if (cur === this.goal && n <= d[c] + 2) ok++;
    }
    return free ? ok / free : 0;
  }

  toggleWall(cell: number) {
    if (cell === this.goal) return;
    this.walls[cell] = this.walls[cell] ? 0 : 1;
    if (this.walls[cell]) this.Q.fill(0, cell * 4, cell * 4 + 4);
    this.invalidate(cell);
    if (this.pos === cell) this.respawn();
  }

  moveGoal(cell: number) {
    if (this.walls[cell]) return;
    this.goal = cell;
    // Lo aprendido apunta a la meta vieja: se olvida en parte y vuelve a explorar.
    for (let i = 0; i < this.Q.length; i++) this.Q[i] *= 0.25;
    this.epsilon = Math.max(this.epsilon, 0.6);
    this.history.length = 0;
    this.respawn();
  }

  forget() {
    this.Q.fill(0);
    this.model.fill(-1);
    this.inSeen.fill(0);
    this.seenCount = 0;
    this.epsilon = 1;
    this.episodes = 0;
    this.history.length = 0;
    this.respawn();
  }
}
