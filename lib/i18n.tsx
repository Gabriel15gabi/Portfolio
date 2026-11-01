"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

/* ── Tipos ──────────────────────────────────────── */
export type Lang = "es" | "en";

type Dict = Record<string, string>;

/* ── Traducciones ───────────────────────────────── */
// Los titulares monumentales (NOT HERE TO FIT IN…, HAVE A GOOD PROBLEM?)
// son parte de la identidad y se mantienen en inglés en ambos idiomas.
// Todo el texto funcional y descriptivo se traduce.
const translations: Record<Lang, Dict> = {
  es: {
    // nav
    "nav.menu": "Menú",
    "nav.close": "Cerrar",
    "nav.home": "Inicio",
    "nav.work": "Trabajo",
    "nav.lab": "Laboratorio",
    "nav.engineer": "Perfil",
    "nav.contact": "Contacto",
    "nav.skip": "Saltar al contenido",
    "nav.index": "Índice",

    // intro
    "intro.role": "Desarrollador independiente",
    "intro.description":
      "Desarrollador independiente que crea productos digitales, experiencias web y sistemas inteligentes.",
    "intro.available": "Disponible — incorporación inmediata",
    "intro.based": "Con base en",

    // manifesto
    "manifesto.label": "Manifiesto",
    "manifesto.text":
      "Construyo experiencias digitales que fusionan diseño, tecnología e inteligencia artificial para crear productos que importan.",

    // work
    "work.label": "Trabajo seleccionado",
    "work.meta": "Proyectos reales — código y demo en vivo",
    "work.stack": "Stack",
    "work.demo": "Demo en vivo",
    "work.code": "Código",
    "work.index": "Pieza",
    "work.next": "Siguiente pieza",
    "work.nextSub": "Nuevo proyecto en producción. Se publicará aquí cuando esté terminado.",
    "projects.jobflow.desc":
      "Tracker de candidaturas con matching por IA y motor de automatización propio tipo Make: workflows con disparadores, kanban y analíticas.",
    "projects.jobflow.features": "Matching por IA|Workflows con disparadores|Kanban|Analíticas",
    "projects.streamio.desc":
      "Clon de Netflix full-stack: catálogo con la API de TMDB, login y lista de favoritos.",
    "projects.invoice.desc":
      "App de facturación full-stack con login (JWT), base de datos, gráficos y exportación de facturas a PDF.",
    "projects.restaurant.desc":
      "Web moderna y responsive para restaurante con reservas y menú interactivo.",

    // experimental
    "exp.label": "Zona experimental",
    "exp.intro":
      "Laboratorio de desarrollo creativo. Aquí se publican prototipos en marcha: partículas, tipografía cinética, IA y WebGL. Solo se marca como activo lo que existe y funciona.",
    "exp.live": "Activo",
    "exp.slot": "Hueco reservado",
    "exp.slotSub": "Todavía no hay experimento aquí.",
    "exp.particles": "Campo tipográfico de partículas",
    "exp.particlesHint": "Mueve el cursor o toca para dispersar las partículas.",
    "exp.kinetic": "Tipografía cinética",
    "exp.ai": "Prototipo de IA",
    "exp.webgl": "Experiencia WebGL",
    "exp.pause": "Pausar",
    "exp.play": "Reanudar",

    // engineer
    "eng.label": "El ingeniero",
    "eng.bio":
      "Soy Gabriel, desarrollador web full stack enfocado en frontend. Construyo sitios web de principio a fin: del diseño de la interfaz a la lógica del servidor y la integración de IA.",
    "eng.pillar1.title": "Frontend",
    "eng.pillar1.desc":
      "La cara visible de la web: lo que el usuario ve, toca y siente. Interfaces responsive y animaciones con React, Next.js y Tailwind.",
    "eng.pillar2.title": "Backend",
    "eng.pillar2.desc":
      "El motor que da vida a la web por dentro: APIs, lógica y datos con Node.js y SQL.",
    "eng.pillar3.title": "IA & Automatización",
    "eng.pillar3.desc":
      "El valor diferencial: integro inteligencia artificial y automatizo procesos con la API de OpenAI.",
    "eng.stack": "Stack técnico",
    "eng.cat.frontend": "Frontend",
    "eng.cat.backend": "Backend",
    "eng.cat.databases": "Bases de datos",
    "eng.cat.workflow": "Flujo de trabajo",
    "eng.cat.ai": "IA & Automatización",
    "eng.portrait": "Retrato de Gabriel Rodríguez",

    // contact
    "contact.label": "Contacto",
    "contact.intro":
      "Cuéntame tu idea o tu oferta. Te respondo en menos de 24 horas.",
    "contact.copy": "Copiar email",
    "contact.copied": "Email copiado",
    "contact.sent": "Mensaje enviado",
    "contact.sending": "Enviando…",
    "contact.error": "No se pudo enviar, inténtalo de nuevo",
    "contact.available": "Disponible para incorporación inmediata",
    "contact.cv": "Descargar CV",
    "contact.cvPreview": "Vista previa del CV",
    "contact.channels": "Canales",
    "contact.write": "Escríbeme",
    "contact.form.name": "Nombre",
    "contact.form.email": "Email",
    "contact.form.message": "Mensaje",
    "contact.form.placeholder": "Cuéntame sobre tu proyecto…",
    "contact.form.send": "Enviar mensaje",
    "contact.footer": "Diseñado y desarrollado por Gabriel Rodríguez",
    "contact.top": "Volver arriba",

    // loader
    "loader.label": "Cargando",

    // cookies
    "cookies.text":
      "Uso cookies para recordar tus preferencias (como el idioma) y mejorar tu experiencia.",
    "cookies.accept": "Aceptar",
    "cookies.decline": "Rechazar",
  },
  en: {
    "nav.menu": "Menu",
    "nav.close": "Close",
    "nav.home": "Home",
    "nav.work": "Work",
    "nav.lab": "Lab",
    "nav.engineer": "Profile",
    "nav.contact": "Contact",
    "nav.skip": "Skip to content",
    "nav.index": "Index",

    "intro.role": "Independent developer",
    "intro.description":
      "Independent developer creating digital products, web experiences and intelligent systems.",
    "intro.available": "Available — immediate start",
    "intro.based": "Based in",

    "manifesto.label": "Manifesto",
    "manifesto.text":
      "I build digital experiences that blend design, technology and artificial intelligence to create products that matter.",

    "work.label": "Selected work",
    "work.meta": "Real projects — code and live demo",
    "work.stack": "Stack",
    "work.demo": "Live demo",
    "work.code": "Code",
    "work.index": "Piece",
    "work.next": "Next piece",
    "work.nextSub": "New project in production. It will be published here once it's finished.",
    "projects.jobflow.desc":
      "Job application tracker with AI matching and a hand-built Make-style automation engine: trigger-based workflows, kanban and analytics.",
    "projects.jobflow.features": "AI matching|Trigger-based workflows|Kanban|Analytics",
    "projects.streamio.desc":
      "Full-stack Netflix clone: catalog powered by the TMDB API, login and a favorites list.",
    "projects.invoice.desc":
      "Full-stack invoicing app with login (JWT), database, charts and PDF invoice export.",
    "projects.restaurant.desc":
      "Modern responsive restaurant website with bookings and interactive menu.",

    "exp.label": "Experimental zone",
    "exp.intro":
      "A creative development lab. Work-in-progress prototypes land here: particles, kinetic type, AI and WebGL. Only what actually exists and runs is marked as live.",
    "exp.live": "Live",
    "exp.slot": "Reserved slot",
    "exp.slotSub": "No experiment here yet.",
    "exp.particles": "Particle type field",
    "exp.particlesHint": "Move the cursor or tap to scatter the particles.",
    "exp.kinetic": "Kinetic typography",
    "exp.ai": "AI prototype",
    "exp.webgl": "WebGL experience",
    "exp.pause": "Pause",
    "exp.play": "Resume",

    "eng.label": "The engineer",
    "eng.bio":
      "I'm Gabriel, a full stack web developer focused on frontend. I build websites end to end: from the interface design to the server logic and AI integration.",
    "eng.pillar1.title": "Frontend",
    "eng.pillar1.desc":
      "The visible side of the web: what users see, touch and feel. Responsive interfaces and animations with React, Next.js and Tailwind.",
    "eng.pillar2.title": "Backend",
    "eng.pillar2.desc":
      "The engine that powers the web from within: APIs, logic and data with Node.js and SQL.",
    "eng.pillar3.title": "AI & Automation",
    "eng.pillar3.desc":
      "The differentiator: I integrate artificial intelligence and automate processes with the OpenAI API.",
    "eng.stack": "Technical stack",
    "eng.cat.frontend": "Frontend",
    "eng.cat.backend": "Backend",
    "eng.cat.databases": "Databases",
    "eng.cat.workflow": "Development workflow",
    "eng.cat.ai": "AI & Automation",
    "eng.portrait": "Portrait of Gabriel Rodríguez",

    "contact.label": "Contact",
    "contact.intro":
      "Tell me your idea or your offer. I'll reply within 24 hours.",
    "contact.copy": "Copy email",
    "contact.copied": "Email copied",
    "contact.sent": "Message sent",
    "contact.sending": "Sending…",
    "contact.error": "Couldn't send, please try again",
    "contact.available": "Available for immediate start",
    "contact.cv": "Download CV",
    "contact.cvPreview": "CV preview",
    "contact.channels": "Channels",
    "contact.write": "Write to me",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.placeholder": "Tell me about your project…",
    "contact.form.send": "Send message",
    "contact.footer": "Designed and built by Gabriel Rodríguez",
    "contact.top": "Back to top",

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

/* Preferencia de idioma como "store" externo (localStorage).
   useSyncExternalStore da "es" en SSR/hidratación y la preferencia
   guardada justo después, sin setState dentro de un efecto. */
const listeners = new Set<() => void>();
let memoryLang: Lang | null = null; // elección de esta visita
function readLang(): Lang {
  try {
    const stored = localStorage.getItem("lang");
    // La elección de esta visita (memoria) manda sobre lo guardado.
    return memoryLang !== null ? memoryLang : stored === "en" ? "en" : "es";
  } catch {
    return memoryLang ?? "es";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "es" as Lang);

  // Persistimos en localStorage + cookie (1 año) solo con consentimiento.
  const setLang = useCallback((l: Lang) => {
    memoryLang = l;
    try {
      // Solo se guarda la preferencia si el visitante aceptó las cookies.
      if (localStorage.getItem("cookie-consent") === "accepted") {
        localStorage.setItem("lang", l);
        document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        localStorage.removeItem("lang");
      }
    } catch {
      /* almacenamiento no disponible */
    }
    listeners.forEach((cb) => cb());
  }, []);

  // Mantiene el atributo lang del documento sincronizado (accesibilidad + SEO).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? key,
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
