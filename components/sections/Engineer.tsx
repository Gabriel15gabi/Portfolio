"use client";

import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Kinetic";
import { PROFILE, STACK } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

const PILLARS = ["pillar1", "pillar2", "pillar3"];

export default function Engineer() {
  const { t, lang } = useLanguage();

  return (
    <section id="engineer" data-theme="light" aria-labelledby="eng-title" className="relative overflow-clip pb-20 md:pb-32">
      <SectionHeader num="03" title="The Engineer" label={t("eng.label")} meta="Frontend — Backend — AI" id="eng-title" />

      <div className="mt-12 grid gap-10 px-4 sm:px-8 md:mt-20 md:grid-cols-12 md:gap-x-6 lg:px-12">
        {/* Retrato con tratamiento duotono */}
        <figure className="relative md:col-span-4 md:row-span-2">
          <Parallax speed={0.12}>
            <Reveal variant="clip" className="relative aspect-[3/4] overflow-hidden bg-ink">
              <Image
                src={PROFILE.portrait}
                alt={t("eng.portrait")}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover grayscale contrast-125"
              />
              {/* Duotono: la sombra se tiñe de rojo de señal */}
              <div aria-hidden className="absolute inset-0 bg-signal mix-blend-lighten" />
              <div aria-hidden className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
            </Reveal>
          </Parallax>
          <figcaption className="label-mono mt-3 flex justify-between border-t border-fg pt-2">
            <span>Fig. 01 — {PROFILE.name}</span>
            <span className="text-muted">{PROFILE.location[lang]}</span>
          </figcaption>
        </figure>

        {/* Bio */}
        <div className="md:col-span-7 md:col-start-6">
          <p className="text-[clamp(1.5rem,2.8vw,2.8rem)] font-medium leading-[1.08] tracking-[-0.02em]">
            {t("eng.bio")}
          </p>

          <ol className="mt-12 grid gap-0 border-t-2 border-fg xl:grid-cols-3">
            {PILLARS.map((k, i) => (
              <li
                key={k}
                className="border-b border-fg py-5 xl:border-b-0 xl:border-r xl:px-5 xl:first:pl-0 xl:last:border-r-0"
              >
                <span className="label-mono text-accent">0{i + 1}</span>
                <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight">{t(`eng.${k}.title`)}</h3>
                <p className="mt-3 text-[0.95rem] leading-snug text-muted">{t(`eng.${k}.desc`)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Ficha técnica: stack por categorías, sin barras ni porcentajes */}
        <div className="md:col-span-7 md:col-start-6">
          <p className="label-mono mt-8 flex justify-between border-t-2 border-fg pt-3 md:mt-16">
            <span>
              <span className="text-accent">Spec</span> — {t("eng.stack")}
            </span>
            <span className="text-muted">
              {STACK.reduce((n, c) => n + c.items.length, 0)} items
            </span>
          </p>
          <dl>
            {STACK.map((cat, i) => (
              <div
                key={cat.key}
                className="group/spec grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 border-b border-fg py-5 transition-colors duration-300 hover:bg-fg hover:text-bg md:px-3 xl:grid-cols-[3rem_14rem_1fr]"
              >
                <span className="label-mono pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                <dt className="label-mono pt-1">{t(`eng.cat.${cat.key}`)}</dt>
                <dd className="col-start-2 text-xl font-medium leading-tight md:text-2xl xl:col-start-3">
                  {cat.items.map((it, j) => (
                    <span key={it}>
                      <span className="whitespace-nowrap">
                        {it}
                        {j < cat.items.length - 1 && <span className="pl-2 text-accent">/</span>}
                      </span>{" "}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
