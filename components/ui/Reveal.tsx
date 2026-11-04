"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** "lines": cada hijo directo [data-line] sube desde una máscara.
   *  "clip": el bloque se descubre con una cortina (clip-path). */
  variant?: "lines" | "clip";
  delay?: number;
  as?: React.ElementType;
  id?: string;
};

/**
 * Reveal con máscara. El contenido es visible sin JS y con
 * prefers-reduced-motion; la animación solo se monta si hay movimiento.
 */
export default function Reveal({
  children,
  className = "",
  variant = "lines",
  delay = 0,
  as: Tag = "div",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (variant === "clip") {
          gsap.fromTo(
            el,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              delay,
              ease: "expo.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
          return;
        }
        const lines = el.querySelectorAll<HTMLElement>("[data-line]");
        if (!lines.length) return;
        gsap.fromTo(
          lines,
          // Las líneas "deep" tienen más máscara por debajo: bajan más.
          { yPercent: (_i: number, el: HTMLElement) => (el.hasAttribute("data-deep") ? 140 : 105) },
          {
            yPercent: 0,
            duration: 1.1,
            delay,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Línea enmascarada para usar dentro de <Reveal>.
 * La máscara es un clip-path que sobresale por arriba: así caben las
 * tildes de las mayúsculas (Á, É, Í, Ñ) sin cambiar el layout.
 * `deep` deja sitio también por debajo (¿, comas) y oculta la línea
 * más abajo al empezar la animación.
 */
export function Line({
  children,
  className = "",
  deep = false,
}: {
  children: React.ReactNode;
  className?: string;
  deep?: boolean;
}) {
  return (
    <span
      className="block"
      style={{ paddingBottom: "0.04em", clipPath: `inset(-0.34em -0.5em ${deep ? "-0.2em" : "0"} -0.5em)` }}
    >
      <span data-line {...(deep ? { "data-deep": "" } : {})} className={`block will-change-transform ${className}`}>
        {children}
      </span>
    </span>
  );
}
