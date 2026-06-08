"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    /* Simulate loading: fast start, slow in middle, fast finish */
    let raf: number;
    let start: number | null = null;
    const totalDuration = 2200; // ms

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / totalDuration, 1);

      /* ease: fast → slow → fast (custom cubic) */
      const eased =
        t < 0.3
          ? t * 2.5 * (t / 0.3) // accelerate 0-75 fast
          : t < 0.7
          ? 0.75 + (t - 0.3) * 0.375 // slow mid section
          : 0.9 + (t - 0.7) * (0.1 / 0.3) * ((t - 0.7) / 0.3); // accelerate to 100

      const p = Math.min(Math.round(eased * 100), 100);
      setProgress(p);

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setProgress(100);
        setTimeout(() => {
          setDone(true);
          // Avisamos al Hero de que el loader ha terminado → dispara el glitch del nombre
          window.dispatchEvent(new Event("loader:done"));
        }, 400);
        setTimeout(() => onComplete(), 900);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303]"
        >
          {/* Percentage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-12 flex items-baseline gap-1"
          >
            <span
              className="font-light tabular-nums text-white"
              style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
            >
              {progress}
            </span>
            <span className="text-2xl text-red-500 sm:text-4xl">%</span>
          </motion.div>

          {/* Progress bar */}
          <div className="relative mx-auto w-[280px] sm:w-[400px]">
            {/* Track */}
            <div className="h-[2px] w-full bg-white/[0.06]" />
            {/* Fill */}
            <motion.div
              className="absolute left-0 top-0 h-[2px] origin-left bg-red-500"
              style={{ width: `${progress}%` }}
            />
            {/* Glow on tip */}
            <motion.div
              className="absolute top-1/2 h-1 w-6 -translate-y-1/2 rounded-full bg-red-500 blur-[6px]"
              style={{ left: `calc(${progress}% - 12px)` }}
            />
          </div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-[9px] uppercase tracking-[8px] text-white/15"
          >
            {t("loader.label")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
