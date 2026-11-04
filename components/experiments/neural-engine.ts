/* ──────────────────────────────────────────────────────────
   EXP—01 · La red aprende a dibujar (motor de dibujo + interacción)
   La red (lib/ai/pixelnet) aprende una forma de 48 × 30 píxeles.
   Cada píxel es un punto cuyo tamaño es la probabilidad que da la
   red; en rojo, los píxeles en los que todavía se equivoca. La
   forma objetivo se ve como una sombra tenue debajo.
   - Pasar el ratón aparta los puntos (como las partículas de antes).
   - Arrastrar dibuja o borra en la forma objetivo: la red la aprende.
   - Cuando la aprende y nadie está dibujando, pasa sola a otra forma.
   ────────────────────────────────────────────────────────── */

import { PixelNet } from "@/lib/ai/pixelnet";
import { NET } from "@/lib/ai/config";
import { addTrainingSteps } from "@/lib/ai/labStats";
import { cssVar } from "@/lib/env";

export const COLS = 48;
export const ROWS = 30;
const N = COLS * ROWS;
/** Ritmo de entrenamiento: lo bastante lento para verla aprender. */
const STEPS_PER_SECOND = 45;
/** Cada frame recalcula un tercio de la rejilla (reparte el coste). */
const STRIDE = 3;
/** Tiempo mostrando la forma aprendida antes de pasar a la siguiente. */
const HOLD_MS = 2800;
/** Tras dibujar, la red no cambia de forma sola durante este tiempo. */
const IDLE_MS = 8000;

export type NeuralStatus = "learning" | "learned" | "yours";
export type NeuralStats = {
  step: number;
  loss: number;
  accuracy: number;
  status: NeuralStatus;
  preset: number;
};

type Options = {
  /** Formas predefinidas (texto que se rasteriza a 48 × 30). */
  words: string[];
  spark: HTMLCanvasElement | null;
  /** Movimiento reducido: entrena de golpe y muestra el resultado. */
  reduced: boolean;
  onStats: (s: NeuralStats) => void;
};

export type NeuralEngine = ReturnType<typeof createNeuralEngine>;

function rasterize(text: string) {
  const out = new Float32Array(N);
  const c = document.createElement("canvas");
  c.width = COLS;
  c.height = ROWS;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return out;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, COLS, ROWS);
  const family = cssVar("--font-anton") || "Impact";
  let size = ROWS * 0.9;
  x.font = `${size}px ${family}, Impact, sans-serif`;
  const max = COLS * 0.84;
  const width = x.measureText(text).width;
  if (width > max) {
    size *= max / width;
    x.font = `${size}px ${family}, Impact, sans-serif`;
  }
  x.fillStyle = "#000";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(text, COLS / 2, ROWS / 2 + size * 0.04);
  const d = x.getImageData(0, 0, COLS, ROWS).data;
  for (let i = 0; i < N; i++) out[i] = d[i * 4] < 140 ? 1 : 0;
  return out;
}

