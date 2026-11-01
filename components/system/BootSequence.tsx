"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";

const KEY = "gr-boot";

/** Señal global para que la portada arranque su animación. */
export function announceReady() {
  (window as unknown as { __grReady?: boolean }).__grReady = true;
  window.dispatchEvent(new Event("intro:ready"));
}

/**
 * Intro de menos de 1 s: solo en la primera visita de la sesión.
 * Se omite (sin parpadeo) en visitas repetidas, sin JS y con
 * prefers-reduced-motion gracias al script inline previo al pintado.
 */
export default function BootSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || root.classList.contains("no-boot")) {
      setGone(true);
      announceReady();
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* sin almacenamiento */
    }

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => setGone(true),
    });
    tl.to(counter, {
      v: 100,
      duration: 0.75,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current)
          countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
      },
    })
      .add(announceReady, "+=0.02")
      .to(el, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "<");

    // Un clic o tecla salta la intro.
    const skip = () => tl.progress(1);
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <script
        // Antes del primer pintado: decide si la intro se muestra.
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('no-boot')}catch(e){}`,
        }}
      />
      <noscript>
        <style>{`.boot-screen{display:none!important}`}</style>
      </noscript>
      <style>{`html.no-boot .boot-screen{display:none!important}`}</style>
      <div
        ref={ref}
        aria-hidden
        className="boot-screen theme-dark fixed inset-0 z-[9995] flex flex-col justify-between p-4 sm:p-8 lg:p-12"
      >
        <div className="label-mono flex justify-between">
          <span>GR/ — Brutalist Digital Object</span>
          <span className="text-signal">{t("loader.label")}</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="display text-[28vw] leading-[0.75] md:text-[18vw]">
            <span ref={countRef}>000</span>
          </span>
          <span className="mb-2 h-6 w-6 bg-signal animate-blink md:h-10 md:w-10" />
        </div>
      </div>
    </>
  );
}
