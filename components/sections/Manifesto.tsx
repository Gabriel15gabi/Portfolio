"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MQ } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";

/** Cinta industrial que cruza la composición en diagonal. */
function Tape() {
  const items = ["Frontend", "Backend", "Databases", "AI & Automation", "Available for work", "Mérida — ES"];
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((it) => (
        <span key={it} className="flex items-center">
          <span className="px-6">{it}</span>
          <span className="h-2.5 w-2.5 bg-signal" aria-hidden />
        </span>
      ))}
    </span>
  );
  return (
    <div
      aria-hidden
      className="label-mono relative z-10 -mx-4 -rotate-2 overflow-hidden border-y-2 border-paper bg-ink py-3 text-[0.8rem] text-paper sm:-mx-8 lg:-mx-12"
    >
      <div className="animate-ticker flex w-max">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

export default function Manifesto() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const text = t("manifesto.text");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const words = gsap.utils.toArray<HTMLElement>("[data-word]", ref.current);
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-manifesto-text]",
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          }
        );
        // Las palabras clave toman el color de acento al pasar (clase, no
        // color capturado: no depende del tema activo al crear el trigger).
        gsap.utils.toArray<HTMLElement>("[data-key]", ref.current).forEach((w) => {
          ScrollTrigger.create({
            trigger: w,
            start: "top 60%",
            toggleClass: { targets: w, className: "text-signal" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text], revertOnUpdate: true }
  );

  // Palabras destacadas (ES/EN) — solo cambian de color, no de contenido.
  const keys = new Set(["diseño,", "tecnología", "design,", "technology", "inteligencia", "artificial", "intelligence"]);

  return (
    <section
      ref={ref}
      id="manifesto"
      data-theme="dark"
      aria-label={t("manifesto.label")}
      className="relative overflow-clip px-4 pb-28 sm:px-8 md:pb-40 lg:px-12"
    >
      <Tape />

      <div className="mt-24 grid gap-8 md:mt-36 md:grid-cols-12">
        <p className="label-mono md:col-span-3">
          <span className="text-accent">✕</span> {t("manifesto.label")}
        </p>
        <p
          data-manifesto-text
          className="text-[clamp(2rem,5.4vw,5.6rem)] font-medium leading-[1.02] tracking-[-0.03em] md:col-span-9"
        >
          {text.split(" ").map((w, i) => (
            <span key={`${w}-${i}`} data-word className="transition-colors duration-500" {...(keys.has(w.toLowerCase()) ? { "data-key": "" } : {})}>
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
