/* ──────────────────────────────────────────────────────────
   EXP—02 · Un agente aprende solo (dibujo + interacción)
   El agente (lib/ai/gridagent) entrena en segundo plano, muy rápido.
   Lo que se ve:
   - Mapa de calor: lo que el agente cree que vale cada casilla. La
     "ola" roja nace en la meta y se extiende al aprender.
   - Flechas: hacia dónde iría desde cada casilla.
   - Un corredor que sigue lo aprendido a velocidad humana: al
     principio da vueltas; después va directo a la meta.
   Tocar una casilla pone o quita un muro. Cuando domina el mapa y
   nadie lo toca, la meta cambia de sitio y vuelve a aprender.
   ────────────────────────────────────────────────────────── */

import { GridAgent } from "@/lib/ai/gridagent";
import { AGENT } from "@/lib/ai/config";
import { addTrainingSteps } from "@/lib/ai/labStats";
import { cssVar } from "@/lib/env";

const { cols: COLS, rows: ROWS } = AGENT;
const N = COLS * ROWS;
const STEPS_PER_SECOND = 420;
const RUNNER_MS = 110;
const HOLD_MS = 3500;
const IDLE_MS = 6000;

export type AgentStats = { episodes: number; mastery: number; epsilon: number };
export type AgentEngine = ReturnType<typeof createAgentEngine>;

/** Muros iniciales: un pequeño laberinto en L. */
function initialWalls() {
  const walls: number[] = [];
  const add = (x: number, y: number) => walls.push(y * COLS + x);
  for (let y = 0; y < 7; y++) add(4, y);
  for (let y = 3; y < 10; y++) add(9, y);
  for (let x = 11; x < 15; x++) add(x, 3);
  for (let x = 5; x < 8; x++) add(x, 6);
  return walls;
}

