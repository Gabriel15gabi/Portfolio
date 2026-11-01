"use client";

import { useEffect, useRef, useState } from "react";
import { createParticleField, type ParticleField as Field } from "@/lib/particles";
import { cssVar, prefersReducedMotion } from "@/lib/env";

/**
 * EXP—01 · Campo tipográfico de partículas (Canvas 2D).
 *  - Se pausa fuera de pantalla, en reposo, y con el botón (WCAG 2.2.2).
 *  - Con prefers-reduced-motion se dibuja estático y sin botón.
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
  const fieldRef = useRef<Field | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isReduced = prefersReducedMotion();
    // Sincroniza la preferencia del sistema (oculta el botón de pausa).
    queueMicrotask(() => setReduced(isReduced));

    const font = cssVar("--font-anton") || "Impact";
    const field = createParticleField(canvas, {
      reduced: isReduced,
      step: 4,
      maxParticles: 12000,
      size: 2,
      accentRatio: 0.06,
      baseColor: () => cssVar("--color-paper") || "#f0efe9",
      accentColor: () => cssVar("--color-signal") || "#e52b25",
      sample: (o, w, h) => {
        const fontSize = Math.min(h * 0.82, (w / word.length) * 1.75);
        o.fillStyle = "#000";
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.font = `${fontSize}px ${font}, Impact, sans-serif`;
        o.fillText(word, w / 2, h / 2 + fontSize * 0.04);
      },
    });
    fieldRef.current = field;
    return () => {
      field.destroy();
      fieldRef.current = null;
    };
  }, [word]);

  useEffect(() => {
    fieldRef.current?.setPaused(paused);
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
      {!reduced && (
        <button
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="label-mono absolute bottom-3 right-3 border border-paper/50 px-2 py-1 text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          {paused ? playLabel : pauseLabel}
        </button>
      )}
    </div>
  );
}
