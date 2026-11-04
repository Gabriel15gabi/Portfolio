"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";
import Coords from "@/components/ui/Coords";

const FIRST = "GABRIEL";
const LAST = "RODRÍGUEZ";

// Velocidades de cada letra al hacer scroll: el nombre se "desmonta".
const SPEEDS_FIRST = [0.15, -0.35, 0.5, 0.05, 0.4, -0.2, 0.3];
const SPEEDS_LAST = [-0.25, 0.3, 0.1, -0.4, 0.45, 0.2, -0.15, 0.35, -0.05];

function Chars({ text, speeds }: { text: string; speeds: number[] }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span key={i} className="mask-line inline-block" style={{ paddingTop: "0.32em", marginTop: "-0.32em", paddingBottom: 0 }}>
          <span data-char data-speed={speeds[i % speeds.length]} className="inline-block will-change-transform">
            {c}
          </span>
        </span>
      ))}
    </>
  );
}

export default function Intro() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // 1 · Entrada: letras suben desde la máscara cuando termina la intro.
        gsap.set(chars, { yPercent: 105 });
        // El nombre llega oculto desde el CSS (html.motion-ok) para que no
        // parpadee antes de hidratar; con las letras ya bajo su máscara, se muestra.
        gsap.set("[data-intro-name]", { visibility: "visible" });
        gsap.set("[data-intro-fade]", { autoAlpha: 0, y: 16 });
        gsap.set("[data-intro-block]", { scaleX: 0 });

        const enter = () => {
          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
          tl.to(chars, { yPercent: 0, duration: 1.1, stagger: { each: 0.035, from: "start" } })
            .to("[data-intro-block]", { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, 0.15)
            .to("[data-intro-fade]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.45);
        };
        const w = window as unknown as { __grReady?: boolean };
        if (w.__grReady) enter();
        else window.addEventListener("intro:ready", enter, { once: true });

        // 2 · Tipografía cinética: cada letra a su velocidad con el scroll.
        chars.forEach((c) => {
          const s = parseFloat(c.dataset.speed || "0");
          gsap.to(c, {
            y: () => s * window.innerHeight * 0.45,
            rotate: s * 6,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });

        // 3 · Parallax asimétrico de bloques secundarios.
        gsap.to("[data-intro-block]", {
          yPercent: -60,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-intro-tagline]", {
          y: () => -window.innerHeight * 0.18,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });

        return () => {
          window.removeEventListener("intro:ready", enter);
          document.documentElement.classList.remove("motion-ok");
        };
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="top"
      data-theme="light"
      aria-labelledby="intro-title"
      className="relative flex min-h-[100svh] flex-col overflow-clip px-4 pb-6 pt-20 sm:px-8 md:pt-24 lg:px-12"
    >
      {/* Retícula técnica */}
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      {/* Fila de metadatos */}
      <div className="label-mono relative grid grid-cols-2 gap-x-4 gap-y-2 border-t-2 border-fg pt-3 md:grid-cols-12">
        <span data-intro-fade className="md:col-span-3">
          <span className="text-accent">§00</span> — {t("intro.label")}
        </span>
        <span data-intro-fade className="text-right md:col-span-4 md:col-start-5 md:text-left">
          {t("intro.based")} {PROFILE.location[lang]}
          <br />
          <span className="text-muted">
            <Coords />
          </span>
        </span>
        <span
          data-intro-fade
          className="col-span-2 flex items-center gap-2 md:col-span-4 md:col-start-9 md:justify-end"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 bg-accent animate-blink" />
          </span>
          {t("intro.available")}
        </span>
      </div>

      {/* Zona media: tagline + descripción (desktop) */}
      <div
        data-intro-tagline
        className="relative mt-auto grid gap-5 pt-10 md:grid-cols-12 md:items-end md:gap-6 md:pb-12 md:pt-0"
      >
        <p
          data-intro-fade
          className="text-[clamp(1.7rem,3.3vw,3.6rem)] font-bold uppercase leading-[1.04] tracking-[-0.03em] md:col-span-6"
        >
          {t("intro.tagline1")}
          <br />
          <span className="bg-fg px-[0.12em] text-bg [box-decoration-break:clone]">{t("intro.tagline2")}</span>
        </p>
        <p data-intro-fade className="max-w-[36ch] text-base leading-snug text-muted md:col-span-3 md:col-start-7">
          {t("intro.description")}
        </p>
      </div>

      {/* Composición monumental */}
      <div className="relative mt-auto pt-10 md:mt-0 md:pt-0">
        {/* Bloque rojo geométrico */}
        <div
          data-intro-block
          aria-hidden
          className="absolute right-0 top-[-14%] h-[46%] w-[30%] origin-right bg-signal md:right-0 md:top-[-34%] md:h-[66%] md:w-[24%]"
        />

        <h1 id="intro-title" data-intro-name className="display relative select-none" aria-label={PROFILE.name}>
          <span aria-hidden className="block whitespace-nowrap text-[30vw] leading-[0.8] tracking-[-0.02em] md:text-[24.5vw]">
            <Chars text={FIRST} speeds={SPEEDS_FIRST} />
          </span>
          <span
            aria-hidden
            className="block whitespace-nowrap mt-[0.2em] text-[19.5vw] leading-[0.8] tracking-[-0.015em] md:ml-[12vw] md:mt-0 md:text-[16.4vw]"
          >
            <Chars text={LAST} speeds={SPEEDS_LAST} />
            <span className="inline-block text-accent">
              <Chars text="." speeds={[0.6]} />
            </span>
          </span>
        </h1>
      </div>

      {/* Pie de la portada (conserva la altura del antiguo indicador de scroll) */}
      <div className="label-mono relative mt-6 hidden min-h-12 items-end md:flex">
        <span data-intro-fade className="hidden text-muted md:block">
          {t("intro.disciplines")}
        </span>
      </div>
    </section>
  );
}
