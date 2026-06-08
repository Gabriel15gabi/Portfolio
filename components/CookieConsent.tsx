"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

const CONSENT_KEY = "cookie-consent";

export default function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Mostrar solo si no hay decisión previa.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  const decide = (choice: "accepted" | "declined") => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
      document.cookie = `cookie-consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* almacenamiento no disponible */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-1/2 z-[9000] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 p-5 backdrop-blur-md sm:bottom-6 sm:flex sm:items-center sm:gap-5"
        >
          {/* red accent */}
          <div className="pointer-events-none absolute -left-px top-1/2 h-10 w-px -translate-y-1/2 bg-red-500/60" />

          <p className="mb-4 text-xs leading-relaxed text-white/45 sm:mb-0 sm:flex-1">
            {t("cookies.text")}
          </p>

          <div className="flex flex-shrink-0 items-center gap-3">
            <button
              onClick={() => decide("declined")}
              className="text-[11px] uppercase tracking-[2px] text-white/35 transition-colors duration-300 hover:text-white/60"
            >
              {t("cookies.decline")}
            </button>
            <button
              onClick={() => decide("accepted")}
              className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-5 py-2.5 text-[11px] uppercase tracking-[2px] text-white transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/[0.15]"
            >
              {t("cookies.accept")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
