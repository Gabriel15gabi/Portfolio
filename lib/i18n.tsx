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
// Cada idioma va completo: en español todo está en español y en inglés
// todo en inglés, también los titulares monumentales y las etiquetas
// del cursor. Solo se quedan igual los nombres propios (React, GitHub…)
// y términos del oficio que se usan tal cual en español (frontend,
// backend, full stack, API).
const translations: Record<Lang, Dict> = {
  es: {
    // documento
    "meta.title": "Gabriel Rodríguez — Desarrollador independiente",

    // nav
    "nav.menu": "Menú",
    "nav.close": "Cerrar",
    "nav.home": "Inicio",
    "nav.work": "Proyectos",
    "nav.lab": "Laboratorio",
    "nav.engineer": "Perfil",
    "nav.contact": "Contacto",
    "nav.skip": "Saltar al contenido",
    "nav.index": "Índice",
    "nav.language": "Idioma",
    "nav.logo": "Gabriel Rodríguez — inicio",

    // cursor contextual
    "cursor.open": "Abrir ↗",
    "cursor.code": "Código ↗",
    "cursor.play": "Ver",
    "cursor.mail": "Escribir ↗",
    "cursor.copy": "Copiar",
    "cursor.pdf": "PDF ↓",
    "cursor.send": "Enviar",

    // intro
    "intro.label": "Introducción",
    "intro.role": "Desarrollador independiente",
    "intro.tagline1": "No vengo a encajar.",
    "intro.tagline2": "Vengo a construir.",
    "intro.description":
      "Desarrollador independiente que crea productos digitales, experiencias web y sistemas inteligentes.",
    "intro.available": "Disponible — incorporación inmediata",
    "intro.based": "Con base en",
    "intro.disciplines": "Frontend — Backend — IA y automatización",

    // loader
    "loader.brand": "Objeto digital brutalista",
    "loader.label": "Cargando",

    // manifesto
    "manifesto.label": "Manifiesto",
    "manifesto.text":
      "Construyo experiencias digitales que fusionan diseño, tecnología e inteligencia artificial para crear productos que importan.",
    "manifesto.tape": "Frontend|Backend|Bases de datos|IA y automatización|Disponible para trabajar|Mérida — España",

    // work
    "work.title": "Proyectos",
    "work.label": "Trabajo seleccionado",
    "work.meta": "Proyectos reales — código y demo en vivo",
    "work.demo": "Demo en vivo",
    "work.code": "Código",
    "work.index": "Pieza",
    "work.next": "Siguiente pieza",
    "work.nextTag": "En curso",
    "work.nextSub": "Nuevo proyecto en producción. Se publicará aquí cuando esté terminado.",
    "projects.jobflow.desc":
      "Gestor de candidaturas con análisis de compatibilidad por IA y un motor de automatización propio al estilo de Make: flujos con disparadores, tablero kanban y analíticas.",
    "projects.jobflow.features": "Compatibilidad por IA|Flujos con disparadores|Tablero kanban|Analíticas",
    "projects.streamio.desc":
      "Clon de Netflix full stack: catálogo con la API de TMDB, inicio de sesión y lista de favoritos.",
    "projects.invoice.desc":
      "App de facturación full stack con inicio de sesión (JWT), base de datos, gráficos y exportación de facturas a PDF.",
    "projects.restaurant.desc":
      "Web moderna para restaurante, adaptada a móvil, con reservas y menú interactivo.",

    // laboratorio
    "exp.title": "Laboratorio IA",
    "exp.label": "Zona experimental",
    "exp.meta": "Redes neuronales · Agentes · Automatización",
    "exp.intro":
      "La IA, en directo: modelos que aprenden solos aquí mismo, en tu navegador. Escritos a mano, sin librerías.",
    "exp.counter": "pasos de entrenamiento en esta visita",
    "exp.live": "En vivo",
    "exp.pause": "Pausar",
    "exp.play": "Reanudar",

    "exp.net.title": "La red aprende a dibujar",
    "exp.net.medium": "Red neuronal · Canvas 2D",
    "exp.net.desc":
      "Una red neuronal de {n} parámetros aprende la forma píxel a píxel. Dibuja encima y aprenderá tu dibujo.",
    "exp.net.step": "Paso",
    "exp.net.loss": "Error",
    "exp.net.acc": "Acierto",
    "exp.net.params": "Parámetros",
    "exp.net.clear": "Borrar",
    "exp.net.reset": "Reiniciar red",
    "exp.net.learning": "Aprendiendo",
    "exp.net.learned": "Aprendido",
    "exp.net.yours": "Aprendiendo tu dibujo",
    "exp.net.word": "IA",
    "exp.net.aria": "Red neuronal aprendiendo a dibujar una forma con píxeles",

    "exp.agent.title": "Un agente aprende solo",
    "exp.agent.medium": "Aprendizaje por refuerzo · Q-learning",
    "exp.agent.desc":
      "Nadie le enseña el camino: prueba, se equivoca y recuerda. Toca una casilla para poner o quitar un muro.",
    "exp.agent.episodes": "Intentos",
    "exp.agent.mastery": "Mapa dominado",
    "exp.agent.explore": "Exploración",
    "exp.agent.goal": "Mover meta",
    "exp.agent.forget": "Olvidar",
    "exp.agent.aria": "Agente aprendiendo a llegar a la meta en una cuadrícula con muros",

    "exp.flow.title": "Automatización con IA",
    "exp.flow.medium": "Clasificador bayesiano · Flujos",
    "exp.flow.desc":
      "Cada mensaje entra, la IA lo lee y decide adónde va. Si duda, lo revisa una persona. Escribe uno tú.",
    "exp.flow.inbox": "Entrada",
    "exp.flow.channels": "correo · web",
    "exp.flow.ai": "IA",
    "exp.flow.quote": "Presupuesto",
    "exp.flow.support": "Soporte",
    "exp.flow.spam": "Spam",
    "exp.flow.review": "Revisión",
    "exp.flow.processed": "Procesados",
    "exp.flow.placeholder": "Escribe un mensaje…",
    "exp.flow.input": "Mensaje para la automatización",
    "exp.flow.send": "Enviar",
    "exp.flow.you": "Tú",
    "exp.flow.aria": "Flujo automatizado que clasifica mensajes con IA y los envía a su destino",

    // engineer
    "eng.title": "Quién soy",
    "eng.label": "Perfil",
    "eng.meta": "Frontend — Backend — IA",
    "eng.statement1": "Del píxel",
    "eng.statement2": "al servidor.",
    "eng.sub": "Desarrollador full stack enfocado en frontend. Construyo webs de principio a fin, con IA dentro.",
    "eng.layers": "La web, por capas",
    "eng.tools": "herramientas",
    "eng.fig": "Fig. 01",
    "eng.portrait": "Retrato de Gabriel Rodríguez",
    "eng.layer.frontend": "Frontend",
    "eng.layer.frontend.tag": "Lo que ves.",
    "eng.layer.backend": "Backend",
    "eng.layer.backend.tag": "Lo que no ves.",
    "eng.layer.databases": "Datos",
    "eng.layer.databases.tag": "Lo que recuerda.",
    "eng.layer.ai": "IA",
    "eng.layer.ai.tag": "Cómo piensa.",
    "eng.layer.workflow": "Flujo",
    "eng.layer.workflow.tag": "Cómo llega a producción.",

    // contact
    "contact.label": "Contacto",
    "contact.title1": "¿Tienes un",
    "contact.title2": "buen problema?",
    "contact.title3": "Lo resolvemos.",
    "contact.intro":
      "Cuéntame tu idea o tu oferta. Te respondo en menos de 24 horas.",
    "contact.copy": "Copiar correo",
    "contact.copied": "Correo copiado",
    "contact.sent": "Mensaje enviado",
    "contact.sending": "Enviando…",
    "contact.error": "No se pudo enviar, inténtalo de nuevo",
    "contact.available": "Disponible para incorporación inmediata",
    "contact.cv": "Descargar CV",
    "contact.cvPreview": "Vista previa del CV",
    "contact.channels": "Canales",
    "contact.write": "Escríbeme",
    "contact.form.title": "Formulario — Web3Forms",
    "contact.form.fields": "03 campos",
    "contact.form.name": "Nombre",
    "contact.form.email": "Correo",
    "contact.form.message": "Mensaje",
    "contact.form.placeholder": "Cuéntame sobre tu proyecto…",
    "contact.form.send": "Enviar mensaje",
    "contact.footer": "Diseñado y desarrollado por Gabriel Rodríguez",
    "contact.top": "Volver arriba",

    // cookies
    "cookies.title": "Cookies",
    "cookies.text":
      "Uso cookies para recordar tus preferencias (como el idioma) y mejorar tu experiencia.",
    "cookies.accept": "Aceptar",
    "cookies.decline": "Rechazar",
  },
  en: {
    "meta.title": "Gabriel Rodríguez — Independent Developer",

    "nav.menu": "Menu",
    "nav.close": "Close",
    "nav.home": "Home",
    "nav.work": "Work",
    "nav.lab": "Lab",
    "nav.engineer": "Profile",
    "nav.contact": "Contact",
    "nav.skip": "Skip to content",
    "nav.index": "Index",
    "nav.language": "Language",
    "nav.logo": "Gabriel Rodríguez — home",

    "cursor.open": "Open ↗",
    "cursor.code": "Source ↗",
    "cursor.play": "Play",
    "cursor.mail": "Mail ↗",
    "cursor.copy": "Copy",
    "cursor.pdf": "PDF ↓",
    "cursor.send": "Send",

    "intro.label": "Introduction",
    "intro.role": "Independent developer",
    "intro.tagline1": "Not here to fit in.",
    "intro.tagline2": "Here to build.",
    "intro.description":
      "Independent developer creating digital products, web experiences and intelligent systems.",
    "intro.available": "Available — immediate start",
    "intro.based": "Based in",
    "intro.disciplines": "Frontend — Backend — AI & Automation",

    "loader.brand": "Brutalist Digital Object",
    "loader.label": "Loading",

    "manifesto.label": "Manifesto",
    "manifesto.text":
      "I build digital experiences that blend design, technology and artificial intelligence to create products that matter.",
    "manifesto.tape": "Frontend|Backend|Databases|AI & Automation|Available for work|Mérida — Spain",

    "work.title": "Selected Work",
    "work.label": "Selected work",
    "work.meta": "Real projects — code and live demo",
    "work.demo": "Live demo",
    "work.code": "Code",
    "work.index": "Piece",
    "work.next": "Next piece",
    "work.nextTag": "In progress",
    "work.nextSub": "New project in production. It will be published here once it's finished.",
    "projects.jobflow.desc":
      "Job application tracker with AI matching and a hand-built Make-style automation engine: trigger-based workflows, kanban and analytics.",
    "projects.jobflow.features": "AI matching|Trigger-based workflows|Kanban board|Analytics",
    "projects.streamio.desc":
      "Full stack Netflix clone: catalog powered by the TMDB API, login and a favorites list.",
    "projects.invoice.desc":
      "Full stack invoicing app with login (JWT), database, charts and PDF invoice export.",
    "projects.restaurant.desc":
      "Modern responsive restaurant website with bookings and interactive menu.",

    "exp.title": "AI Lab",
    "exp.label": "Experimental zone",
    "exp.meta": "Neural networks · Agents · Automation",
    "exp.intro":
      "AI, live: models that learn on their own right here, in your browser. Hand-written, no libraries.",
    "exp.counter": "training steps this visit",
    "exp.live": "Live",
    "exp.pause": "Pause",
    "exp.play": "Resume",

    "exp.net.title": "The network learns to draw",
    "exp.net.medium": "Neural network · Canvas 2D",
    "exp.net.desc":
      "A {n}-parameter neural network learns the shape pixel by pixel. Draw on it and it will learn your drawing.",
    "exp.net.step": "Step",
    "exp.net.loss": "Loss",
    "exp.net.acc": "Accuracy",
    "exp.net.params": "Parameters",
    "exp.net.clear": "Clear",
    "exp.net.reset": "Reset network",
    "exp.net.learning": "Learning",
    "exp.net.learned": "Learned",
    "exp.net.yours": "Learning your drawing",
    "exp.net.word": "AI",
    "exp.net.aria": "Neural network learning to draw a shape with pixels",

    "exp.agent.title": "An agent learns on its own",
    "exp.agent.medium": "Reinforcement learning · Q-learning",
    "exp.agent.desc":
      "Nobody shows it the way: it tries, fails and remembers. Tap a cell to add or remove a wall.",
    "exp.agent.episodes": "Attempts",
    "exp.agent.mastery": "Map mastered",
    "exp.agent.explore": "Exploration",
    "exp.agent.goal": "Move goal",
    "exp.agent.forget": "Forget",
    "exp.agent.aria": "Agent learning to reach the goal on a grid with walls",

    "exp.flow.title": "AI automation",
    "exp.flow.medium": "Bayesian classifier · Workflows",
    "exp.flow.desc":
      "Each message comes in, the AI reads it and decides where it goes. When in doubt, a person reviews it. Write one yourself.",
    "exp.flow.inbox": "Inbox",
    "exp.flow.channels": "email · web",
    "exp.flow.ai": "AI",
    "exp.flow.quote": "Quote",
    "exp.flow.support": "Support",
    "exp.flow.spam": "Spam",
    "exp.flow.review": "Review",
    "exp.flow.processed": "Processed",
    "exp.flow.placeholder": "Type a message…",
    "exp.flow.input": "Message for the automation",
    "exp.flow.send": "Send",
    "exp.flow.you": "You",
    "exp.flow.aria": "Automated workflow that classifies messages with AI and routes them",

    "eng.title": "The Engineer",
    "eng.label": "Profile",
    "eng.meta": "Frontend — Backend — AI",
    "eng.statement1": "From pixel",
    "eng.statement2": "to server.",
    "eng.sub": "Full stack developer focused on frontend. I build websites end to end, with AI inside.",
    "eng.layers": "The web, layer by layer",
    "eng.tools": "tools",
    "eng.fig": "Fig. 01",
    "eng.portrait": "Portrait of Gabriel Rodríguez",
    "eng.layer.frontend": "Frontend",
    "eng.layer.frontend.tag": "What you see.",
    "eng.layer.backend": "Backend",
    "eng.layer.backend.tag": "What you don't see.",
    "eng.layer.databases": "Data",
    "eng.layer.databases.tag": "What it remembers.",
    "eng.layer.ai": "AI",
    "eng.layer.ai.tag": "How it thinks.",
    "eng.layer.workflow": "Workflow",
    "eng.layer.workflow.tag": "How it ships.",

    "contact.label": "Contact",
    "contact.title1": "Have a good",
    "contact.title2": "problem?",
    "contact.title3": "Let's solve it.",
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
    "contact.form.title": "Form — Web3Forms",
    "contact.form.fields": "03 fields",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.placeholder": "Tell me about your project…",
    "contact.form.send": "Send message",
    "contact.footer": "Designed and built by Gabriel Rodríguez",
    "contact.top": "Back to top",

    "cookies.title": "Cookies",
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

  // Mantiene el atributo lang y el título de la pestaña en el idioma activo.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translations[lang]["meta.title"];
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
