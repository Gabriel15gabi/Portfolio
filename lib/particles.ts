/* ──────────────────────────────────────────────────────────
   MOTOR DE PARTÍCULAS TIPOGRÁFICAS (Canvas 2D)
   Usado por EXP—01 (Experimental Zone) y por el nombre de la portada.

   - `sample` dibuja formas en un canvas oculto; cada píxel opaco
     (muestreado cada `step` px) se convierte en una partícula.
     Lo dibujado en rojo puro (#ff0000) se convierte en partícula
     de acento; el resto usa el color base.
   - Cada partícula vuelve a su posición con un muelle, el puntero
     la repele y `setScatter` la desplaza en una dirección propia
     (dispersión controlada por scroll o por una animación).
   - El bucle se duerme cuando todo está en reposo y se despierta
     con el puntero, un toque o un cambio de dispersión.
   ────────────────────────────────────────────────────────── */

export type ParticleFieldOptions = {
  /** Dibuja las formas a muestrear en el contexto oculto (w × h en px CSS). */
  sample: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  /** Color de las partículas base. Se lee en cada frame (sigue al tema). */
  baseColor: () => string;
  accentColor: () => string;
  /** Proporción de partículas base que se tiñen con el acento. */
  accentRatio?: number;
  /** Paso de muestreo mínimo en px; crece si se supera maxParticles. */
  step?: number;
  maxParticles?: number;
  /** Tamaño del punto en px CSS. */
  size?: number;
  /**
   * Fracción del paso de muestreo que ocupa cada punto. Si se indica,
   * sustituye a `size`: cuando el paso crece (pantallas grandes, para no
   * pasar de maxParticles) el punto crece con él y la forma conserva la
   * misma densidad visual.
   */
  fill?: number;
  /** Radio de repulsión del puntero en px CSS. */
  radius?: number;
  /** Distancia máxima de dispersión, en fracción del lado mayor. */
  scatterDistance?: number;
  /** Las partículas nacen dispersas y se ensamblan al empezar. */
  startScattered?: boolean;
  /** Elemento que recibe los eventos de puntero (por defecto, el canvas). */
  pointerTarget?: HTMLElement | Window;
  /** Sin animación: se dibuja el estado final y no hay bucle. */
  reduced?: boolean;
};

export type ParticleField = {
  setScatter: (amount: number) => void;
  burst: (clientX: number, clientY: number) => void;
  setPaused: (paused: boolean) => void;
  rebuild: () => void;
  destroy: () => void;
  readonly count: number;
};

type P = {
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  accent: boolean;
};

const SPRING = 0.045;
const DAMPING = 0.82;
const SLEEP_ENERGY = 0.02;

