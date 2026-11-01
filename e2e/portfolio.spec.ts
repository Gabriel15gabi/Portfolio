import { test, expect } from "@playwright/test";
import { acceptCookies, collectErrors, scrollToSelector, waitForApp } from "./helpers";

const PROJECTS = [
  { title: "JobFlow", demo: "https://jobflow-lac.vercel.app", repo: "https://github.com/Gabriel15gabi/jobflow" },
  { title: "Streamio", demo: "https://streamio-red.vercel.app", repo: "https://github.com/Gabriel15gabi/Streamio" },
  { title: "Invoice Tracker", demo: "https://invoice-tracker-kohl.vercel.app", repo: "https://github.com/Gabriel15gabi/invoice-tracker" },
  { title: "Restaurant App", demo: "https://el-restaurante-alpha.vercel.app", repo: "https://github.com/Gabriel15gabi/El-Restaurante" },
];

test.describe("Carga y estructura", () => {
  test("carga sin errores de consola y recorre toda la página", async ({ page }) => {
    const errors = collectErrors(page);
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 800) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test("tiene un único h1 con el nombre y todas las secciones", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Gabriel Rodríguez" })).toBeAttached();
    for (const id of ["#top", "#manifesto", "#work", "#lab", "#engineer", "#contact"]) {
      await expect(page.locator(id)).toBeAttached();
    }
    for (const name of ["Selected Work", "Experimental Zone", "The Engineer"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
  });

  test("no hay scroll horizontal", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("metadata SEO y datos estructurados", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Gabriel Rodríguez/);
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(ld ?? "{}");
    expect(data["@type"]).toBe("Person");
    expect(data.sameAs).toContain("https://github.com/Gabriel15gabi");
  });
});

test.describe("Proyectos", () => {
  test("los cuatro proyectos reales con sus enlaces de demo y código", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    for (const p of PROJECTS) {
      const article = page.locator("article", { has: page.locator(`h3:has-text("${p.title}")`) }).first();
      await expect(article).toBeAttached();
      await expect(article.locator(`a[href="${p.demo}"]`).first()).toBeAttached();
      await expect(article.locator(`a[href="${p.repo}"]`)).toBeAttached();
    }
    // Los enlaces externos abren en pestaña nueva y sin opener.
    const external = page.locator('#work a[target="_blank"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("la zona experimental solo marca como activo EXP—01", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    const lab = page.locator("#lab");
    await expect(lab.getByText("Activo", { exact: true })).toHaveCount(1);
    await expect(lab.getByText("Hueco reservado", { exact: true })).toHaveCount(3);
  });
});

test.describe("Idioma", () => {
  test("cambia a inglés y actualiza html[lang]", async ({ page, isMobile }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    if (isMobile) {
      await page.getByRole("button", { name: /Menú/ }).click();
      await page.locator("#site-menu").getByRole("button", { name: "EN", exact: true }).click();
      await page.keyboard.press("Escape");
    } else {
      await page.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    }
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Independent developer creating digital products").first()).toBeAttached();
  });

  test("con cookies aceptadas el idioma persiste al recargar", async ({ page, isMobile }) => {
    test.skip(isMobile, "La lógica es la misma en móvil");
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await page.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("con cookies rechazadas el idioma no se guarda", async ({ page, isMobile }) => {
    test.skip(isMobile, "La lógica es la misma en móvil");
    await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
    await page.goto("/");
    await waitForApp(page);
    await page.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.evaluate(() => localStorage.getItem("lang"))).toBeNull();
    expect(await page.evaluate(() => document.cookie)).not.toContain("lang=");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });
});

test.describe("Menú fullscreen", () => {
  test("abre, atrapa el foco, cierra con Escape y navega", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    const toggle = page.getByRole("button", { name: /Menú/ });
    await toggle.click();
    await expect(page.getByRole("button", { name: /Cerrar/ })).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#site-menu");
    await expect(menu).not.toHaveAttribute("inert");

    // El foco no sale del menú al tabular muchas veces.
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        const ok = !!a && (!!a.closest("#site-menu") || a.getAttribute("aria-controls") === "site-menu");
        return ok ? "inside" : (a?.outerHTML.slice(0, 120) ?? "none");
      });
      expect(where, `Tab ${i + 1}`).toBe("inside");
    }

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /Menú/ })).toHaveAttribute("aria-expanded", "false");

    // Navegar a Contacto desde el menú.
    await page.getByRole("button", { name: /Menú/ }).click();
    await menu.getByRole("link", { name: "Contacto" }).click();
    await expect(page.getByRole("button", { name: /Menú/ })).toHaveAttribute("aria-expanded", "false");
    await expect
      .poll(async () => page.evaluate(() => document.querySelector("#contact")!.getBoundingClientRect().top), {
        timeout: 5000,
      })
      .toBeLessThan(80);
  });
});

