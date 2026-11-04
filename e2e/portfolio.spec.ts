import { test, expect, type Page } from "@playwright/test";
import { acceptCookies, collectErrors, scrollToSelector, waitForApp } from "./helpers";
import { POOL } from "../lib/ai/inbox";

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
    // En español, todos los titulares están en español.
    for (const name of ["Proyectos", "Laboratorio IA", "Quién soy"]) {
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

});

test.describe("Laboratorio IA", () => {
  test("tres modelos en vivo que entrenan solos con el experimento a la vista", async ({ page }) => {
    const errors = collectErrors(page);
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    const lab = page.locator("#lab");
    await expect(lab.getByText("En vivo", { exact: true })).toHaveCount(3);
    await expect(lab.locator('canvas[role="img"]')).toHaveCount(3);
    for (const name of ["La red aprende a dibujar", "Un agente aprende solo", "Automatización con IA"]) {
      await expect(lab.getByRole("heading", { level: 3, name })).toBeAttached();
    }
    // Los modelos solo trabajan a la vista: al llegar, el contador de pasos sube.
    await scrollToSelector(page, 'article[aria-labelledby="exp-net"]');
    const counter = lab.locator("p", { hasText: "pasos de entrenamiento en esta visita" }).locator("span").first();
    await expect
      .poll(async () => Number((await counter.textContent())?.replace(/\D/g, "") || 0), { timeout: 10_000 })
      .toBeGreaterThan(50);
    expect(errors).toEqual([]);
  });

  test("la automatización clasifica un mensaje escrito por el visitante", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await scrollToSelector(page, 'article[aria-labelledby="exp-flow"]');
    const flow = page.locator('article[aria-labelledby="exp-flow"]');
    await flow.getByLabel("Mensaje para la automatización").fill("Quería pedir presupuesto para la web de mi academia");
    await flow.getByRole("button", { name: /Enviar/ }).click();
    const row = flow.locator("li", { hasText: "academia" });
    await expect(row).toContainText("Tú", { timeout: 15_000 });
    await expect(row).toContainText("Presupuesto");
  });

  test("con el inglés guardado, el flujo trabaja en inglés desde el principio", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cookie-consent", "accepted");
      localStorage.setItem("lang", "en");
    });
    await page.goto("/");
    await waitForApp(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await scrollToSelector(page, 'article[aria-labelledby="exp-flow"]');
    const first = page.locator('article[aria-labelledby="exp-flow"] ol li').first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    const text = (await first.locator(".truncate").textContent())?.trim();
    expect(POOL.en).toContain(text);
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
    // En inglés, todo en inglés: titulares y título de la pestaña.
    for (const name of ["Selected Work", "AI Lab", "The Engineer"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
    }
    await expect(page).toHaveTitle(/Independent Developer/);
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
  test("copiar el correo da feedback", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Permisos de portapapeles");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await acceptCookies(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Copiar correo" }).click();
    await expect(page.getByRole("button", { name: /Correo copiado/ })).toBeVisible();
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
    await page.getByLabel("02 — Correo").fill("ada@example.com");
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
    await page.getByLabel("02 — Correo").fill("ada@example.com");
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

test.describe("Responsive", () => {
  test.use({ reducedMotion: "reduce" });

  /**
   * Textos más anchos que su caja con overflow recortado (sin contar la cinta
   * animada ni los textos solo para lectores de pantalla), y líneas de los
   * titulares más anchas que su máscara.
   */
  const clippedTexts = (page: Page) =>
    page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("body *")) {
        if (el.closest(".animate-ticker") || el.querySelector(".animate-ticker")) continue;
        if (!/(clip|hidden)/.test(getComputedStyle(el).overflowX)) continue;
        const text = (el.textContent || "").trim().replace(/\s+/g, " ");
        if (text && el.clientWidth > 1 && el.scrollWidth > el.clientWidth + 2) out.push(text.slice(0, 40));
      }
      for (const el of document.querySelectorAll<HTMLElement>("[data-line]")) {
        if (el.scrollWidth > el.clientWidth + 2) out.push(`línea: ${(el.textContent || "").trim().slice(0, 40)}`);
      }
      return out;
    });

  for (const lang of ["es", "en"]) {
    for (const width of [320, 390, 768, 1024]) {
      test(`${lang} a ${width} px ningún texto queda cortado (página y menú)`, async ({ page, isMobile }) => {
        test.skip(isMobile, "Recorre los anchos él mismo");
        await page.setViewportSize({ width, height: 800 });
        await acceptCookies(page);
        await page.addInitScript((l) => localStorage.setItem("lang", l), lang);
        await page.goto("/");
        await waitForApp(page);
        expect(await clippedTexts(page)).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        ).toBeLessThanOrEqual(1);

        await page.locator('button[aria-controls="site-menu"]').click();
        await expect(page.locator("#site-menu a").first()).toBeVisible();
        expect(await clippedTexts(page)).toEqual([]);
      });
    }
  }
});

test.describe("Nombre de la portada", () => {
  test("las letras suben desde su máscara y el nombre queda visible", async ({ page }) => {
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    const name = page.locator("[data-intro-name]");
    await expect(name).toBeVisible();
    // Tras la entrada, todas las letras están en su sitio (sin desplazamiento vertical).
    await expect
      .poll(
        () =>
          name.evaluate((h1) =>
            [...h1.querySelectorAll<HTMLElement>("[data-char]")].every((c) => {
              const t = getComputedStyle(c).transform;
              return t === "none" || Math.abs(new DOMMatrix(t).m42) < 1;
            })
          ),
        { timeout: 6000 }
      )
      .toBe(true);
    await expect(page.locator("#top canvas")).toHaveCount(0);
  });
});

test.describe("Portada en móvil", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [316, 390]) {
    test(`a ${width} px el bloque rojo y los datos no pisan el nombre`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Composición de móvil");
      await page.setViewportSize({ width, height: 858 });
      await acceptCookies(page);
      await page.goto("/");
      await waitForApp(page);
      const block = await page.locator('[data-intro-block="m"]').boundingBox();
      const name = await page.locator("[data-intro-name]").boundingBox();
      const tagline = await page.locator("[data-intro-tagline]").first().boundingBox();
      expect(block && name && tagline).toBeTruthy();
      // El bloque rojo queda entre el texto y el nombre, sin tocar ninguno.
      expect(block!.y).toBeGreaterThanOrEqual(tagline!.y + tagline!.height);
      expect(block!.y + block!.height).toBeLessThanOrEqual(name!.y);
      // El bloque de escritorio no se muestra en móvil.
      await expect(page.locator('#top [data-intro-block]:not([data-intro-block="m"])')).toBeHidden();
      // La fila de metadatos ocupa dos líneas: sección + ciudad, y disponibilidad.
      const lines = await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("#top .label-mono.grid")!;
        const lh = parseFloat(getComputedStyle(row).lineHeight);
        return [...row.children].map((c) => Math.round((c as HTMLElement).getBoundingClientRect().height / lh));
      });
      expect(lines).toEqual([1, 1, 1]);
    });
  }
});

test.describe("prefers-reduced-motion", () => {
  test.use({ colorScheme: "light" });

  test("sin intro y con el nombre visible desde el principio", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await acceptCookies(page);
    await page.goto("/");
    await waitForApp(page);
    await expect(page.locator(".boot-screen")).toHaveCount(0);
    await expect(page.locator("[data-intro-name]")).toBeVisible();
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
