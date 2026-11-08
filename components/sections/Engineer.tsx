"use client";

import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal, { Line } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Kinetic";
import { PROFILE, STACK, type StackItem } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

/**
 * 03 · Quién soy / The Engineer.
 * Retrato + una frase que lo resume todo + la web por capas: cada
 * capa es una palabra enorme, una idea corta y sus herramientas.
 */
export default function Engineer() {
  const { t, lang } = useLanguage();
  const name = (it: StackItem) => (typeof it === "string" ? it : it[lang]);
  const total = STACK.reduce((n, c) => n + c.items.length, 0);

  return (
    <section id="engineer" data-theme="light" aria-labelledby="eng-title" className="relative overflow-clip pb-20 md:pb-32">
      <SectionHeader num="03" title={t("eng.title")} label={t("eng.label")} meta={t("eng.meta")} id="eng-title" />

      <div className="mt-12 grid gap-10 px-4 sm:px-8 md:mt-20 md:grid-cols-12 md:gap-x-6 lg:px-12">
        {/* Retrato con tratamiento duotono */}
        <figure className="relative md:col-span-5 lg:col-span-4">
          <Parallax speed={0.12}>
            <Reveal variant="clip" className="relative aspect-[4/5] overflow-hidden bg-ink md:aspect-[3/4]">
              <Image
                src={PROFILE.portrait}
                alt={t("eng.portrait")}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 42vw, 100vw"
                className="object-cover grayscale contrast-125"
              />
              {/* Duotono: la sombra se tiñe de rojo de señal */}
              <div aria-hidden className="absolute inset-0 bg-signal mix-blend-lighten" />
              <div aria-hidden className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
            </Reveal>
          </Parallax>
          <figcaption className="label-mono mt-3 flex justify-between gap-4 border-t border-fg pt-2">
            <span>
              {t("eng.fig")} — {PROFILE.name}
            </span>
            <span className="text-muted">{PROFILE.location[lang]}</span>
          </figcaption>
        </figure>

        {/* La frase: del píxel al servidor */}
        <div className="flex flex-col justify-end md:col-span-7 md:col-start-6 lg:col-span-8 lg:col-start-5 lg:pl-[3vw]">
          <Reveal as="p" className="display text-[clamp(min(3.2rem,14vw),8.6vw,10.5rem)] leading-[0.84]">
            <Line>{t("eng.statement1")}</Line>
            <Line>
              <span className="text-outline">{t("eng.statement2").replace(/\.$/, "")}</span>
              <span className="text-accent">.</span>
            </Line>
          </Reveal>
          <p className="mt-8 max-w-[32ch] text-xl leading-snug md:mt-10 md:text-2xl">{t("eng.sub")}</p>
        </div>
      </div>

      {/* La web, por capas */}
      <div className="mt-20 px-4 sm:px-8 md:mt-32 lg:px-12">
        <p className="label-mono flex justify-between gap-4 border-t-2 border-fg pt-3">
          <span>
            <span className="text-accent">§</span> {t("eng.layers")}
          </span>
          <span className="text-muted">
            {total} {t("eng.tools")}
          </span>
        </p>
        <ol className="mt-2">
          {STACK.map((layer, i) => (
            <li
              key={layer.key}
              className="group/layer relative isolate grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-3 border-b border-fg py-5 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[3rem_minmax(0,1.15fr)_minmax(0,0.75fr)_minmax(0,1.1fr)] lg:py-6"
            >
              {/* Barra roja que barre la capa al pasar */}
              <span
                aria-hidden
                className="absolute inset-y-0 -left-4 -right-4 -z-10 origin-left scale-x-0 bg-signal transition-transform duration-500 ease-[var(--ease-expo)] group-hover/layer:scale-x-100 sm:-left-8 sm:-right-8 lg:-left-12 lg:-right-12"
              />
              <span className="label-mono text-accent transition-colors group-hover/layer:text-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display text-[clamp(min(3rem,15vw),7.4vw,8.4rem)] leading-[0.8] transition-transform duration-500 ease-[var(--ease-expo)] group-hover/layer:translate-x-3">
                {t(`eng.layer.${layer.key}`)}
              </h3>
              <p className="col-start-2 text-lg font-medium leading-snug md:col-start-3 md:row-start-1 lg:text-xl">
                {t(`eng.layer.${layer.key}.tag`)}
              </p>
              <ul className="col-start-2 flex flex-wrap gap-1.5 md:col-start-3 lg:col-start-4 lg:row-start-1">
                {layer.items.map((it) => (
                  <li key={name(it)} className="label-mono border border-fg px-2 py-1">
                    {name(it)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
