"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";
import Coords from "@/components/ui/Coords";
import Reveal, { Line } from "@/components/ui/Reveal";

const FIRST = "GABRIEL";
const LAST = "RODRÍGUEZ";

// Velocidades de cada letra al hacer scroll: el nombre se "desmonta".
const SPEEDS_FIRST = [0.15, -0.35, 0.5, 0.05, 0.4, -0.2, 0.3];
const SPEEDS_LAST = [-0.25, 0.3, 0.1, -0.4, 0.45, 0.2, -0.15, 0.35, -0.05];
// Las de la frase del cartel de móvil, más contenidas.
const SPEEDS_POSTER = [0.2, -0.15, 0.3, -0.25, 0.1, 0.25, -0.3, 0.05, -0.1, 0.35, -0.2];

/**
 * Avance de cada glifo de Anton (em), medido en Chromium. Con él cada línea
 * del cartel de móvil se ajusta al ancho de la pantalla solo con CSS: sin
 * medir en el cliente ni saltos al hidratar.
 */
const ADV: Record<string, number> = {
  A: 0.4854, B: 0.4785, C: 0.4741, D: 0.4932, E: 0.4116, F: 0.3989, G: 0.4849, H: 0.499, I: 0.2266,
  J: 0.4663, K: 0.4722, L: 0.3975, M: 0.7461, N: 0.498, O: 0.4863, P: 0.4722, Q: 0.4937, R: 0.4766,
  S: 0.4614, T: 0.3955, U: 0.4736, V: 0.4693, W: 0.7119, X: 0.4839, Y: 0.4463, Z: 0.4102,
  Á: 0.4854, É: 0.4116, Í: 0.2266, Ó: 0.4863, Ú: 0.4736, Ñ: 0.498, Ü: 0.4736,
  ".": 0.2285, ",": 0.2363, "!": 0.229, "?": 0.4922, "¡": 0.2266, "¿": 0.4927, "&": 0.52, "'": 0.2139,
  "’": 0.2319, "-": 0.311, " ": 0.2344,
};
const POSTER_TRACKING = -0.01;
const emWidth = (text: string) => [...text].reduce((w, c) => w + (ADV[c] ?? 0.5) + POSTER_TRACKING, 0);

/** Parte una frase en dos líneas de ancho parecido (una sola si es una palabra). */
function balance(sentence: string) {
  const words = sentence.toUpperCase().split(" ");
  let best = [words.join(" ")];
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(emWidth(a) - emWidth(b));
    if (d < diff) {
      diff = d;
      best = [a, b];
    }
  }
  return best;
}