export function createNeuralEngine(canvas: HTMLCanvasElement, opts: Options) {
  const ctx = canvas.getContext("2d");
  const net = new PixelNet(NET);
  net.setGrid(COLS, ROWS);

  const paper = cssVar("--color-paper") || "#f0efe9";
  const signal = cssVar("--color-signal") || "#e52b25";
  const ghost = "rgba(240, 239, 233, 0.09)";

  let words = opts.words;
  let preset = 0;
  let target = rasterize(words[0]);
  const disp = new Float32Array(N).fill(0.5);
  const offX = new Float32Array(N);
  const offY = new Float32Array(N);
  const velX = new Float32Array(N);
  const velY = new Float32Array(N);
  const history: number[] = [];

  let mode: "auto" | "user" = "auto";
  let learnedAt = 0;
  let lastTouch = -Infinity;
  let stepAcc = 0;
  let phase = 0;
  let frameNo = 0;
  let loss = 1;
  let accuracy = 0;
  let destroyed = false;

  // Geometría (px CSS)
  let w = 0;
  let h = 0;
  let cs = 0;
  let x0 = 0;
  let y0 = 0;
  let dpr = 1;

  const pointer = {
    x: -1e4,
    y: -1e4,
    hover: false,
    painting: false,
    pending: false,
    startX: 0,
    startY: 0,
    value: 1,
    lastX: 0,
    lastY: 0,
    id: -1,
  };

  /* ── Geometría ─────────────────────────────────────── */
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
    draw();
  };

  /* ── Dibujo ────────────────────────────────────────── */
  function draw() {
    if (!ctx || !cs) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Sombra de la forma objetivo
    ctx.fillStyle = ghost;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (target[i] < 0.5) continue;
      const c = i % COLS;
      const r = (i / COLS) | 0;
      ctx.rect(x0 + c * cs + 1, y0 + r * cs + 1, cs - 2, cs - 2);
    }
    ctx.fill();

    // Píxeles de la red: tamaño = probabilidad; rojo = todavía se equivoca.
    const ok = new Path2D();
    const bad = new Path2D();
    for (let i = 0; i < N; i++) {
      const p = disp[i];
      const s = cs * (0.1 + 0.74 * p);
      const c = i % COLS;
      const r = (i / COLS) | 0;
      const px = x0 + (c + 0.5) * cs - s / 2 + offX[i];
      const py = y0 + (r + 0.5) * cs - s / 2 + offY[i];
      (p > 0.5 !== target[i] > 0.5 ? bad : ok).rect(px, py, s, s);
    }
    ctx.fillStyle = paper;
    ctx.fill(ok);
    ctx.fillStyle = signal;
    ctx.fill(bad);
  }

  function drawSpark() {
    const sp = opts.spark;
    const sctx = sp?.getContext("2d");
    if (!sp || !sctx) return;
    const sw = sp.clientWidth;
    const sh = sp.clientHeight;
    if (!sw || !sh) return;
    if (sp.width !== Math.round(sw * dpr)) {
      sp.width = Math.round(sw * dpr);
      sp.height = Math.round(sh * dpr);
    }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, sw, sh);
    sctx.fillStyle = "rgba(240, 239, 233, 0.18)";
    sctx.fillRect(0, sh - 1, sw, 1);
    if (history.length < 2) return;
    // Escala logarítmica: el error cae de ~0,7 a ~0,005.
    const lo = Math.log10(0.004);
    const hi = Math.log10(0.9);
    const yOf = (v: number) => {
      const t = (Math.log10(Math.min(Math.max(v, 0.004), 0.9)) - lo) / (hi - lo);
      return 3 + (1 - t) * (sh - 6);
    };
    const step = sw / (90 - 1);
    sctx.strokeStyle = paper;
    sctx.lineWidth = 1.5;
    sctx.beginPath();
    history.forEach((v, i) => {
      const x = i * step;
      if (i === 0) sctx.moveTo(x, yOf(v));
      else sctx.lineTo(x, yOf(v));
    });
    sctx.stroke();
    const lx = (history.length - 1) * step;
    sctx.fillStyle = signal;
    sctx.fillRect(lx - 3, yOf(history[history.length - 1]) - 3, 6, 6);
  }

  const emit = () => {
    const learned = learnedAt > 0;
    opts.onStats({
      step: net.steps,
      loss,
      accuracy,
      status: learned ? "learned" : mode === "user" ? "yours" : "learning",
      preset: mode === "user" ? -1 : preset,
    });
  };

  const measure = () => {
    const s = net.score(target);
    loss = s.loss;
    accuracy = s.accuracy;
    history.push(loss);
    if (history.length > 90) history.shift();
  };

  /* ── Formas ────────────────────────────────────────── */
  const setPreset = (i: number) => {
    preset = ((i % words.length) + words.length) % words.length;
    target = rasterize(words[preset]);
    mode = "auto";
    learnedAt = 0;
    measure();
    draw();
    emit();
  };

  /* ── Puntero: apartar puntos y dibujar ─────────────── */
  const local = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const paintSegment = (ax: number, ay: number, bx: number, by: number) => {
    if (!cs) return;
    const dist = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.ceil(dist / (cs * 0.5)));
    const R = 1.35;
    for (let k = 0; k <= n; k++) {
      const fx = (ax + ((bx - ax) * k) / n - x0) / cs;
      const fy = (ay + ((by - ay) * k) / n - y0) / cs;
      const c0 = Math.floor(fx - R);
      const r0 = Math.floor(fy - R);
      for (let r = r0; r <= r0 + 3; r++) {
        for (let c = c0; c <= c0 + 3; c++) {
          if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
          if (Math.hypot(c + 0.5 - fx, r + 0.5 - fy) <= R) target[r * COLS + c] = pointer.value;
        }
      }
    }
    mode = "user";
    learnedAt = 0;
    lastTouch = performance.now();
  };

  const startPaint = (x: number, y: number) => {
    const c = Math.floor((x - x0) / cs);
    const r = Math.floor((y - y0) / cs);
    const inside = c >= 0 && r >= 0 && c < COLS && r < ROWS;
    // Empezar sobre tinta borra; sobre vacío, pinta.
    pointer.value = inside && target[r * COLS + c] > 0.5 ? 0 : 1;
    pointer.painting = true;
    pointer.lastX = x;
    pointer.lastY = y;
    paintSegment(x, y, x, y);
    draw();
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const { x, y } = local(e);
    pointer.id = e.pointerId;
    if (e.pointerType === "touch") {
      // En táctil se espera a ver si es un toque o un gesto horizontal:
      // un gesto vertical es scroll y no debe pintar.
      pointer.pending = true;
      pointer.startX = x;
      pointer.startY = y;
      return;
    }
    canvas.setPointerCapture?.(e.pointerId);
    startPaint(x, y);
  };

  const onMove = (e: PointerEvent) => {
    const { x, y } = local(e);
    if (e.pointerType === "mouse") {
      pointer.x = x;
      pointer.y = y;
      pointer.hover = true;
    }
    if (pointer.pending && e.pointerId === pointer.id) {
      const dx = x - pointer.startX;
      const dy = y - pointer.startY;
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        pointer.pending = false;
        startPaint(pointer.startX, pointer.startY);
      } else if (Math.abs(dy) > 10) {
        pointer.pending = false;
      }
    }
    if (pointer.painting && e.pointerId === pointer.id) {
      paintSegment(pointer.lastX, pointer.lastY, x, y);
      pointer.lastX = x;
      pointer.lastY = y;
      draw();
    }
  };

  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointer.id) return;
    if (pointer.pending) {
      // Toque corto: pinta un punto.
      pointer.pending = false;
      startPaint(pointer.startX, pointer.startY);
    }
    pointer.painting = false;
    pointer.id = -1;
    emit();
  };

  const onCancel = () => {
    pointer.pending = false;
    pointer.painting = false;
    pointer.id = -1;
  };

  const onLeave = () => {
    pointer.hover = false;
    pointer.x = -1e4;
    pointer.y = -1e4;
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);

  /* ── Física de los puntos (como las partículas) ───── */
  const physics = () => {
    const R = cs * 3.6;
    const active = pointer.hover && !pointer.painting && cs > 0;
    for (let i = 0; i < N; i++) {
      let fx = -offX[i] * 0.09;
      let fy = -offY[i] * 0.09;
      if (active) {
        const c = i % COLS;
        const r = (i / COLS) | 0;
        const dx = x0 + (c + 0.5) * cs + offX[i] - pointer.x;
        const dy = y0 + (r + 0.5) * cs + offY[i] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * (1 - d / R) * cs * 0.9;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
      }
      velX[i] = (velX[i] + fx) * 0.78;
      velY[i] = (velY[i] + fy) * 0.78;
      offX[i] += velX[i];
      offY[i] += velY[i];
    }
  };

  /* ── Un frame: entrenar, evaluar, animar, dibujar ─── */
  const frame = (dt: number, now: number) => {
    if (destroyed) return;
    stepAcc += (dt / 1000) * STEPS_PER_SECOND;
    const n = Math.min(Math.floor(stepAcc), 4);
    stepAcc -= n;
    for (let k = 0; k < n; k++) net.trainStep(target);
    if (n) addTrainingSteps(n);

    net.refresh(phase, STRIDE);
    phase = (phase + 1) % STRIDE;
    const out = net.out;
    for (let i = 0; i < N; i++) disp[i] += (out[i] - disp[i]) * 0.3;

    if (++frameNo % 8 === 0) {
      measure();
      if (accuracy >= 0.996) {
        if (!learnedAt) learnedAt = now;
      } else learnedAt = 0;
      if (learnedAt && now - learnedAt > HOLD_MS && now - lastTouch > IDLE_MS) setPreset(preset + 1);
      drawSpark();
      emit();
    }
    physics();
    draw();
  };

  /* ── Arranque ──────────────────────────────────────── */
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  if (opts.reduced) {
    // Sin animación: se entrena de golpe y se enseña el resultado.
    for (let k = 0; k < 360; k++) net.trainStep(target);
    addTrainingSteps(360);
    net.refresh();
    disp.set(net.out);
    measure();
    if (accuracy >= 0.996) learnedAt = performance.now();
  } else {
    net.refresh();
    measure();
  }
  draw();
  drawSpark();
  emit();

  // Con la fuente ya cargada, la forma se rasteriza con Anton.
  document.fonts?.ready.then(() => {
    if (destroyed || mode === "user") return;
    target = rasterize(words[preset]);
    draw();
  });

  return {
    frame,
    setPreset,
    params: net.size,
    setWords(next: string[]) {
      if (next.join("\u0000") === words.join("\u0000")) return;
      words = next;
      if (mode === "auto") {
        target = rasterize(words[preset]);
        learnedAt = 0;
        draw();
      }
    },
    clear() {
      target.fill(0);
      mode = "user";
      learnedAt = 0;
      lastTouch = performance.now();
      draw();
      emit();
    },
    reset() {
      net.reset();
      learnedAt = 0;
      history.length = 0;
      net.refresh();
      measure();
      drawSpark();
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