export function createAgentEngine(
  canvas: HTMLCanvasElement,
  opts: { reduced: boolean; onStats: (s: AgentStats) => void }
) {
  const ctx = canvas.getContext("2d");
  const agent = new GridAgent({ cols: COLS, rows: ROWS, walls: initialWalls(), goal: 1 * COLS + 14, seed: 23 });

  const paper = cssVar("--color-paper") || "#f0efe9";
  const signal = cssVar("--color-signal") || "#e52b25";
  const warning = cssVar("--color-warning") || "#f3d94b";
  const ink = cssVar("--color-ink") || "#111111";

  let w = 0;
  let h = 0;
  let cs = 0;
  let x0 = 0;
  let y0 = 0;
  let dpr = 1;
  let destroyed = false;
  let stepAcc = 0;
  let frameNo = 0;
  let mastery = 0;
  let masteredAt = 0;
  let lastTouch = -Infinity;
  let hover = -1;

  // Corredor: recorre la política aprendida a velocidad humana.
  const runner = { pos: agent.randomFree(), trail: [] as number[], acc: 0, steps: 0, goalFlash: 0 };
  const respawnRunner = () => {
    runner.pos = agent.randomFree();
    runner.trail = [];
    runner.steps = 0;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cs = Math.min(w / COLS, h / ROWS);
    x0 = (w - cs * COLS) / 2;
    y0 = (h - cs * ROWS) / 2;
    draw(performance.now());
  };

  function draw(now: number) {
    if (!ctx || !cs) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Mapa de calor (valor aprendido) — una pasada por celda.
    for (let i = 0; i < N; i++) {
      if (agent.walls[i] || i === agent.goal) continue;
      const v = agent.value(i);
      if (v <= 0.001) continue;
      const c = i % COLS;
      const r = (i / COLS) | 0;
      ctx.globalAlpha = Math.min(1, 0.12 + Math.pow(v, 0.8) * 0.82);
      ctx.fillStyle = signal;
      ctx.fillRect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
    }
    ctx.globalAlpha = 1;

    // Retícula
    ctx.strokeStyle = "rgba(240, 239, 233, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= COLS; c++) {
      ctx.moveTo(x0 + c * cs + 0.5, y0);
      ctx.lineTo(x0 + c * cs + 0.5, y0 + ROWS * cs);
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.moveTo(x0, y0 + r * cs + 0.5);
      ctx.lineTo(x0 + COLS * cs, y0 + r * cs + 0.5);
    }
    ctx.stroke();

    // Muros
    ctx.fillStyle = paper;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (!agent.walls[i]) continue;
      const c = i % COLS;
      const r = (i / COLS) | 0;
      ctx.rect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
    }
    ctx.fill();

    // Flechas de la política (solo donde ya sabe algo): trazo + punta.
    const DX = [0, 1, 0, -1];
    const DY = [-1, 0, 1, 0];
    const tips = new Path2D();
    const tip = Math.max(2, cs * 0.12);
    ctx.strokeStyle = "rgba(240, 239, 233, 0.55)";
    ctx.lineWidth = Math.max(1, cs * 0.05);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (agent.walls[i] || i === agent.goal || agent.value(i) <= 0.02) continue;
      const o = i * 4;
      let a = 0;
      for (let k = 1; k < 4; k++) if (agent.Q[o + k] > agent.Q[o + a]) a = k;
      const cx = x0 + ((i % COLS) + 0.5) * cs;
      const cy = y0 + (((i / COLS) | 0) + 0.5) * cs;
      const ex = cx + DX[a] * cs * 0.24;
      const ey = cy + DY[a] * cs * 0.24;
      ctx.moveTo(cx - DX[a] * cs * 0.16, cy - DY[a] * cs * 0.16);
      ctx.lineTo(ex, ey);
      tips.rect(ex - tip / 2, ey - tip / 2, tip, tip);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(240, 239, 233, 0.8)";
    ctx.fill(tips);

    // Meta
    const gc = agent.goal % COLS;
    const gr = (agent.goal / COLS) | 0;
    const flash = Math.max(0, 1 - (now - runner.goalFlash) / 500);
    ctx.fillStyle = warning;
    ctx.fillRect(x0 + gc * cs + 1, y0 + gr * cs + 1, cs - 2, cs - 2);
    ctx.fillStyle = ink;
    const inner = cs * 0.34;
    ctx.fillRect(x0 + (gc + 0.5) * cs - inner / 2, y0 + (gr + 0.5) * cs - inner / 2, inner, inner);
    if (flash > 0) {
      ctx.strokeStyle = warning;
      ctx.globalAlpha = flash;
      ctx.lineWidth = 2;
      const grow = (1 - flash) * cs * 0.9;
      ctx.strokeRect(x0 + gc * cs - grow, y0 + gr * cs - grow, cs + grow * 2, cs + grow * 2);
      ctx.globalAlpha = 1;
    }

    // Estela y corredor
    runner.trail.forEach((cell, k) => {
      const a = (k + 1) / (runner.trail.length + 1);
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = paper;
      const s = cs * (0.18 + a * 0.2);
      ctx.fillRect(x0 + ((cell % COLS) + 0.5) * cs - s / 2, y0 + (((cell / COLS) | 0) + 0.5) * cs - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = paper;
    const rs = cs * 0.56;
    ctx.fillRect(
      x0 + ((runner.pos % COLS) + 0.5) * cs - rs / 2,
      y0 + (((runner.pos / COLS) | 0) + 0.5) * cs - rs / 2,
      rs,
      rs
    );

    // Casilla bajo el cursor
    if (hover >= 0) {
      ctx.strokeStyle = paper;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + (hover % COLS) * cs + 1, y0 + ((hover / COLS) | 0) * cs + 1, cs - 2, cs - 2);
    }
  }

  const emit = () => opts.onStats({ episodes: agent.episodes, mastery, epsilon: agent.epsilon });

  const farGoal = () => {
    const d = agent.distances();
    for (let k = 0; k < 200; k++) {
      const c = agent.randomFree();
      if (d[c] >= 9) return c;
    }
    return agent.randomFree();
  };

  const moveGoal = () => {
    agent.moveGoal(farGoal());
    masteredAt = 0;
    mastery = agent.mastery();
    respawnRunner();
    draw(performance.now());
    emit();
  };

  /* ── Puntero: poner y quitar muros ─────────────────── */
  const cellAt = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left - x0) / cs);
    const r = Math.floor((e.clientY - rect.top - y0) / cs);
    return c >= 0 && r >= 0 && c < COLS && r < ROWS ? r * COLS + c : -1;
  };
  let painting = -1; // 1 = poniendo muros, 0 = quitando
  let touchStart: { x: number; y: number; id: number } | null = null;

  const toggle = (cell: number, want?: number) => {
    if (cell < 0 || cell === agent.goal) return;
    const isWall = agent.walls[cell];
    if (want !== undefined && isWall === want) return;
    agent.toggleWall(cell);
    if (runner.pos === cell || agent.walls[runner.pos]) respawnRunner();
    lastTouch = performance.now();
    masteredAt = 0;
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") {
      touchStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
      return;
    }
    if (e.button !== 0) return;
    const cell = cellAt(e);
    if (cell < 0) return;
    canvas.setPointerCapture?.(e.pointerId);
    toggle(cell);
    painting = agent.walls[cell];
    draw(performance.now());
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse") hover = cellAt(e);
    if (painting >= 0) toggle(cellAt(e), painting);
    if (e.pointerType === "mouse" && destroyed === false) draw(performance.now());
  };
  const onUp = (e: PointerEvent) => {
    painting = -1;
    if (touchStart && e.pointerId === touchStart.id) {
      // Toque (no scroll): pone o quita un muro.
      if (Math.hypot(e.clientX - touchStart.x, e.clientY - touchStart.y) < 10) {
        toggle(cellAt(e));
        draw(performance.now());
      }
      touchStart = null;
    }
  };
  const onCancel = () => {
    painting = -1;
    touchStart = null;
  };
  const onLeave = () => {
    hover = -1;
    draw(performance.now());
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);

  const frame = (dt: number, now: number) => {
    if (destroyed) return;
    stepAcc += (dt / 1000) * STEPS_PER_SECOND;
    const n = Math.min(Math.floor(stepAcc), 40);
    stepAcc -= n;
    for (let k = 0; k < n; k++) agent.step();
    if (n) addTrainingSteps(n);

    // El corredor avanza una casilla cada RUNNER_MS siguiendo lo aprendido.
    runner.acc += dt;
    while (runner.acc >= RUNNER_MS) {
      runner.acc -= RUNNER_MS;
      runner.trail.push(runner.pos);
      if (runner.trail.length > 10) runner.trail.shift();
      runner.pos = agent.next(runner.pos, agent.best(runner.pos));
      runner.steps++;
      if (runner.pos === agent.goal) {
        runner.goalFlash = now;
        respawnRunner();
      } else if (runner.steps > 70) respawnRunner();
    }

    if (++frameNo % 20 === 0) {
      mastery = agent.mastery();
      if (mastery >= 0.98) {
        if (!masteredAt) masteredAt = now;
        else if (now - masteredAt > HOLD_MS && now - lastTouch > IDLE_MS) moveGoal();
      } else masteredAt = 0;
      emit();
    }
    draw(now);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  if (opts.reduced) {
    // Sin animación: entrena de golpe y muestra el mapa aprendido.
    for (let k = 0; k < 9000; k++) agent.step();
    addTrainingSteps(9000);
  }
  mastery = agent.mastery();
  draw(performance.now());
  emit();

  return {
    frame,
    moveGoal,
    forget() {
      agent.forget();
      masteredAt = 0;
      mastery = 0;
      respawnRunner();
      draw(performance.now());
      emit();
    },
    destroy() {
      destroyed = true;
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
    },
  };
}
