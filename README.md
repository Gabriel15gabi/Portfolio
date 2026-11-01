# Gabriel Rodríguez — Portfolio

**Brutalist Digital Object.** Portfolio personal construido con Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP + ScrollTrigger y Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Estructura

```
app/
  layout.tsx          Fuentes (Anton, Space Grotesk, IBM Plex Mono), metadata SEO, JSON-LD
  page.tsx            Orden de secciones
  globals.css         Tokens de diseño (paleta, tipografía, temas) y utilidades
lib/
  content.ts          Fuente única: perfil, proyectos, stack y experimentos
  i18n.tsx            Traducciones ES/EN + LanguageProvider
  gsap.ts             Registro de plugins y media queries compartidas
components/
  system/             Nav + menú fullscreen, cursor, intro, Lenis, temas, cookies
  sections/           00 Intro · Manifesto · 01 Work · 02 Experimental · 03 Engineer · 04 Contact
  ui/                 Reveal (máscaras), KineticLine, Parallax, SectionHeader, ProjectMedia
  experiments/        Experimentos de la Experimental Zone (EXP—01 partículas)
```

## Cómo editar

- **Colores y tipografías:** `@theme` en `app/globals.css`. Los temas `light`, `dark` y `red` se aplican por sección con `data-theme`.
- **Proyectos:** añade una entrada en `PROJECTS` (`lib/content.ts`) y su descripción en `lib/i18n.tsx`. `layout` elige la composición (`type`, `bleed`, `column`, `block`). Un enlace solo aparece si existe.
- **Experimentos:** cambia el `status` de un hueco a `"live"` en `EXPERIMENTS` y conecta su componente en `components/sections/Experimental.tsx`.
- **Formulario:** Web3Forms. La clave puede definirse en `NEXT_PUBLIC_WEB3FORMS_KEY`.

## Movimiento y accesibilidad

- Todas las animaciones se montan con `gsap.matchMedia()`: con `prefers-reduced-motion` el contenido se muestra estático y el scroll vuelve a ser nativo.
- Parallax, distorsión de imagen y cursor propio solo en escritorio con puntero fino.
- El experimento de partículas se pausa fuera de pantalla y tiene botón de pausa.
