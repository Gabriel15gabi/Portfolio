"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { cssVar } from "@/lib/env";
import { useLanguage } from "@/lib/i18n";

/**
 * Cambia el tema global (paper / ink / red) según la sección que ocupa
 * el centro del viewport. Las secciones declaran data-theme; con JS
 * se vuelven transparentes y el fondo de <html> transiciona.
 */
export default function ThemeController() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-js");

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-theme]")
    );

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    // Colores de la barra del navegador leídos de los tokens de @theme.
    const tokens: Record<string, string> = {
      light: "--color-paper",
      dark: "--color-ink",
      red: "--color-signal",
    };

    const setTheme = (theme: string) => {
      if (root.dataset.theme === theme) return;
      root.dataset.theme = theme;
      const color = cssVar(tokens[theme] ?? tokens.light);
      if (meta && color) meta.content = color;
    };

    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) setTheme(section.dataset.theme || "light");
        },
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
      root.classList.remove("theme-js");
      root.dataset.theme = "light";
    };
  }, []);

  // Cambiar de idioma cambia la altura de los textos: recalcula todos
  // los triggers (temas, reveals, parallax) tras el nuevo layout.
  const { lang } = useLanguage();
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  return null;
}