test.describe("Temas por sección", () => {
  test("el fondo pasa de claro a oscuro y a rojo", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await scrollToSelector(page, "#lab");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await scrollToSelector(page, "#contact");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "red");
  });
});

test.describe("Contacto", () => {
  test("copiar email da feedback", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Permisos de portapapeles");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await acceptCookies(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Copiar email" }).click();
    await expect(page.getByRole("button", { name: /Email copiado/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("gabriel_gabiz@hotmail.com");
  });

  test("el formulario envía y muestra confirmación", async ({ page }) => {
    let payload: Record<string, string> = {};
    await page.route("https://api.web3forms.com/submit", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    await acceptCookies(page);
    await page.goto("/");
    await page.getByLabel("01 — Nombre").fill("Ada");
    await page.getByLabel("02 — Email").fill("ada@example.com");
    await page.getByLabel("03 — Mensaje").fill("Hola, tengo un buen problema.");
    await page.getByRole("button", { name: /Enviar mensaje/ }).click();
    await expect(page.getByRole("button", { name: /Mensaje enviado/ })).toBeVisible();
    expect(payload.email).toBe("ada@example.com");
    expect(payload.access_key).toBeTruthy();
    await expect(page.getByLabel("01 — Nombre")).toHaveValue("");
  });

  test("el formulario muestra error si el servicio falla", async ({ page }) => {
    await page.route("https://api.web3forms.com/submit", (route) =>
      route.fulfill({ json: { success: false } })
    );
    await acceptCookies(page);
    await page.goto("/");
    await page.getByLabel("01 — Nombre").fill("Ada");
    await page.getByLabel("02 — Email").fill("ada@example.com");
    await page.getByLabel("03 — Mensaje").fill("Hola");
    await page.getByRole("button", { name: /Enviar mensaje/ }).click();
    await expect(page.getByRole("button", { name: /No se pudo enviar/ })).toBeVisible();
  });

  test("enlaces de contacto y CV", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact.locator('a[href="mailto:gabriel_gabiz@hotmail.com"]')).toBeAttached();
    await expect(contact.locator('a[href="https://github.com/Gabriel15gabi"]')).toBeAttached();
    await expect(contact.locator('a[href*="linkedin.com/in/"]')).toBeAttached();
    const cv = await page.request.get("/cvportfolio.pdf");
    expect(cv.ok()).toBe(true);
    expect(cv.headers()["content-type"]).toContain("pdf");
  });
});

test.describe("Cookies", () => {
  test("el aviso aparece y se cierra al rechazar", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "Cookies" });
    await expect(dialog).toBeVisible({ timeout: 6000 });
    await dialog.getByRole("button", { name: "Rechazar" }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem("cookie-consent"))).toBe("declined");
  });
});

test.describe("Partículas del nombre", () => {
  test("el nombre se dibuja en partículas sobre el canvas", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await expect(page.locator("[data-intro-name]")).toHaveAttribute("data-particles", "on");
    // El canvas tiene píxeles pintados una vez ensamblado.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const c = document.querySelector<HTMLCanvasElement>("#top canvas")!;
            const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
            let n = 0;
            for (let i = 3; i < d.length; i += 64) if (d[i] > 0) n++;
            return n;
          }),
        { timeout: 6000 }
      )
      .toBeGreaterThan(200);
  });
});

test.describe("prefers-reduced-motion", () => {
  test.use({ colorScheme: "light" });

  test("sin intro, sin partículas y con el nombre visible en texto", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await expect(page.locator(".boot-screen")).toHaveCount(0);
    await expect(page.locator("[data-intro-name]")).not.toHaveAttribute("data-particles", "on");
    const color = await page
      .locator("[data-intro-name] [data-char]")
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
    // El texto del manifiesto es totalmente opaco (sin animación de scroll).
    await scrollToSelector(page, "#manifesto");
    const opacity = await page.locator("[data-word]").last().evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
    expect(errors).toEqual([]);
  });
});
