"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MQ } from "@/lib/gsap";

/**
 * Titular cinético: deriva horizontalmente con el scroll (scrub) y se
 * inclina según la velocidad de scroll. Solo escritorio + movimiento.
 */
export function KineticLine({
  children,
  className = "",
  drift = 12,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** desplazamiento horizontal total en % (positivo = hacia la izquierda) */
  drift?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          el,
          { xPercent: drift / 2 },
          {
            xPercent: -drift / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
        const skewTo = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" });
        let settle: gsap.core.Tween | null = null;
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-8, 8, self.getVelocity() / -250);
            skewTo(v);
            // Al detenerse el scroll, el titular vuelve a su eje.
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => skewTo(0));
          },
          onLeave: () => skewTo(0),
          onLeaveBack: () => skewTo(0),
        });
        return () => {
          settle?.kill();
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * Parallax asimétrico: el elemento se desplaza a otra velocidad.
 * speed > 0 → más lento que el scroll; speed < 0 → en sentido contrario.
 */
export function Parallax({
  children,
  className = "",
  speed = 0.2,
  as: Tag = "div",
}: {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motionDesktop, () => {
        gsap.fromTo(
          el,
          { y: speed * 160 },
          {
            y: -speed * 160,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
