"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

/* ── Tipos ──────────────────────────────────────── */
export type Lang = "es" | "en";

type Dict = Record<string, string>;

/* ── Traducciones ───────────────────────────────── */
const translations: Record<Lang, Dict> = {
  es: {
    // nav
    "nav.home": "Inicio",
    "nav.about": "Sobre mí",
    "nav.projects": "Proyectos",
    "nav.contact": "Contacto",

    // hero
    "hero.description":
      "Interfaces modernas, backends robustos y soluciones con inteligencia artificial.",
    "hero.cta": "Ver proyectos",

    // about
    "about.label": "Sobre mí",
    "about.heading1": "Convierto ideas en",
    "about.heading2": "productos digitales",
    "about.bio":
      "Soy Gabriel, desarrollador web full stack enfocado en frontend. Construyo sitios web de principio a fin: del diseño de la interfaz a la lógica del servidor y la integración de IA.",
    "about.pillar1.title": "Frontend",
    "about.pillar1.desc":
      "La cara visible de la web: lo que el usuario ve, toca y siente. Interfaces responsive y animaciones con React, Next.js y Tailwind.",
    "about.pillar2.title": "Backend",
    "about.pillar2.desc":
      "El motor que da vida a la web por dentro: APIs, lógica y datos con Node.js y SQL.",
    "about.pillar3.title": "IA & Automatización",
    "about.pillar3.desc":
      "El valor diferencial: integro inteligencia artificial y automatizo procesos con la API de OpenAI.",

    // text reveal
    "reveal.label": "Filosofía",
    "reveal.text":
      "Construyo experiencias digitales que fusionan diseño, tecnología e inteligencia artificial para crear productos que importan.",

    // skills
    "skills.label": "Stack",

    // projects
    "projects.label": "TRABAJO SELECCIONADO",
    "projects.heading": "Proyectos",
    "projects.view": "Ver proyecto",
    "projects.demo": "Demo",
    "projects.code": "Código",
    "projects.soon": "Próximamente",
    "projects.soonSub": "Nuevo proyecto en camino",
    "projects.streamio.desc":
      "Clon de Netflix full-stack: catálogo con la API de TMDB, login y lista de favoritos.",
    "projects.invoice.desc":
      "App de facturación full-stack con login (JWT), base de datos, gráficos y exportación de facturas a PDF.",
    "projects.restaurant.desc":
      "Web moderna y responsive para restaurante con reservas y menú interactivo.",
    "projects.jobtracker.desc":
      "Gestor de candidaturas full-stack: React con backend en Express y SQLite, con estados y filtros.",

    // contact
    "contact.label": "Contacto",
    "contact.heading1": "¿Tienes un proyecto",
    "contact.heading2": "en mente",
    "contact.intro":
      "Cuéntame tu idea o tu oferta. Te respondo en menos de 24 horas.",
    "contact.location": "Mérida, España",
    "contact.copy": "Copiar email",
    "contact.copied": "¡Email copiado!",
    "contact.sent": "Mensaje enviado",
    "contact.sending": "Enviando…",
    "contact.error": "No se pudo enviar, inténtalo de nuevo",
    "contact.available": "Disponible para incorporación inmediata",
    "contact.footer": "Gabriel Rodríguez — Diseñado & desarrollado con pasión",
    "contact.cv": "Descargar CV",
    "contact.cvPreview": "Vista previa",
    "contact.form.name": "Nombre",
    "contact.form.email": "Email",
    "contact.form.message": "Mensaje",
    "contact.form.placeholder": "Cuéntame sobre tu proyecto...",
    "contact.form.send": "Enviar mensaje",

    // loader
    "loader.label": "Cargando",

    // cookies
    "cookies.text":
      "Uso cookies para recordar tus preferencias (como el idioma) y mejorar tu experiencia.",
    "cookies.accept": "Aceptar",
    "cookies.decline": "Rechazar",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.contact": "Contact",

    "hero.description":
      "Modern interfaces, robust backends and AI-powered solutions.",
    "hero.cta": "View projects",

    "about.label": "About me",
    "about.heading1": "I turn ideas into",
    "about.heading2": "digital products",
    "about.bio":
      "I'm Gabriel, a full stack web developer focused on frontend. I build websites end to end: from the interface design to the server logic and AI integration.",
    "about.pillar1.title": "Frontend",
    "about.pillar1.desc":
      "The visible side of the web: what users see, touch and feel. Responsive interfaces and animations with React, Next.js and Tailwind.",
    "about.pillar2.title": "Backend",
    "about.pillar2.desc":
      "The engine that powers the web from within: APIs, logic and data with Node.js and SQL.",
    "about.pillar3.title": "AI & Automation",
    "about.pillar3.desc":
      "The differentiator: I integrate artificial intelligence and automate processes with the OpenAI API.",

    "reveal.label": "Philosophy",
    "reveal.text":
      "I build digital experiences that blend design, technology and artificial intelligence to create products that matter.",

    "skills.label": "Stack",

    "projects.label": "SELECTED WORK",
    "projects.heading": "Projects",
    "projects.view": "View project",
    "projects.demo": "Demo",
    "projects.code": "Code",
    "projects.soon": "Coming soon",
    "projects.soonSub": "New project on the way",
    "projects.streamio.desc":
      "Full-stack Netflix clone: catalog powered by the TMDB API, login and a favorites list.",
    "projects.invoice.desc":
      "Full-stack invoicing app with login (JWT), database, charts and PDF invoice export.",
    "projects.restaurant.desc":
      "Modern responsive restaurant website with bookings and interactive menu.",
    "projects.jobtracker.desc":
      "Full-stack job application tracker: React with an Express + SQLite backend, statuses and filters.",

    "contact.label": "Contact",
    "contact.heading1": "Have a project",
    "contact.heading2": "in mind",
    "contact.intro":
      "Tell me your idea or your offer. I'll reply within 24 hours.",
    "contact.location": "Mérida, Spain",
    "contact.copy": "Copy email",
    "contact.copied": "Email copied!",
    "contact.sent": "Message sent",
    "contact.sending": "Sending…",
    "contact.error": "Couldn't send, please try again",
    "contact.available": "Available for immediate start",
    "contact.footer": "Gabriel Rodríguez — Designed & built with passion",
    "contact.cv": "Download CV",
    "contact.cvPreview": "Preview",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.placeholder": "Tell me about your project...",
    "contact.form.send": "Send message",

    "loader.label": "Loading",

    "cookies.text":
      "I use cookies to remember your preferences (like language) and improve your experience.",
    "cookies.accept": "Accept",
    "cookies.decline": "Decline",
  },
};

/* ── Context ────────────────────────────────────── */
interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: "es",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Siempre arranca en "es" en SSR y primer render para evitar mismatch de hidratación.
  const [lang, setLangState] = useState<Lang>("es");

  // Tras montar, recuperamos la preferencia guardada (si existe).
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "es" || stored === "en") setLangState(stored);
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  // Persistimos en localStorage + cookie (1 año) al cambiar de idioma.
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
      document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? key,
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
