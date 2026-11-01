"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MQ } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";
import { createParticleField } from "@/lib/particles";
import { cssVar, hasFinePointer } from "@/lib/env";

const FIRST = "GABRIEL";
const LAST = "RODRÍGUEZ";

function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span key={i} data-char className="inline-block">
          {c}
        </span>
      ))}
    </>
  );
}

/**
 * Muestrea el nombre real del DOM: cada letra se dibuja en el canvas
 * oculto en la misma posición, fuente y tamaño que en la página, así
 * las partículas forman exactamente la composición tipográfica.
 * El punto final (acento) se dibuja en rojo puro → partículas rojas.
 */
function sampleName(root: HTMLElement, canvas: HTMLCanvasElement) {
  return (o: CanvasRenderingContext2D) => {
    const origin = canvas.getBoundingClientRect();
    root.querySelectorAll<HTMLElement>("[data-char]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      o.textBaseline = "alphabetic";
      o.textAlign = "left";
      const m = o.measureText(el.textContent || "");
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      // El glifo se centra verticalmente en la caja de línea (medio interlineado).
      const baseline = r.top - origin.top + (r.height - (asc + desc)) / 2 + asc;
      o.fillStyle = el.closest("[data-accent]") ? "#ff0000" : "#000";
      o.fillText(el.textContent || "", r.left - origin.left, baseline);
    });
  };
}

export default function Intro() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const canvas = canvasRef.current;
      const name = nameRef.current;
      if (!root || !canvas || !name) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // 1 · Nombre en partículas: nace disperso y se ensambla.
        const finePointer = hasFinePointer();
        const field = createParticleField(canvas, {
          sample: sampleName(name, canvas),
          baseColor: () => getComputedStyle(canvas).color,
          accentColor: () => cssVar("--color-signal") || "#e52b25",
          accentRatio: 0.015,
          step: finePointer ? 4 : 3,
          maxParticles: finePointer ? 16000 : 7000,
          size: finePointer ? 2.6 : 2.2,
          radius: finePointer ? 110 : 70,
          scatterDistance: 0.45,
          startScattered: true,
          pointerTarget: window,
        });
        name.dataset.particles = "on";
        document.documentElement.classList.add("motion-ok");

        const state = { entry: 1, scroll: 0 };
        const apply = () => field.setScatter(Math.max(state.entry, state.scroll));
        apply();

        gsap.set("[data-intro-fade]", { autoAlpha: 0, y: 16 });
        gsap.set("[data-intro-block]", { scaleX: 0 });

        const enter = () => {
          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
          tl.to(state, { entry: 0, duration: 1.8, ease: "power3.out", onUpdate: apply })
            .to("[data-intro-block]", { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, 0.1)
            .to("[data-intro-fade]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.4);
        };
        const w = window as unknown as { __grReady?: boolean };
        if (w.__grReady) enter();
        else window.addEventListener("intro:ready", enter, { once: true });

        // 2 · Tipografía cinética: el nombre se desintegra al hacer scroll.
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            state.scroll = Math.pow(self.progress, 1.6) * 0.9;
            apply();
          },
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
          st.kill();
          field.destroy();
          delete name.dataset.particles;
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

      {/* Lienzo de partículas del nombre (sobre el h1, sin capturar eventos) */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 h-full w-full text-fg"
      />

      {/* Fila de metadatos */}
      <div className="label-mono relative grid grid-cols-2 gap-x-4 gap-y-2 border-t-2 border-fg pt-3 md:grid-cols-12">
        <span data-intro-fade className="md:col-span-3">
          <span className="text-accent">§00</span> — Introduction
        </span>
        <span data-intro-fade className="text-right md:col-span-4 md:col-start-5 md:text-left">
          {t("intro.based")} {PROFILE.location[lang]}
          <br />
          <span className="text-muted">{PROFILE.coords}</span>
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
        className="relative order-last mt-8 grid gap-5 md:order-none md:mt-auto md:grid-cols-12 md:items-end md:gap-6 md:pb-12"
      >
        <p
          data-intro-fade
          className="text-[clamp(1.7rem,3.3vw,3.6rem)] font-bold uppercase leading-[1.04] tracking-[-0.03em] md:col-span-6"
        >
          Not here to fit in.
          <br />
          <span className="bg-fg px-[0.12em] text-bg [box-decoration-break:clone]">Here to build.</span>
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

        <h1
          ref={nameRef}
          id="intro-title"
          data-intro-name
          className="display relative select-none"
          aria-label={PROFILE.name}
        >
          <span aria-hidden className="block whitespace-nowrap text-[30vw] leading-[0.8] tracking-[-0.02em] md:text-[24.5vw]">
            <Chars text={FIRST} />
          </span>
          <span
            aria-hidden
            className="block whitespace-nowrap mt-[0.2em] text-[19.5vw] leading-[0.8] tracking-[-0.015em] md:ml-[12vw] md:mt-0 md:text-[16.4vw]"
          >
            <Chars text={LAST} />
            <span data-accent className="inline-block text-accent">
              <Chars text="." />
            </span>
          </span>
        </h1>
      </div>

      {/* Indicador de scroll */}
      <div className="label-mono relative mt-6 hidden items-end justify-between md:flex">
        <span data-intro-fade className="hidden text-muted md:block">
          Frontend — Backend — AI &amp; Automation
        </span>
        <a
          href="#manifesto"
          data-intro-fade
          data-cursor="↓"
          className="ml-auto flex items-center gap-3"
          aria-label={t("intro.scroll")}
        >
          <span>{t("intro.scroll")}</span>
          <span className="relative block h-12 w-[2px] overflow-hidden bg-line/20" aria-hidden>
            <span className="absolute inset-x-0 top-0 h-1/3 bg-accent animate-probe" />
          </span>
        </a>
      </div>
    </section>
  );
}
