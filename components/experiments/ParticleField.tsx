"use client";

import { useEffect, useRef, useState } from "react";

type P = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; red: boolean };

/**
 * EXP—01 · Campo tipográfico de partículas (Canvas 2D).
 * La palabra se muestrea en un canvas oculto; cada punto vuelve a su
 * posición con un muelle y el puntero lo repele.
 *  - Se pausa fuera de pantalla y con el botón (WCAG 2.2.2).
 *  - Con prefers-reduced-motion se dibuja estático.
 *  - En pantallas pequeñas usa menos partículas.
 */
export default function ParticleField({
  word = "BUILD",
  pauseLabel,
  playLabel,
}: {
  word?: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue("--color-paper").trim() || "#f0efe9";
    const signal = styles.getPropertyValue("--color-signal").trim() || "#e52b25";
    const font = styles.getPropertyValue("--font-anton").trim() || "Impact";

    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Muestreo de la palabra
      const off = document.createElement("canvas");
      off.width = Math.round(w);
      off.height = Math.round(h);
      const o = off.getContext("2d")!;
      const size = Math.min(h * 0.82, (w / word.length) * 1.75);
      o.fillStyle = "#000";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `${size}px ${font}, Impact, sans-serif`;
      o.fillText(word, w / 2, h / 2 + size * 0.04);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const step = w < 640 ? 6 : 4;
      const next: P[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) {
            next.push({
              x: Math.random() * w,
              y: Math.random() * h,
              hx: x,
              hy: y,
              vx: 0,
              vy: 0,
              red: Math.random() < 0.06,
            });
          }
        }
      }
      particles = next;
      if (reduce) {
        particles.forEach((p) => {
          p.x = p.hx;
          p.y = p.hy;
        });
        draw();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const s = w < 640 ? 2.5 : 2;
      ctx.fillStyle = paper;
      for (const p of particles) if (!p.red) ctx.fillRect(p.x, p.y, s, s);
      ctx.fillStyle = signal;
      for (const p of particles) if (p.red) ctx.fillRect(p.x, p.y, s + 1, s + 1);
    };

    const R = 90;
    const step = () => {
      raf = 0;
      if (!visible || pausedRef.current) return;
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (pointer.active && d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) * 6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.hx - p.x) * 0.045;
        p.vy += (p.hy - p.y) * 0.045;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    // Toque: dispersión radial desde el punto.
    const onDown = (e: PointerEvent) => {
      onMove(e);
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 1 - d / (R * 3)) * 28;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      if (e.pointerType !== "mouse") setTimeout(onLeave, 200);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    let resizeT: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT);
      resizeT = setTimeout(build, 120);
    });
    ro.observe(canvas);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    (document.fonts?.ready ?? Promise.resolve()).then(build);

    // Reanudar desde el botón
    const resume = () => start();
    canvas.addEventListener("exp:resume", resume);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearTimeout(resizeT);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("exp:resume", resume);
    };
  }, [word]);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) canvasRef.current?.dispatchEvent(new Event("exp:resume"));
  }, [paused]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-pan-y"
        role="img"
        aria-label={`"${word}" — interactive particles`}
        data-cursor="DRAG"
      />
      <button
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="label-mono absolute bottom-3 right-3 border border-paper/50 px-2 py-1 text-paper transition-colors hover:bg-paper hover:text-ink"
      >
        {paused ? playLabel : pauseLabel}
      </button>
    </div>
  );
}
