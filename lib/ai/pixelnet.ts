/* ──────────────────────────────────────────────────────────
   PIXELNET — red neuronal minúscula escrita a mano (sin librerías)
   Usada por EXP—01 (Laboratorio IA).

   Aprende una imagen en blanco y negro como una función
   (x, y) → probabilidad de que ese píxel sea "tinta".
   - Entrada: rasgos de Fourier (sin/cos de proyecciones aleatorias
     de x, y). Con ellos, pocas neuronas aprenden bordes nítidos.
   - Dos capas ocultas ReLU y salida sigmoide.
   - Pérdida: entropía cruzada binaria. Optimizador: Adam.
   Todos los pesos viven en un único Float32Array para que el bucle
   de entrenamiento sea rápido en el hilo principal.
   ────────────────────────────────────────────────────────── */

export type PixelNetOptions = {
  /** Número de frecuencias de Fourier (rasgos de entrada = 2 × freqs). */
  freqs?: number;
  /** Desviación de las frecuencias: más alta = detalles más finos. */
  sigma?: number;
  hidden?: number;
  learningRate?: number;
  batch?: number;
  seed?: number;
};

/** Generador pseudoaleatorio con semilla (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

export class PixelNet {
  readonly nIn: number;
  readonly hidden: number;
  readonly size: number;
  /** Puntos de la rejilla (cols × rows) y sus rasgos precalculados. */
  cols = 0;
  rows = 0;
  count = 0;
  feats = new Float32Array(0);
  /** Salida de la red para cada punto de la rejilla (tras evaluate). */
  out = new Float32Array(0);
  steps = 0;

  private readonly freqs: number;
  private readonly B: Float32Array;
  private readonly lr: number;
  private readonly batch: number;
  private readonly rand: () => number;
  // Parámetros, gradientes y momentos de Adam en bloques contiguos.
  private readonly p: Float32Array;
  private readonly g: Float32Array;
  private readonly m: Float32Array;
  private readonly v: Float32Array;
  private readonly oW1: number;
  private readonly ob1: number;
  private readonly oW2: number;
  private readonly ob2: number;
  private readonly oW3: number;
  private readonly ob3: number;
  // Activaciones de trabajo.
  private readonly a1: Float32Array;
  private readonly a2: Float32Array;
  private readonly d1: Float32Array;
  private readonly d2: Float32Array;
  private t = 0;

  constructor(opts: PixelNetOptions = {}) {
    const { freqs = 12, sigma = 2.2, hidden = 24, learningRate = 0.01, batch = 128, seed = 7 } = opts;
    this.freqs = freqs;
    this.nIn = freqs * 2;
    this.hidden = hidden;
    this.lr = learningRate;
    this.batch = batch;
    this.rand = rng(seed);

    const H = hidden;
    this.oW1 = 0;
    this.ob1 = this.oW1 + H * this.nIn;
    this.oW2 = this.ob1 + H;
    this.ob2 = this.oW2 + H * H;
    this.oW3 = this.ob2 + H;
    this.ob3 = this.oW3 + H;
    this.size = this.ob3 + 1;

    this.p = new Float32Array(this.size);
    this.g = new Float32Array(this.size);
    this.m = new Float32Array(this.size);
    this.v = new Float32Array(this.size);
    this.a1 = new Float32Array(H);
    this.a2 = new Float32Array(H);
    this.d1 = new Float32Array(H);
    this.d2 = new Float32Array(H);

    // Frecuencias fijas (no se entrenan).
    this.B = new Float32Array(freqs * 2);
    for (let i = 0; i < this.B.length; i++) this.B[i] = gauss(this.rand) * sigma;
    this.reset();
  }

  /** Pesos nuevos (inicialización He) y optimizador a cero. */
  reset() {
    const { p, nIn, hidden: H } = this;
    for (let i = 0; i < H * nIn; i++) p[this.oW1 + i] = gauss(this.rand) * Math.sqrt(2 / nIn);
    for (let i = 0; i < H * H; i++) p[this.oW2 + i] = gauss(this.rand) * Math.sqrt(2 / H);
    for (let i = 0; i < H; i++) p[this.oW3 + i] = gauss(this.rand) * Math.sqrt(1 / H);
    for (let i = 0; i < H; i++) {
      p[this.ob1 + i] = 0;
      p[this.ob2 + i] = 0;
    }
    p[this.ob3] = 0;
    this.m.fill(0);
    this.v.fill(0);
    this.t = 0;
    this.steps = 0;
  }

  /** Prepara los rasgos de Fourier de una rejilla cols × rows (celdas cuadradas). */
  setGrid(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.count = cols * rows;
    this.feats = new Float32Array(this.count * this.nIn);
    this.out = new Float32Array(this.count);
    const s = Math.max(cols, rows);
    const TAU = Math.PI * 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Coordenadas centradas en [-1, 1] sobre el lado mayor.
        const x = ((c + 0.5) * 2 - cols) / s;
        const y = ((r + 0.5) * 2 - rows) / s;
        const base = (r * cols + c) * this.nIn;
        for (let f = 0; f < this.freqs; f++) {
          const a = TAU * (this.B[f * 2] * x + this.B[f * 2 + 1] * y);
          this.feats[base + f] = Math.sin(a);
          this.feats[base + this.freqs + f] = Math.cos(a);
        }
      }
    }
  }

  private forwardAt(idx: number): number {
    const p = this.p;
    const feats = this.feats;
    const a1 = this.a1;
    const a2 = this.a2;
    const nIn = this.nIn;
    const H = this.hidden;
    const oW1 = this.oW1;
    const ob1 = this.ob1;
    const oW2 = this.oW2;
    const ob2 = this.ob2;
    const oW3 = this.oW3;
    const fx = idx * nIn;
    for (let j = 0; j < H; j++) {
      let s = p[ob1 + j];
      const w = oW1 + j * nIn;
      for (let k = 0; k < nIn; k++) s += p[w + k] * feats[fx + k];
      a1[j] = s > 0 ? s : 0;
    }
    let z = p[this.ob3];
    for (let j = 0; j < H; j++) {
      let s = p[ob2 + j];
      const w = oW2 + j * H;
      for (let k = 0; k < H; k++) s += p[w + k] * a1[k];
      const r = s > 0 ? s : 0;
      a2[j] = r;
      z += p[oW3 + j] * r;
    }
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Un paso de Adam sobre un minilote aleatorio.
   * `target[i]` es 0 o 1 para cada punto de la rejilla.
   */
  trainStep(target: Float32Array) {
    const { p, g, nIn, hidden: H, a1, a2, d1, d2, feats } = this;
    const n = this.batch;
    g.fill(0);
    for (let b = 0; b < n; b++) {
      const idx = (this.rand() * this.count) | 0;
      const prob = this.forwardAt(idx);
      const dz = (prob - target[idx]) / n;
      g[this.ob3] += dz;
      for (let k = 0; k < H; k++) {
        g[this.oW3 + k] += dz * a2[k];
        d2[k] = a2[k] > 0 ? dz * p[this.oW3 + k] : 0;
      }
      d1.fill(0);
      for (let j = 0; j < H; j++) {
        const dj = d2[j];
        if (dj === 0) continue;
        g[this.ob2 + j] += dj;
        const w = this.oW2 + j * H;
        for (let k = 0; k < H; k++) {
          g[w + k] += dj * a1[k];
          d1[k] += dj * p[w + k];
        }
      }
      const fx = idx * nIn;
      for (let j = 0; j < H; j++) {
        if (a1[j] <= 0) continue;
        const dj = d1[j];
        g[this.ob1 + j] += dj;
        const w = this.oW1 + j * nIn;
        for (let k = 0; k < nIn; k++) g[w + k] += dj * feats[fx + k];
      }
    }
    // Adam
    this.t++;
    const b1 = 0.9;
    const b2 = 0.999;
    const c1 = 1 - Math.pow(b1, this.t);
    const c2 = 1 - Math.pow(b2, this.t);
    const lr = this.lr;
    const { m, v } = this;
    for (let i = 0; i < this.size; i++) {
      const gi = g[i];
      m[i] = b1 * m[i] + (1 - b1) * gi;
      v[i] = b2 * v[i] + (1 - b2) * gi * gi;
      p[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + 1e-8);
    }
    this.steps++;
  }

  /** Recalcula la salida de una parte de la rejilla (i = offset, offset + stride…). */
  refresh(offset = 0, stride = 1) {
    for (let i = offset; i < this.count; i += stride) this.out[i] = this.forwardAt(i);
  }

  /** Pérdida media (entropía cruzada) y acierto de la última salida frente a `target`. */
  score(target: Float32Array) {
    let loss = 0;
    let hits = 0;
    for (let i = 0; i < this.count; i++) {
      const prob = this.out[i];
      const y = target[i];
      const q = Math.min(Math.max(prob, 1e-6), 1 - 1e-6);
      loss -= y * Math.log(q) + (1 - y) * Math.log(1 - q);
      if (prob > 0.5 === y > 0.5) hits++;
    }
    return { loss: loss / this.count, accuracy: hits / this.count };
  }

  /** Evalúa toda la rejilla y la puntúa. */
  evaluate(target: Float32Array) {
    this.refresh();
    return this.score(target);
  }
}
