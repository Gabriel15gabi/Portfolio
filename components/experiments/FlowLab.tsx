"use client";

import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useLabLoop } from "./useLabLoop";
import { ExpBar, LabButton } from "./LabUI";
import type { FlowEngine, FlowEntry, FlowLabels, FlowStats, Route } from "./flow-engine";

const DOT: Record<Route, string> = {
  quote: "bg-signal",
  support: "bg-warning",
  spam: "bg-concrete",
  review: "border border-paper",
};

/** EXP—03 · Automatización con IA (clasificador bayesiano + flujo). */
export default function FlowLab({ code }: { code: string }) {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FlowEngine | null>(null);
  const [log, setLog] = useState<FlowEntry[]>([]);
  const [stats, setStats] = useState<FlowStats | null>(null);
  const [draft, setDraft] = useState("");
  const [announce, setAnnounce] = useState("");

  const labels: FlowLabels = {
    inbox: t("exp.flow.inbox"),
    channels: t("exp.flow.channels"),
    ai: t("exp.flow.ai"),
    quote: t("exp.flow.quote"),
    support: t("exp.flow.support"),
    spam: t("exp.flow.spam"),
    review: t("exp.flow.review"),
  };
  const pf = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", { style: "percent", maximumFractionDigits: 0 });

  const onLog = useEffectEvent((e: FlowEntry) => {
    setLog((prev) => [e, ...prev].slice(0, 4));
    if (e.user) setAnnounce(`${t("exp.flow.you")}: ${labels[e.route]} — ${pf.format(e.confidence)}`);
  });

  const create = useEffectEvent(async (canvas: HTMLCanvasElement, alive: () => boolean) => {
    const { createFlowEngine } = await import("./flow-engine");
    if (!alive()) return null;
    return createFlowEngine(canvas, { lang, labels, onLog: (e) => onLog(e), onStats: setStats });
  });

  const syncLang = useEffectEvent(() => engineRef.current?.setLang(lang, labels));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let engine: FlowEngine | null = null;
    create(canvas, () => alive).then((e) => {
      engine = e;
      engineRef.current = e;
      // El motor llega tras un import asíncrono: aplica el idioma actual.
      if (e) syncLang();
    });
    return () => {
      alive = false;
      engine?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    syncLang();
  }, [lang]);
  // Solo los mensajes del idioma activo (los del visitante siempre se ven).
  const visible = log.filter((e) => e.user || e.lang === lang);

  useLabLoop(stageRef, playing, (dt, now) => engineRef.current?.frame(dt, now));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    engineRef.current?.send(draft);
    setDraft("");
    // Enviar un mensaje es pedir movimiento: el flujo arranca si estaba en pausa.
    if (!playing) setChoice(true);
  };

  return (
    <article aria-labelledby="exp-flow" className="flex flex-col border-b border-line md:col-span-6">
      <ExpBar code={code} medium={t("exp.flow.medium")} live={t("exp.live")} playing={playing} />
      <div ref={stageRef} className="relative aspect-[8/5] bg-ink">
        <canvas ref={canvasRef} role="img" aria-label={t("exp.flow.aria")} className="absolute inset-0 block h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 md:px-6 lg:px-8">
        <div>
          <h3 id="exp-flow" className="display text-[clamp(2.2rem,3.4vw,3.8rem)] leading-[0.86]">
            {t("exp.flow.title")}
          </h3>
          <p className="mt-4 max-w-[44ch] text-base leading-snug text-muted">{t("exp.flow.desc")}</p>
        </div>

        <form onSubmit={submit} className="flex border border-line focus-within:border-fg">
          <label htmlFor="flow-input" className="sr-only">
            {t("exp.flow.input")}
          </label>
          <input
            id="flow-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={140}
            autoComplete="off"
            placeholder={t("exp.flow.placeholder")}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            data-cursor={t("cursor.send")}
            className="label-mono shrink-0 border-l border-line px-4 transition-colors hover:bg-fg hover:text-bg"
          >
            {t("exp.flow.send")} →
          </button>
        </form>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>

        <div>
          <p className="label-mono flex justify-between border-b border-line pb-2 text-muted">
            <span>{t("exp.flow.processed")}</span>
            <span className="tabular-nums text-fg">{String(stats?.processed ?? 0).padStart(3, "0")}</span>
          </p>
          <ol className="min-h-[9.5rem]">
            {visible.map((e) => (
              <li key={e.id} className="flex items-baseline gap-3 border-b border-line py-2 text-sm">
                <span className={`h-2 w-2 shrink-0 ${DOT[e.route]}`} aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  {e.user && <span className="label-mono mr-2 bg-paper px-1 text-ink">{t("exp.flow.you")}</span>}
                  {e.text}
                </span>
                <span className="label-mono shrink-0 text-muted">
                  {labels[e.route]} · {pf.format(e.confidence)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <LabButton pressed={!playing} onClick={() => setChoice(!playing)}>
            {playing ? t("exp.pause") : t("exp.play")}
          </LabButton>
        </div>
      </div>
    </article>
  );
}
