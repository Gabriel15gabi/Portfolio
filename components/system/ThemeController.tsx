"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

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
    const colors: Record<string, string> = {
      light: "#f0efe9",
      dark: "#111111",
      red: "#e52b25",
    };

    const setTheme = (theme: string) => {
      if (root.dataset.theme === theme) return;
      root.dataset.theme = theme;
      if (meta) meta.content = colors[theme] ?? colors.light;
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

  return null;
}