export function createParticleField(
  canvas: HTMLCanvasElement,
  opts: ParticleFieldOptions
): ParticleField {
  const ctx = canvas.getContext("2d");
  const {
    sample,
    baseColor,
    accentColor,
    accentRatio = 0.04,
    step: minStep = 4,
    maxParticles = 14000,
    size = 2,
    fill,
    radius = 90,
    scatterDistance = 0.35,
    startScattered = true,
    pointerTarget = canvas,
    reduced = false,
  } = opts;

  let particles: P[] = [];
  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = true;
  let paused = false;
  let destroyed = false;
  let scatter = 0;
  let firstBuild = true;
  let dot = size;
  const pointer = { x: -9999, y: -9999, active: false };

  // Un trazado por color: miles de rect() y un solo fill() cuestan mucho
  // menos que un fillRect por partícula. Los colores son opacos, así que
  // la unión de cuadrados se ve igual que pintarlos uno a uno.
  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = baseColor();
    ctx.beginPath();
    for (const p of particles) if (!p.accent) ctx.rect(p.x, p.y, dot, dot);
    ctx.fill();
    ctx.fillStyle = accentColor();
    const a = dot + 0.5;
    ctx.beginPath();
    for (const p of particles) if (p.accent) ctx.rect(p.x, p.y, a, a);
    ctx.fill();
  };

  const build = () => {
    if (!ctx || destroyed) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    if (w < 2 || h < 2) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const off = document.createElement("canvas");
    off.width = Math.ceil(w);
    off.height = Math.ceil(h);
    const o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return;
    sample(o, w, h);
    const data = o.getImageData(0, 0, off.width, off.height).data;

    // Paso adaptativo: nunca más de maxParticles.
    let opaque = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) opaque++;
    const estimate = opaque * 4; // muestreo 1 de cada 4 píxeles
    let step = minStep;
    while (estimate / (step * step) > maxParticles) step++;
    dot = fill ? step * fill : size;

    const maxD = Math.max(w, h) * scatterDistance;
    const prev = particles;
    const next: P[] = [];
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        const i = (y * off.width + x) * 4;
        if (data[i + 3] <= 128) continue;
        const isRed = data[i] > 200 && data[i + 1] < 60 && data[i + 2] < 60;
        const angle = Math.random() * Math.PI * 2;
        const dist = (0.35 + Math.random() * 0.65) * maxD;
        const old = prev[next.length];
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const born = firstBuild && startScattered;
        next.push({
          // En reconstrucciones se reutilizan posiciones: sin saltos al redimensionar.
          x: old ? old.x : born ? x + dx : x,
          y: old ? old.y : born ? y + dy : y,
          hx: x,
          hy: y,
          vx: 0,
          vy: 0,
          dx,
          dy,
          accent: isRed || Math.random() < accentRatio,
        });
      }
    }
    particles = next;
    firstBuild = false;

    if (reduced) {
      for (const p of particles) {
        p.x = p.hx;
        p.y = p.hy;
      }
      draw();
      return;
    }
    wake();
  };

  const tick = () => {
    raf = 0;
    if (destroyed || !visible || paused) return;
    let energy = 0;
    const r2 = radius * radius;
    for (const p of particles) {
      const tx = p.hx + p.dx * scatter;
      const ty = p.hy + p.dy * scatter;
      if (pointer.active) {
        const ox = p.x - pointer.x;
        const oy = p.y - pointer.y;
        const d2 = ox * ox + oy * oy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / radius) * 6;
          p.vx += (ox / d) * f;
          p.vy += (oy / d) * f;
        }
      }
      p.vx = (p.vx + (tx - p.x) * SPRING) * DAMPING;
      p.vy = (p.vy + (ty - p.y) * SPRING) * DAMPING;
      p.x += p.vx;
      p.y += p.vy;
      energy += Math.abs(p.vx) + Math.abs(p.vy);
    }
    draw();
    // Reposo: todo quieto y sin puntero encima → el bucle se duerme.
    if (!pointer.active && energy / (particles.length || 1) < SLEEP_ENERGY) return;
    raf = requestAnimationFrame(tick);
  };

  function wake() {
    if (!raf && !reduced && !destroyed && visible && !paused) raf = requestAnimationFrame(tick);
  }

  const toLocal = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top, inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom };
  };

  const onMove = (e: Event) => {
    const ev = e as PointerEvent;
    if (ev.pointerType && ev.pointerType !== "mouse") return;
    const { x, y, inside } = toLocal(ev.clientX, ev.clientY);
    pointer.x = x;
    pointer.y = y;
    pointer.active = inside;
    if (inside) wake();
  };
  const onLeave = () => {
    pointer.active = false;
    pointer.x = pointer.y = -9999;
  };

  const burst = (clientX: number, clientY: number) => {
    const { x, y } = toLocal(clientX, clientY);
    const R = radius * 3;
    for (const p of particles) {
      const ox = p.x - x;
      const oy = p.y - y;
      const d = Math.sqrt(ox * ox + oy * oy) || 1;
      const f = Math.max(0, 1 - d / R) * 28;
      p.vx += (ox / d) * f;
      p.vy += (oy / d) * f;
    }
    wake();
  };
  const onDown = (e: Event) => {
    const ev = e as PointerEvent;
    const { inside } = toLocal(ev.clientX, ev.clientY);
    if (inside) burst(ev.clientX, ev.clientY);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  io.observe(canvas);

  let resizeT: ReturnType<typeof setTimeout> | undefined;
  let lastW = 0;
  const ro = new ResizeObserver(([entry]) => {
    // Ignora cambios solo de alto (barra del navegador móvil).
    const nw = Math.round(entry.contentRect.width);
    if (nw === lastW && particles.length) return;
    lastW = nw;
    clearTimeout(resizeT);
    resizeT = setTimeout(build, 150);
  });
  ro.observe(canvas);

  if (!reduced) {
    pointerTarget.addEventListener("pointermove", onMove, { passive: true });
    pointerTarget.addEventListener("pointerdown", onDown, { passive: true });
    if (pointerTarget instanceof HTMLElement) pointerTarget.addEventListener("pointerleave", onLeave);
    else document.documentElement.addEventListener("pointerleave", onLeave);
  }

  (document.fonts?.ready ?? Promise.resolve()).then(build);

  return {
    setScatter(amount: number) {
      if (amount === scatter) return;
      scatter = amount;
      wake();
    },
    burst,
    setPaused(next: boolean) {
      paused = next;
      if (!paused) wake();
    },
    rebuild: build,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      io.disconnect();
      ro.disconnect();
      pointerTarget.removeEventListener("pointermove", onMove);
      pointerTarget.removeEventListener("pointerdown", onDown);
      if (pointerTarget instanceof HTMLElement) pointerTarget.removeEventListener("pointerleave", onLeave);
      else document.documentElement.removeEventListener("pointerleave", onLeave);
    },
    get count() {
      return particles.length;
    },
  };
}
