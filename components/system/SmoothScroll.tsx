"use client";

import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MEDIA } from "@/lib/env";

/**
 * Conecta la instancia de Lenis (disponible solo dentro del provider)
 * con GSAP: ticker compartido, ScrollTrigger.update en cada scroll y
 * scroll nativo inmediato con prefers-reduced-motion.
 */
/** Lenis lee sus opciones en cada evento: ajustarlas en caliente es su API. */
function setMotion(lenis: Lenis, reduced: boolean) {
  Object.assign(lenis.options, { lerp: reduced ? 1 : 0.12, syncTouch: !reduced });
}

function LenisSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const reduce = window.matchMedia(MEDIA.reducedMotion);
    const applyMotionPref = () => setMotion(lenis, reduce.matches);
    applyMotionPref();
    reduce.addEventListener("change", applyMotionPref);

    lenis.on("scroll", ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Recalcula posiciones cuando las fuentes terminan de cargar.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      reduce.removeEventListener("change", applyMotionPref);
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        syncTouch: true,
        autoRaf: false, // GSAP controla el RAF
        anchors: true,
      }}
    >
      <LenisSync />
      {children}
    </ReactLenis>
  );
}
