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
  fonts/              Fuentes autoalojadas (woff2, latin) con sus licencias OFL
  page.tsx            Orden de secciones
  globals.css         Tokens de diseño (paleta, tipografía, temas) y utilidades
lib/
  content.ts          Fuente única: perfil, proyectos, stack y experimentos
  i18n.tsx            Traducciones ES/EN + LanguageProvider (cada idioma completo)
  ai/                 Modelos del laboratorio, escritos a mano y sin librerías:
                        pixelnet.ts  red neuronal (Fourier features + MLP, Adam)
                        gridagent.ts agente de Q-learning con planificación (Dyna-Q)
                        inbox.ts     clasificador bayesiano ES/EN para el flujo
  gsap.ts             Registro de plugins y media queries compartidas
components/
  system/             Nav + menú fullscreen, cursor, intro, Lenis, temas, cookies
  sections/           00 Intro · Manifesto · 01 Proyectos · 02 Laboratorio IA · 03 Quién soy · 04 Contacto
  ui/                 Reveal (máscaras), KineticLine, Parallax, SectionHeader, ProjectMedia
  experiments/        Laboratorio IA: EXP—01 la red aprende a dibujar, EXP—02 un agente
                      aprende solo, EXP—03 automatización con IA. Cada motor (*-engine.ts)
                      se descarga aparte y solo corre con el experimento a la vista.
```

## Cómo editar

- **Colores y tipografías:** `@theme` en `app/globals.css`. Los temas `light`, `dark` y `red` se aplican por sección con `data-theme`. Las fuentes se cargan con `next/font/local` desde `app/fonts`, así la build no depende de Google Fonts.
- **Proyectos:** añade una entrada en `PROJECTS` (`lib/content.ts`) y su descripción en `lib/i18n.tsx`. `layout` elige la composición (`type`, `bleed`, `column`, `block`). Un enlace solo aparece si existe.
- **Textos:** todo el texto visible vive en `lib/i18n.tsx`, con las mismas claves en `es` y `en`. Solo se quedan igual los nombres propios y los términos del oficio (frontend, backend, full stack, API).
- **Laboratorio IA:** los hiperparámetros están en `lib/ai/config.ts`; las frases de entrenamiento y de ejemplo del flujo, en `lib/ai/inbox.ts`. Para añadir un experimento, crea su componente en `components/experiments/`, añádelo a `EXPERIMENTS` y móntalo en `components/sections/Experimental.tsx`.
- **Formulario:** Web3Forms. La clave puede definirse en `NEXT_PUBLIC_WEB3FORMS_KEY`.

## Movimiento y accesibilidad

- Todas las animaciones se montan con `gsap.matchMedia()`: con `prefers-reduced-motion` el contenido se muestra estático y el scroll vuelve a ser nativo.
- Parallax, distorsión de imagen y cursor propio solo en escritorio con puntero fino.
- Los experimentos del laboratorio se pausan fuera de pantalla o con la pestaña oculta y tienen botón de pausa. Con `prefers-reduced-motion` arrancan en pausa y ya entrenados.