function Chars({ text, speeds, bottom = 0 }: { text: string; speeds: number[]; bottom?: number }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span
          key={i}
          className="mask-line inline-block"
          style={{
            paddingTop: "0.32em",
            marginTop: "-0.32em",
            paddingBottom: bottom ? `${bottom}em` : 0,
            // Más máscara por debajo (letras huecas) sin cambiar la caja.
            ...(bottom ? { marginBottom: `-${bottom}em` } : {}),
          }}
        >
          <span data-char data-speed={speeds[i % speeds.length]} className="inline-block will-change-transform">
            {c === " " ? "\u00A0" : c}
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Línea del cartel de móvil: ocupa el ancho de la pantalla (98 %, por margen
 * de redondeo) y se estira en vertical con --k para llenar el alto.
 */
function PosterLine({ text, gap, className = "", bottom }: { text: string; gap: number; className?: string; bottom?: number }) {
  const fit = (0.98 / emWidth(text)).toFixed(4);
  // Las mayúsculas con tilde necesitan más aire por encima.
  const top = /[ÁÉÍÓÚÑÜ]/.test(text) ? Math.max(gap, 0.34) : gap;
  return (
    <span
      aria-hidden
      data-stretch
      data-gap={top}
      className={`stretch-y block whitespace-nowrap leading-[0.8] ${className}`}
      style={{
        fontSize: `calc((100vw - var(--pad)) * ${fit})`,
        letterSpacing: `${POSTER_TRACKING}em`,
        marginTop: `calc(${top}em * var(--k, 1))`,
      }}
    >
      <Chars text={text} speeds={SPEEDS_POSTER} bottom={bottom} />
    </span>
  );
}

export default function Intro() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tagline1 = balance(t("intro.tagline1"));
  const tagline2 = balance(t("intro.tagline2"));

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const chars = gsap.utils.toArray<HTMLElement>("[data-intro-name] [data-char]", root);
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
        // En móvil el nombre es mucho más pequeño: la deriva, proporcional.
        const narrow = () => window.innerWidth < 768;
        chars.forEach((c) => {
          const s = parseFloat(c.dataset.speed || "0");
          gsap.to(c, {
            y: () => s * window.innerHeight * (narrow() ? 0.15 : 0.45),
            rotate: () => s * (narrow() ? 3 : 6),
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

  // Frase del cartel (móvil): sus letras suben tras las del nombre y se
  // desmontan con el scroll. Al cambiar de idioma cambian las líneas: se rehace.
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.motion} and (max-width: 767.98px)`, () => {
        const poster = root.querySelector<HTMLElement>("[data-intro-poster]");
        if (!poster) return;
        const chars = gsap.utils.toArray<HTMLElement>("[data-char]", poster);
        gsap.set(chars, { yPercent: 120 });
        gsap.set(poster, { visibility: "visible" });
        const enter = () =>
          gsap.to(chars, { yPercent: 0, duration: 1, delay: 0.3, ease: "expo.out", stagger: 0.02 });
        const w = window as unknown as { __grReady?: boolean };
        if (w.__grReady) enter();
        else window.addEventListener("intro:ready", enter, { once: true });

        chars.forEach((c) => {
          const s = parseFloat(c.dataset.speed || "0");
          gsap.to(c, {
            y: () => s * window.innerHeight * 0.15,
            rotate: s * 3,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          });
        });
        return () => window.removeEventListener("intro:ready", enter);
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [lang], revertOnUpdate: true }
  );

  // En móvil el cartel (nombre + frase) llena la primera pantalla: el alto que
  // sobre lo absorben las letras, estiradas en vertical (--k, hasta ×1,6).
  // Se calcula con los tamaños de letra (no con el alto ya estirado) y --k va
  // en cada línea: así el resultado no depende del valor anterior.
  useLayoutEffect(() => {
    const wall = wallRef.current;
    const inner = innerRef.current;
    const stage = wall?.parentElement;
    if (!wall || !inner || !stage) return;
    const mq = window.matchMedia("(max-width: 767.98px)");
    const fit = () => {
      const lines = [...inner.querySelectorAll<HTMLElement>("[data-stretch]")];
      let k = 1;
      if (mq.matches) {
        // Alto natural de las líneas: 0,8 em cada una más su aire superior.
        const natural = lines.reduce((h, l) => {
          const f = parseFloat(getComputedStyle(l).fontSize);
          return h + (0.8 + parseFloat(l.dataset.gap || "0")) * f;
        }, 0);
        const others = stage.offsetHeight - wall.offsetHeight;
        const room = parseFloat(getComputedStyle(stage).minHeight) - others - parseFloat(getComputedStyle(inner).paddingTop);
        if (natural > 0) k = Math.min(1.6, Math.max(1, room / natural));
      }
      lines.forEach((l) => l.style.setProperty("--k", k.toFixed(4)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [lang]);

  return (
    <section
      ref={ref}
      id="top"
      data-theme="light"
      aria-labelledby="intro-title"
      className="relative flex flex-col overflow-clip md:min-h-[100svh] md:px-8 md:pb-6 md:pt-24 lg:px-12"
    >
      {/* Retícula técnica */}
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      {/* Móvil: la primera pantalla es solo el nombre y el resto de la
          portada llega al bajar. En escritorio este envoltorio no genera
          caja (display: contents) y todo queda como siempre. */}
      <div
        data-intro-stage
        className="relative flex min-h-[100svh] flex-col px-4 pb-6 pt-20 sm:px-8 md:contents"
      >
        {/* Fila de metadatos: sección y ciudad; la disponibilidad, «Con base
            en» y las coordenadas se añaden desde tablet. */}
        <div className="label-mono relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t-2 border-fg pt-3 md:grid-cols-12">
          <span data-intro-fade className="md:col-span-3">
            <span className="text-accent">§00</span> — {t("intro.label")}
          </span>
          <span data-intro-fade className="text-right md:col-span-4 md:col-start-5 md:text-left">
            <span className="hidden md:inline">{t("intro.based")} </span>
            {PROFILE.location[lang]}
            <span className="hidden md:inline">
              <br />
              <span className="text-muted">
                <Coords />
              </span>
            </span>
          </span>
          <span data-intro-fade className="hidden items-center gap-2 md:col-span-4 md:col-start-9 md:flex md:justify-end">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inset-0 bg-accent animate-blink" />
            </span>
            {t("intro.available")}
          </span>
        </div>

        {/* Zona media: tagline + descripción (escritorio; en móvil van en la hoja) */}
        <div
          data-intro-tagline
          className="relative hidden md:mt-auto md:grid md:grid-cols-12 md:items-end md:gap-6 md:pb-12"
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

        {/* Composición monumental. En móvil es un cartel que llena la pantalla:
            el nombre y, debajo, la frase a todo el ancho (hueca la negación,
            roja la afirmación). En escritorio estos envoltorios no generan caja. */}
        <div ref={wallRef} className="relative flex-1 [--pad:2rem] sm:[--pad:4rem] md:contents">
          <div ref={innerRef} className="pt-6 md:contents">
            <div className="relative">
              {/* Bloque rojo geométrico (escritorio) */}
              <div
                data-intro-block
                aria-hidden
                className="absolute right-0 top-[-34%] hidden h-[66%] w-[24%] origin-right bg-signal md:block"
              />

              <h1 id="intro-title" data-intro-name className="display relative select-none" aria-label={PROFILE.name}>
                <span
                  aria-hidden
                  data-stretch
                  data-gap="0"
                  className="block whitespace-nowrap text-[calc((100vw-2rem)*0.347)] leading-[0.8] tracking-[-0.02em] max-md:stretch-y sm:text-[calc((100vw-4rem)*0.347)] md:text-[24.5vw]"
                >
                  <Chars text={FIRST} speeds={SPEEDS_FIRST} />
                </span>
                <span
                  aria-hidden
                  data-stretch
                  data-gap="0.34"
                  className="block whitespace-nowrap mt-[calc(0.34em*var(--k,1))] text-[calc((100vw-2rem)*0.2435)] leading-[0.8] tracking-[-0.015em] max-md:stretch-y sm:text-[calc((100vw-4rem)*0.2435)] md:ml-[12vw] md:mt-0 md:text-[16.4vw]"
                >
                  <Chars text={LAST} speeds={SPEEDS_LAST} />
                  <span className="inline-block text-accent">
                    <Chars text="." speeds={[0.6]} />
                  </span>
                </span>
              </h1>
            </div>

            <p data-intro-poster className="display md:hidden">
              <span className="sr-only">
                {t("intro.tagline1")} {t("intro.tagline2")}
              </span>
              {tagline1.map((l, i) => (
                <PosterLine key={`a${i}`} text={l} gap={i === 0 ? 0.3 : 0.1} bottom={0.1} className="text-outline" />
              ))}
              {tagline2.map((l, i) => (
                <PosterLine key={`b${i}`} text={l} gap={0.1} className="text-accent" />
              ))}
            </p>
          </div>
        </div>

        {/* Disponibilidad bajo el nombre (móvil) */}
        <p data-intro-fade className="label-mono mt-5 flex items-center gap-2 max-[359px]:tracking-[0.05em] md:hidden">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inset-0 bg-accent animate-blink" />
          </span>
          {t("intro.available")}
        </p>

        {/* Pie de la portada (conserva la altura del antiguo indicador de scroll) */}
        <div className="label-mono relative mt-6 hidden min-h-12 items-end md:flex">
          <span data-intro-fade className="hidden text-muted md:block">
            {t("intro.disciplines")}
          </span>
        </div>
      </div>

      {/* Móvil: lo que llega al bajar. Cada bloque aparece al entrar en
          pantalla (Reveal); sin movimiento, todo está visible desde el principio. */}
      <div data-intro-sheet className="relative mx-4 border-t-2 border-fg pb-16 pt-8 sm:mx-8 md:hidden">
        <Reveal as="p" className="max-w-[30ch] text-xl font-medium leading-snug">
          <Line>{t("intro.description")}</Line>
        </Reveal>
        {/* Claves por posición: al cambiar de idioma se actualiza el texto
            sin volver a montar las líneas que anima Reveal. */}
        <Reveal as="ul" className="label-mono mt-8 border-t border-line">
          {t("intro.disciplines")
            .split(" — ")
            .map((d, i) => (
              <li key={i} className="border-b border-line">
                <Line>
                  <span className="flex items-center gap-3 py-3">
                    <span className="h-2 w-2 shrink-0 bg-accent" aria-hidden />
                    {d}
                  </span>
                </Line>
              </li>
            ))}
        </Reveal>
      </div>
    </section>
  );
}
