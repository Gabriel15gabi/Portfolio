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
          { yPercent: 105 },
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

/** Línea enmascarada para usar dentro de <Reveal>. */
export function Line({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className="mask-line">
      <span data-line className={`block will-change-transform ${className}`}>
        {children}
      </span>
    </span>
  );
}
