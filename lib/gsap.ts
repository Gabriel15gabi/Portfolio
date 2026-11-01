"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@/lib/env";

// Registro único de plugins (patrón recomendado en App Router).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Media queries para gsap.matchMedia(), construidas sobre lib/env. */
export const MQ = {
  motion: MEDIA.noMotionPref,
  motionDesktop: `${MEDIA.noMotionPref} and (min-width: 768px) and ${MEDIA.finePointer}`,
} as const;

export { gsap, ScrollTrigger, useGSAP };
