import { expect, type Page } from "@playwright/test";

/** Acepta las cookies antes de cargar para que el aviso no tape la página. */
export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("cookie-consent", "accepted");
    } catch {}
  });
}

/** Recoge errores de consola y excepciones no capturadas. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Espera a que la página haya hidratado (el controlador de temas añade .theme-js). */
export async function waitForApp(page: Page) {
  await expect(page.locator("html")).toHaveClass(/theme-js/);
}

/** Desplaza hasta un elemento y espera a que Lenis y ScrollTrigger se asienten. */
export async function scrollToSelector(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`No existe ${sel}`);
    const y = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, y);
  }, selector);
  await page.waitForTimeout(600);
}
