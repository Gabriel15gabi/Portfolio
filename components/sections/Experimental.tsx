"use client";

import dynamic from "next/dynamic";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { EXPERIMENTS, type Experiment } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

// El canvas solo se carga en cliente y en su propio chunk.
const ParticleField = dynamic(() => import("@/components/experiments/ParticleField"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

type T = (k: string) => string;

function StatusTag({ status, t }: { status: Experiment["status"]; t: T }) {
  return status === "live" ? (
    <span className="label-mono inline-flex items-center gap-2 bg-signal px-2 py-1 text-paper">
      <span className="h-1.5 w-1.5 bg-paper animate-blink" aria-hidden />
      {t("exp.live")}
    </span>
  ) : (
    <span className="label-mono inline-flex bg-warning px-2 py-1 text-ink">{t("exp.slot")}</span>
  );
}

function SlotCell({ e, t }: { e: Experiment; t: T }) {
  return (
    <li
      className="group/slot relative flex min-h-[180px] flex-col justify-between gap-6 border-t border-line p-4 md:p-6"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, transparent 0 10px, color-mix(in srgb, var(--fg) 6%, transparent) 10px 11px)",
      }}
    >
      <div className="label-mono flex items-center justify-between">
        <span className="text-muted">{e.code}</span>
        <StatusTag status={e.status} t={t} />
      </div>
      <div>
        <h3 className="display text-[clamp(2.2rem,4.4vw,4.4rem)] leading-none text-muted transition-colors duration-300 group-hover/slot:text-fg">
          {t(e.titleKey)}
        </h3>
        <p className="label-mono mt-3 flex justify-between gap-4 text-muted">
          <span>{e.medium}</span>
          <span>{t("exp.slotSub")}</span>
        </p>
      </div>
    </li>
  );
}

export default function Experimental() {
  const { t } = useLanguage();
  const live = EXPERIMENTS.filter((e) => e.status === "live");
  const slots = EXPERIMENTS.filter((e) => e.status === "slot");

  return (
    <section id="lab" data-theme="dark" aria-labelledby="lab-title" className="relative overflow-clip pb-20 md:pb-32">
      <SectionHeader num="02" title="Experimental Zone" label={t("exp.label")} meta="Canvas · WebGL · AI" id="lab-title" />

      <div className="mt-12 grid gap-10 px-4 sm:px-8 md:mt-16 md:grid-cols-12 lg:px-12">
        <p className="text-lg leading-snug md:col-span-5 md:text-xl">{t("exp.intro")}</p>
        <p className="label-mono text-muted md:col-span-3 md:col-start-10">
          {String(live.length).padStart(2, "0")} {t("exp.live")} / {String(EXPERIMENTS.length).padStart(2, "0")}
        </p>
      </div>

      <div className="mt-12 grid border-y border-line px-0 md:mt-16 md:grid-cols-12">
        {live.map((e) => (
          <article
            key={e.id}
            aria-labelledby={`exp-${e.id}`}
            className="relative flex flex-col border-line md:col-span-8 md:border-r"
          >
            <div className="label-mono flex items-center justify-between px-4 py-3 sm:px-8 lg:px-12">
              <span>
                <span className="text-accent">{e.code}</span> — {e.medium}
              </span>
              <StatusTag status={e.status} t={t} />
            </div>
            <Reveal variant="clip" className="relative aspect-[4/3] bg-ink md:aspect-[16/10]">
              <div
                aria-hidden
                className="grid-lines pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{ ["--line" as string]: "var(--color-paper)" }}
              />
              <ParticleField word="BUILD" pauseLabel={t("exp.pause")} playLabel={t("exp.play")} />
            </Reveal>
            <div className="flex flex-col gap-2 px-4 py-4 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
              <h3 id={`exp-${e.id}`} className="display text-[clamp(2.4rem,5vw,5rem)] leading-none">
                {t(e.titleKey)}
              </h3>
              <p className="label-mono max-w-[32ch] text-muted md:text-right">{t("exp.particlesHint")}</p>
            </div>
          </article>
        ))}

        <ul className="flex flex-col md:col-span-4 [&>li:first-child]:border-t-0">
          {slots.map((e) => (
            <SlotCell key={e.id} e={e} t={t} />
          ))}
        </ul>
      </div>
    </section>
  );
}
