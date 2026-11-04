"use client";

import { useSyncExternalStore } from "react";
import { MEDIA } from "@/lib/env";

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MEDIA.reducedMotion);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** prefers-reduced-motion como estado de React (false en el servidor). */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MEDIA.reducedMotion).matches,
    () => false
  );
}
