/* ──────────────────────────────────────────────────────────
   EXP—03 · Automatización con IA (dibujo + simulación del flujo)
   Los mensajes entran por la izquierda, el clasificador bayesiano
   (lib/ai/inbox) los lee de verdad y cada uno sale por su carril:
   presupuesto, soporte o spam. Si la IA duda (< 50 %), el mensaje
   va a revisión humana. El visitante puede escribir el suyo.
   ────────────────────────────────────────────────────────── */

import { Classifier, POOL, type Label } from "@/lib/ai/inbox";
import { cssVar } from "@/lib/env";

export type Route = Label | "review";
export const ROUTES: Route[] = ["quote", "support", "spam", "review"];

export type FlowEntry = { id: number; text: string; user: boolean; route: Route; confidence: number; lang: "es" | "en" };
export type FlowStats = { processed: number; counts: Record<Route, number> };
export type FlowLabels = Record<"inbox" | "channels" | "ai" | Route, string>;
export type FlowEngine = ReturnType<typeof createFlowEngine>;

type Packet = {
  id: number;
  text: string;
  user: boolean;
  route: Route;
  probs: number[];
  confidence: number;
  stage: 0 | 1 | 2; // 0 hacia la IA · 1 pensando · 2 hacia su carril
  d: number;
  until: number;
};

type Pt = { x: number; y: number };

const SPEED = 0.34; // anchos de lienzo por segundo
const THINK_MS = 700;
const SPAWN_MS = 1900;
const LANES: Record<Route, number> = { quote: 0.14, support: 0.38, spam: 0.62, review: 0.86 };
const BOX = {
  inbox: { x: 0.03, y: 0.39, w: 0.19, h: 0.22 },
  ai: { x: 0.31, y: 0.29, w: 0.2, h: 0.42 },
};
const BUS_X = 0.585;
const OUT_X = 0.645;
const OUT_W = 0.33;
const OUT_H = 0.18;

function along(path: Pt[], d: number) {
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= len) return { x: a.x + ((b.x - a.x) * d) / len, y: a.y + ((b.y - a.y) * d) / len, done: false };
    d -= len;
  }
  const last = path[path.length - 1];
  return { x: last.x, y: last.y, done: true };
}

