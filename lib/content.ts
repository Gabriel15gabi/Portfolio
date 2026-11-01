/* ──────────────────────────────────────────────────────────
   CONTENIDO REAL DEL PORTFOLIO
   Fuente única de proyectos, stack, enlaces y experimentos.
   Las descripciones traducibles viven en lib/i18n.tsx (claves).
   Regla: nada inventado. Un enlace solo se muestra si existe.
   ────────────────────────────────────────────────────────── */

export const PROFILE = {
  name: "Gabriel Rodríguez",
  email: "gabriel_gabiz@hotmail.com",
  location: { es: "Mérida, España", en: "Mérida, Spain" },
  coords: "38.9161° N — 6.3437° W",
  cv: "/cvportfolio.pdf",
  cvPreview: "/cvpreview.jpeg",
  portrait: "/tufoto.jpeg",
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/gabriel-rodr%C3%ADguez-blanco-72776a252/",
      handle: "in/gabriel-rodríguez-blanco",
    },
    {
      label: "GitHub",
      href: "https://github.com/Gabriel15gabi",
      handle: "@Gabriel15gabi",
    },
  ],
} as const;

/** Composición visual de cada pieza en Selected Work. */
export type ProjectLayout = "type" | "bleed" | "column" | "block";

export type Project = {
  slug: string;
  num: string;
  title: string;
  descKey: string;
  stack: string[];
  demo: string | null;
  repo: string | null;
  /** Vídeo .mp4; el póster .jpg con el mismo nombre se usa como imagen. */
  media: string | null;
  /** Aspectos destacados tomados literalmente de la descripción. */
  featuresKey?: string;
  layout: ProjectLayout;
};

export const PROJECTS: Project[] = [
  {
    slug: "jobflow",
    num: "01",
    title: "JobFlow",
    descKey: "projects.jobflow.desc",
    featuresKey: "projects.jobflow.features",
    stack: ["Next.js", "TypeScript", "MongoDB", "Auth.js"],
    demo: "https://jobflow-lac.vercel.app",
    repo: "https://github.com/Gabriel15gabi/jobflow",
    media: null,
    layout: "type",
  },
  {
    slug: "streamio",
    num: "02",
    title: "Streamio",
    descKey: "projects.streamio.desc",
    stack: ["JavaScript", "Node.js", "Express", "SQLite"],
    demo: "https://streamio-red.vercel.app",
    repo: "https://github.com/Gabriel15gabi/Streamio",
    media: "/projects/streamio.mp4",
    layout: "bleed",
  },
  {
    slug: "invoice-tracker",
    num: "03",
    title: "Invoice Tracker",
    descKey: "projects.invoice.desc",
    stack: ["React", "Express", "SQLite", "JWT"],
    demo: "https://invoice-tracker-kohl.vercel.app",
    repo: "https://github.com/Gabriel15gabi/invoice-tracker",
    media: "/projects/invoice.mp4",
    layout: "column",
  },
  {
    slug: "restaurant",
    num: "04",
    title: "Restaurant App",
    descKey: "projects.restaurant.desc",
    stack: ["HTML5", "CSS3", "JavaScript"],
    demo: "https://el-restaurante-alpha.vercel.app",
    repo: "https://github.com/Gabriel15gabi/El-Restaurante",
    media: "/projects/restaurant.mp4",
    layout: "block",
  },
];

/* ── Stack — solo tecnologías confirmadas en el proyecto o el CV ── */
export const STACK: { key: string; items: string[] }[] = [
  {
    key: "frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "GSAP",
      "Lenis",
    ],
  },
  { key: "backend", items: ["Node.js", "Express", "REST APIs", "JWT", "Auth.js"] },
  { key: "databases", items: ["SQL", "SQLite", "MongoDB"] },
  { key: "workflow", items: ["Git", "GitHub", "Vercel", "VS Code"] },
  { key: "ai", items: ["OpenAI API", "AI matching", "Workflow automation"] },
];

/* ── Experimental Zone ─────────────────────────────────────
   status:
   - "live"  → existe y se ejecuta en la página.
   - "slot"  → hueco preparado, todavía sin experimento.
   Para añadir uno nuevo: cambiar el status y conectar su
   componente en components/sections/Experimental.tsx. */
export type Experiment = {
  id: string;
  code: string;
  titleKey: string;
  medium: string;
  status: "live" | "slot";
};

export const EXPERIMENTS: Experiment[] = [
  { id: "particles", code: "EXP—01", titleKey: "exp.particles", medium: "Canvas 2D", status: "live" },
  { id: "kinetic", code: "EXP—02", titleKey: "exp.kinetic", medium: "DOM / GSAP", status: "slot" },
  { id: "ai", code: "EXP—03", titleKey: "exp.ai", medium: "LLM API", status: "slot" },
  { id: "webgl", code: "EXP—04", titleKey: "exp.webgl", medium: "WebGL / Three.js", status: "slot" },
];
