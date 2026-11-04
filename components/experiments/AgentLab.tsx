"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { prefersReducedMotion } from "@/lib/env";
import { useLabLoop } from "./useLabLoop";
import { ExpBar, LabButton, Stat } from "./LabUI";
import type { AgentEngine, AgentStats } from "./agent-engine";

/** EXP—02 · Un agente aprende solo (Q-learning + Dyna-Q). */
export default function AgentLab({ code }: { code: string }) {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AgentEngine | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);

  const locale = lang === "es" ? "es-ES" : "en-US";
  const nf = new Intl.NumberFormat(locale);
  const pf = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });

  const create = useEffectEvent(async (canvas: HTMLCanvasElement, alive: () => boolean) => {
    const { createAgentEngine } = await import("./agent-engine");
    if (!alive()) return null;
    return createAgentEngine(canvas, { reduced: prefersReducedMotion(), onStats: setStats });
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let engine: AgentEngine | null = null;
    create(canvas, () => alive).then((e) => {
      engine = e;
      engineRef.current = e;
    });
    return () => {
      alive = false;
      engine?.destroy();
      engineRef.current = null;
    };
  }, []);

  useLabLoop(stageRef, playing, (dt, now) => engineRef.current?.frame(dt, now));

  return (
    <article aria-labelledby="exp-agent" className="flex flex-col border-b border-line md:col-span-6 md:border-r">
      <ExpBar code={code} medium={t("exp.agent.medium")} live={t("exp.live")} playing={playing} />
      <div ref={stageRef} className="relative aspect-[8/5] bg-ink">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t("exp.agent.aria")}
          className="absolute inset-0 block h-full w-full touch-pan-y"
        />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 md:px-6 lg:px-8">
        <div>
          <h3 id="exp-agent" className="display text-[clamp(2.2rem,3.4vw,3.8rem)] leading-[0.86]">
            {t("exp.agent.title")}
          </h3>
          <p className="mt-4 max-w-[44ch] text-base leading-snug text-muted">{t("exp.agent.desc")}</p>
        </div>
        <dl className="grid grid-cols-3 border-l border-t border-line">
          <Stat label={t("exp.agent.episodes")} value={stats ? nf.format(stats.episodes) : "0"} />
          <Stat label={t("exp.agent.mastery")} value={stats ? pf.format(stats.mastery) : "—"} accent />
          <Stat label={t("exp.agent.explore")} value={stats ? pf.format(stats.epsilon) : "—"} />
        </dl>
        <div className="mt-auto flex flex-wrap gap-2">
          <LabButton onClick={() => engineRef.current?.moveGoal()}>{t("exp.agent.goal")}</LabButton>
          <LabButton onClick={() => engineRef.current?.forget()}>{t("exp.agent.forget")}</LabButton>
          <LabButton pressed={!playing} onClick={() => setChoice(!playing)}>
            {playing ? t("exp.pause") : t("exp.play")}
          </LabButton>
        </div>
      </div>
    </article>
  );
}