export function createFlowEngine(
  canvas: HTMLCanvasElement,
  opts: {
    lang: "es" | "en";
    labels: FlowLabels;
    onLog: (e: FlowEntry) => void;
    onStats: (s: FlowStats) => void;
  }
) {
  const ctx = canvas.getContext("2d");
  const nb = new Classifier();
  const paper = cssVar("--color-paper") || "#f0efe9";
  const color: Record<Route, string> = {
    quote: cssVar("--color-signal") || "#e52b25",
    support: cssVar("--color-warning") || "#f3d94b",
    spam: cssVar("--color-concrete") || "#c6c5bf",
    review: paper,
  };
  const mono = cssVar("--font-plex-mono") || "monospace";
  const display = cssVar("--font-anton") || "Impact";

  let lang = opts.lang;
  let labels = opts.labels;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let destroyed = false;
  let nextId = 1;
  let spawnAcc = SPAWN_MS * 0.6;
  let order: number[] = [];
  let aiBusyUntil = 0;
  let shown: Packet | null = null; // último mensaje que pasó por la IA
  const packets: Packet[] = [];
  const flash: Record<Route, number> = { quote: 0, support: 0, spam: 0, review: 0 };
  const counts: Record<Route, number> = { quote: 0, support: 0, spam: 0, review: 0 };
  let processed = 0;

  let inPath: Pt[] = [];
  const outPath = {} as Record<Route, Pt[]>;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const cy = 0.5 * h;
    inPath = [
      { x: (BOX.inbox.x + BOX.inbox.w) * w, y: cy },
      { x: BOX.ai.x * w, y: cy },
    ];
    for (const r of Object.keys(LANES) as Route[]) {
      outPath[r] = [
        { x: (BOX.ai.x + BOX.ai.w) * w, y: cy },
        { x: BUS_X * w, y: cy },
        { x: BUS_X * w, y: LANES[r] * h },
        { x: OUT_X * w, y: LANES[r] * h },
      ];
    }
    draw(performance.now());
  };

  const font = (px: number, family = mono) => `500 ${px}px ${family}, monospace`;

  function draw(now: number) {
    if (!ctx || !w) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const fs = Math.max(9, Math.min(12, w * 0.021));
    const pad = Math.max(6, w * 0.014);

    // Conectores con trazo que avanza: el flujo está vivo.
    ctx.strokeStyle = "rgba(240, 239, 233, 0.32)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.lineDashOffset = -now / 45;
    ctx.beginPath();
    ctx.moveTo(inPath[0].x, inPath[0].y);
    ctx.lineTo(inPath[1].x, inPath[1].y);
    for (const r of ROUTES) {
      const p = outPath[r];
      ctx.moveTo(p[0].x, p[0].y);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textBaseline = "top";
    // Entrada
    const ib = BOX.inbox;
    ctx.strokeStyle = "rgba(240, 239, 233, 0.6)";
    ctx.strokeRect(ib.x * w + 0.5, ib.y * h + 0.5, ib.w * w, ib.h * h);
    ctx.fillStyle = paper;
    ctx.font = font(fs);
    ctx.fillText(labels.inbox.toUpperCase(), ib.x * w + pad, ib.y * h + pad);
    ctx.fillStyle = "rgba(240, 239, 233, 0.5)";
    ctx.fillText(labels.channels, ib.x * w + pad, ib.y * h + pad + fs * 1.5);

    // IA: borde rojo mientras piensa y barras de probabilidad reales.
    const ab = BOX.ai;
    const thinking = now < aiBusyUntil;
    ctx.strokeStyle = thinking ? color.quote : paper;
    ctx.lineWidth = thinking ? 2.5 : 1.5;
    ctx.strokeRect(ab.x * w + 0.5, ab.y * h + 0.5, ab.w * w, ab.h * h);
    ctx.lineWidth = 1.5;
    ctx.fillStyle = paper;
    const big = Math.min(ab.h * h * 0.42, ab.w * w * 0.42);
    ctx.font = `${big}px ${display}, Impact, sans-serif`;
    ctx.fillText(labels.ai.toUpperCase(), ab.x * w + pad, ab.y * h + pad);
    if (shown && ab.w * w > 120) {
      // Lo que la IA está leyendo, en pequeño.
      ctx.font = font(fs - 1);
      ctx.fillStyle = "rgba(240, 239, 233, 0.62)";
      const perLine = Math.max(8, Math.floor((ab.w * w - pad * 2) / ((fs - 1) * 0.6)));
      const words = shown.text.split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const word of words) {
        if ((cur + " " + word).trim().length > perLine) {
          lines.push(cur);
          cur = word;
        } else cur = (cur + " " + word).trim();
      }
      lines.push(cur);
      const ty = ab.y * h + pad + big * 0.95;
      lines.slice(0, 3).forEach((line, k) => {
        const text = k === 2 && lines.length > 3 ? `${line.slice(0, perLine - 1)}…` : line;
        ctx.fillText(text, ab.x * w + pad, ty + k * fs * 1.3);
      });
    }
    if (shown) {
      const bw = ab.w * w - pad * 2;
      const bh = Math.max(3, ab.h * h * 0.07);
      const by = ab.y * h + ab.h * h - pad - bh * 3 - 6;
      shown.probs.forEach((p, i) => {
        const y = by + i * (bh + 3);
        ctx.fillStyle = "rgba(240, 239, 233, 0.12)";
        ctx.fillRect(ab.x * w + pad, y, bw, bh);
        ctx.fillStyle = color[(["quote", "support", "spam"] as Route[])[i]];
        ctx.fillRect(ab.x * w + pad, y, bw * p, bh);
      });
    }

    // Carriles de salida
    for (const r of ROUTES) {
      const y = LANES[r] * h - (OUT_H * h) / 2;
      const f = Math.max(0, 1 - (now - flash[r]) / 600);
      if (f > 0) {
        ctx.globalAlpha = f * 0.35;
        ctx.fillStyle = color[r];
        ctx.fillRect(OUT_X * w, y, OUT_W * w, OUT_H * h);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = f > 0 ? color[r] : "rgba(240, 239, 233, 0.4)";
      ctx.strokeRect(OUT_X * w + 0.5, y + 0.5, OUT_W * w, OUT_H * h);
      ctx.fillStyle = color[r];
      ctx.fillRect(OUT_X * w + pad, LANES[r] * h - 3, 6, 6);
      ctx.fillStyle = paper;
      ctx.font = font(fs);
      ctx.textBaseline = "middle";
      ctx.fillText(labels[r].toUpperCase(), OUT_X * w + pad + 12, LANES[r] * h);
      ctx.textAlign = "right";
      ctx.fillText(String(counts[r]).padStart(2, "0"), (OUT_X + OUT_W) * w - pad, LANES[r] * h);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
    }

    // Mensajes en tránsito
    const size = Math.max(6, w * 0.013);
    for (const p of packets) {
      let pt: Pt;
      if (p.stage === 0) pt = along(inPath, p.d);
      else if (p.stage === 1) pt = { x: (ab.x + ab.w / 2) * w, y: 0.5 * h + ab.h * h * 0.1 };
      else pt = along(outPath[p.route], p.d);
      const c = p.stage === 2 ? color[p.route] : paper;
      if (p.stage === 1) {
        // Pensando: el píxel parpadea.
        ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(now / 90));
      }
      if (p.stage === 2 && p.route === "review") {
        ctx.strokeStyle = c;
        ctx.strokeRect(pt.x - size / 2, pt.y - size / 2, size, size);
      } else {
        ctx.fillStyle = c;
        ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
      }
      if (p.user) {
        ctx.strokeStyle = paper;
        ctx.strokeRect(pt.x - size, pt.y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  const classify = (text: string, user: boolean): Packet => {
    const r = nb.predict(text);
    return {
      id: nextId++,
      text,
      user,
      route: r.sure ? r.label : "review",
      probs: r.probs,
      confidence: r.confidence,
      stage: 0,
      d: 0,
      until: 0,
    };
  };

  const spawn = () => {
    const pool = POOL[lang];
    if (!order.length) {
      order = pool.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    packets.push(classify(pool[order.pop()!], false));
  };

  const frame = (dt: number, now: number) => {
    if (destroyed) return;
    spawnAcc += dt;
    if (spawnAcc >= SPAWN_MS) {
      spawnAcc = 0;
      if (packets.length < 6) spawn();
    }
    const move = (dt / 1000) * SPEED * w;
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      if (p.stage === 0) {
        p.d += move;
        if (along(inPath, p.d).done && now >= aiBusyUntil) {
          p.stage = 1;
          p.until = now + THINK_MS;
          aiBusyUntil = p.until;
          shown = p;
        }
      } else if (p.stage === 1) {
        if (now >= p.until) {
          p.stage = 2;
          p.d = 0;
        }
      } else {
        p.d += move;
        if (along(outPath[p.route], p.d).done) {
          packets.splice(i, 1);
          flash[p.route] = now;
          counts[p.route]++;
          processed++;
          opts.onLog({ id: p.id, text: p.text, user: p.user, route: p.route, confidence: p.confidence, lang });
          opts.onStats({ processed, counts: { ...counts } });
        }
      }
    }
    draw(now);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  opts.onStats({ processed, counts: { ...counts } });

  return {
    frame,
    send(text: string) {
      const clean = text.trim().slice(0, 140);
      if (!clean) return;
      packets.push(classify(clean, true));
      draw(performance.now());
    },
    setLang(next: "es" | "en", nextLabels: FlowLabels) {
      if (next !== lang) {
        // Los mensajes de ejemplo que iban por el flujo eran del otro idioma:
        // fuera, y que entre pronto uno nuevo. Los del visitante se quedan.
        order = [];
        for (let i = packets.length - 1; i >= 0; i--) if (!packets[i].user) packets.splice(i, 1);
        if (shown && !shown.user) shown = null;
        spawnAcc = SPAWN_MS * 0.6;
      }
      lang = next;
      labels = nextLabels;
      draw(performance.now());
    },
    destroy() {
      destroyed = true;
      ro.disconnect();
    },
  };
}
