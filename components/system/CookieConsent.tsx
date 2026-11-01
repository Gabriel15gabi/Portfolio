"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const CONSENT_KEY = "cookie-consent";

export default function CookieConsent() {
  const { t, lang, setLang } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Mostrar solo si no hay decisión previa.
  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        const timer = setTimeout(() => setVisible(true), 2200);
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
    // Con consentimiento, guarda el idioma elegido en esta visita.
    if (choice === "accepted") setLang(lang);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="theme-light fixed bottom-3 left-3 right-3 z-[9000] border-2 border-ink sm:left-auto sm:right-5 sm:bottom-5 sm:w-[420px]"
      style={{ animation: "cookie-in .5s var(--ease-expo) both" }}
    >
      <style>{`@keyframes cookie-in{from{transform:translateY(110%)}to{transform:none}}`}</style>
      <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-2 text-paper">
        <span className="label-mono">Cookies</span>
        <span className="label-mono text-signal">01/01</span>
      </div>
      <p className="px-4 py-4 text-sm leading-snug">{t("cookies.text")}</p>
      <div className="grid grid-cols-2 border-t-2 border-ink">
        <button
          onClick={() => decide("declined")}
          className="label-mono border-r-2 border-ink px-4 py-3 text-left transition-colors hover:bg-concrete"
        >
          {t("cookies.decline")}
        </button>
        <button
          onClick={() => decide("accepted")}
          className="label-mono bg-signal px-4 py-3 text-left text-paper transition-colors hover:bg-ink"
        >
          {t("cookies.accept")} →
        </button>
      </div>
    </div>
  );
}
