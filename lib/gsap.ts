"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registro único de plugins (patrón recomendado en App Router).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Media queries compartidas por todas las animaciones. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 768px) and (pointer: fine)",
  motionDesktop:
    "(prefers-reduced-motion: no-preference) and (min-width: 768px) and (pointer: fine)",
} as const;

export const EASE = {
  out: "expo.out",
  inOut: "expo.inOut",
  mask: "power4.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
