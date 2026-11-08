"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { trainingSteps } from "@/lib/ai/labStats";

/** Pasos de entrenamiento acumulados por los modelos durante esta visita. */
export default function LabCounter() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nf = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US");
    let shown = -1;
    const tick = () => {
      const n = trainingSteps();
      if (n !== shown) {
        shown = n;
        el.textContent = nf.format(n);
      }
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [lang]);

  return <span ref={ref}>0</span>;
}
