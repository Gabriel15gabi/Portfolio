"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { prefersReducedMotion } from "@/lib/env";
import { NET, paramCount } from "@/lib/ai/config";
import { useLabLoop } from "./useLabLoop";
import { ExpBar, LabButton, Stat } from "./LabUI";
import type { NeuralEngine, NeuralStats } from "./neural-engine";

const PARAMS = paramCount(NET.freqs, NET.hidden);

/**
 * EXP—01 · La red aprende a dibujar.
 * La interfaz se renderiza en el servidor; el motor (red + dibujo)
 * se descarga aparte al montar y corre solo con el experimento a la vista.
 */
export default function NeuralLab({ code }: { code: string }) {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NeuralEngine | null>(null);
  const [stats, setStats] = useState<NeuralStats | null>(null);

  const word = t("exp.net.word");
  const words = [word, "GR", "</>"];
  const nf = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US");
  const df = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  const pf = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const create = useEffectEvent(async (canvas: HTMLCanvasElement, alive: () => boolean) => {
    const { createNeuralEngine } = await import("./neural-engine");
    if (!alive()) return null;
    return createNeuralEngine(canvas, {
      words,
      spark: sparkRef.current,
      reduced: prefersReducedMotion(),
      onStats: setStats,
    });
  });

  // El motor llega tras un import asíncrono: si el idioma cambió mientras
  // tanto (p. ej. preferencia guardada en inglés), se le aplica al llegar.
  const sync = useEffectEvent((e: NeuralEngine) => e.setWords([word, "GR", "</>"]));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let engine: NeuralEngine | null = null;
    create(canvas, () => alive).then((e) => {
      engine = e;
      engineRef.current = e;
      if (e) sync(e);
    });
    return () => {
      alive = false;
      engine?.destroy();
      engineRef.current = null;
    };
  }, []);

  // Cambiar de idioma cambia la palabra (IA ↔ AI) sin perder lo aprendido.
  useEffect(() => {
    engineRef.current?.setWords([word, "GR", "</>"]);
  }, [word]);

  useLabLoop(stageRef, playing, (dt, now) => engineRef.current?.frame(dt, now));

  const status = stats?.status ?? "learning";
  const statusText =
    status === "learned" ? `✓ ${t("exp.net.learned")}` : `${t(status === "yours" ? "exp.net.yours" : "exp.net.learning")}…`;

  return (
    <article aria-labelledby="exp-net" className="grid grid-cols-1 border-b border-line md:grid-cols-12">
      <div className="flex flex-col md:col-span-8 md:border-r md:border-line">
        <ExpBar code={code} medium={t("exp.net.medium")} live={t("exp.live")} playing={playing} />
        <div ref={stageRef} className="relative aspect-[8/5] bg-ink">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={t("exp.net.aria")}
            className="absolute inset-0 block h-full w-full touch-pan-y"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 md:col-span-4 md:px-6 lg:px-8">
        <div>
          <h3 id="exp-net" className="display text-[clamp(2.4rem,4vw,4.4rem)] leading-[0.86]">
            {t("exp.net.title")}
          </h3>
          <p className="mt-4 max-w-[40ch] text-base leading-snug text-muted">
            {t("exp.net.desc").replace("{n}", nf.format(PARAMS))}
          </p>
        </div>

        <dl className="grid grid-cols-2 border-l border-t border-line">
          <Stat label={t("exp.net.step")} value={stats ? nf.format(stats.step) : "0"} />
          <Stat label={t("exp.net.acc")} value={stats ? pf.format(stats.accuracy) : "—"} accent />
          <Stat label={t("exp.net.loss")} value={stats ? df.format(stats.loss) : "—"} />
          <Stat label={t("exp.net.params")} value={nf.format(PARAMS)} />
        </dl>

        <div>
          <p className="label-mono flex justify-between gap-4">
            <span className="text-muted">{t("exp.net.loss")} ↘</span>
            <span aria-live="polite" className={status === "learned" ? "text-accent" : ""}>
              {statusText}
            </span>
          </p>
          <canvas ref={sparkRef} aria-hidden className="mt-2 block h-12 w-full" />
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {words.map((w, i) => (
            <LabButton key={i} pressed={stats?.preset === i} onClick={() => engineRef.current?.setPreset(i)}>
              {w}
            </LabButton>
          ))}
          <LabButton onClick={() => engineRef.current?.clear()}>{t("exp.net.clear")}</LabButton>
          <LabButton onClick={() => engineRef.current?.reset()}>{t("exp.net.reset")}</LabButton>
          <LabButton pressed={!playing} onClick={() => setChoice(!playing)}>
            {playing ? t("exp.pause") : t("exp.play")}
          </LabButton>
        </div>
      </div>
    </article>
  );
}
