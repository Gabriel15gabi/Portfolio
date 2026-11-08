/* Consultas de entorno compartidas (fuente única para todos los componentes). */

export const MEDIA = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  noMotionPref: "(prefers-reduced-motion: no-preference)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(MEDIA.reducedMotion).matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia(MEDIA.finePointer).matches;

/** Lee una variable CSS del documento (tokens de @theme). */
export const cssVar = (name: string) =>
  typeof window === "undefined"
    ? ""
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
