"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registramos el plugin una sola vez a nivel de módulo (patrón correcto en App Router)
gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // Sincronizamos Lenis con el ticker de GSAP para que ScrollTrigger
    // lea siempre la posición de scroll correcta (sin jitter de 1-2 frames)
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.14,
        duration: 1.2,
        syncTouch: true, // suavizado en táctil (reemplazo de smoothTouch)
        autoRaf: false, // GSAP controla el RAF, no Lenis
      }}
    >
      {children}
    </ReactLenis>
  );
}