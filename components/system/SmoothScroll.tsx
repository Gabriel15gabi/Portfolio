"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis sincronizado con el ticker de GSAP (autoRaf: false) para que
 * ScrollTrigger lea siempre la posición correcta sin jitter.
 * Con prefers-reduced-motion el scroll vuelve a ser inmediato.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPref = () => {
      if (!lenis) return;
      lenis.options.lerp = reduce.matches ? 1 : 0.12;
      lenis.options.syncTouch = !reduce.matches;
    };
    applyMotionPref();
    reduce.addEventListener("change", applyMotionPref);

    lenis?.on("scroll", ScrollTrigger.update);

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Recalcula posiciones cuando las fuentes terminan de cargar.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      reduce.removeEventListener("change", applyMotionPref);
      lenis?.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.12,
        syncTouch: false,
        autoRaf: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
