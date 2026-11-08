"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * Bucle de animación de un experimento del laboratorio.
 * Solo corre si `playing` es true, si el experimento está en pantalla
 * y si la pestaña está visible: fuera de la vista no gasta CPU.
 */
export function useLabLoop(
  ref: RefObject<HTMLElement | null>,
  playing: boolean,
  onFrame: (dt: number, now: number) => void
) {
  const frame = useEffectEvent(onFrame);

  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;
    let visible = false;
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      // Tras una pausa larga (otra pestaña, scroll) no se recupera el tiempo perdido.
      const dt = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      frame(dt, now);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        kick();
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", kick);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, playing]);
}
