/* ──────────────────────────────────────────────────────────
   INBOX — clasificador bayesiano ingenuo (Naive Bayes)
   Usado por EXP—03 (Laboratorio IA).

   Se entrena en el navegador con frases de ejemplo (ES + EN) y
   decide a qué flujo va cada mensaje: presupuesto, soporte o spam.
   La confianza que se muestra es la probabilidad real que calcula.
   Los mensajes de la bandeja NO están en el entrenamiento: el
   modelo los ve por primera vez, igual que lo que escribas tú.
   ────────────────────────────────────────────────────────── */

export type Label = "quote" | "support" | "spam";
export const LABELS: Label[] = ["quote", "support", "spam"];
/** Por debajo de esta confianza, el mensaje va a revisión humana. */
export const MIN_CONFIDENCE = 0.5;

const TRAINING: Record<Label, string[]> = {
  quote: [
    "Necesito presupuesto para una web nueva",
    "Cuánto cuesta una tienda online para mi negocio",
    "Quiero una página web para mi restaurante",
    "Busco desarrollador para crear una app",
    "Precio de una landing page para mi empresa",
    "Me gustaría rediseñar la web de mi marca",
    "Queremos integrar inteligencia artificial en nuestra web",
    "Podrías hacer una web con reservas online",
    "Necesito automatizar procesos de mi empresa, cuánto cobras",
    "Buscamos un frontend para un proyecto nuevo",
    "Quiero un chatbot para mi tienda, qué precio tendría",
    "Tienes disponibilidad para un proyecto web este mes",
    "I need a quote for a new website",
    "How much does an online store cost for my business",
    "I want a website for my restaurant",
    "Looking for a developer to build an app",
    "Price for a landing page for my company",
    "We would like to redesign our brand website",
    "We want to integrate artificial intelligence into our site",
    "Could you build a site with online bookings",
    "I need to automate processes in my company, what are your rates",
    "We are hiring a frontend developer for a new project",
    "I want a chatbot for my shop, what would it cost",
    "Are you available for a web project this month",
    "Quiero contratarte para un proyecto",
    "Me interesa trabajar contigo",
    "Tengo una idea de negocio y necesito una web",
    "I want to hire you for a project",
    "I would like to work with you",
    "I have a business idea and need a website",
    "Quiero desarrollar una app para mi negocio",
    "I want to develop an app for my business",
  ],
  support: [
    "No puedo iniciar sesión en la aplicación",
    "La web va muy lenta desde ayer",
    "Me sale un error al pagar",
    "El formulario de contacto no funciona",
    "Cómo cambio mi contraseña",
    "La página no carga en el móvil",
    "He perdido el acceso a mi cuenta",
    "El botón de enviar no hace nada",
    "Las imágenes no se ven en la web",
    "Me llega un error 500 al entrar",
    "No recibo el correo de confirmación",
    "La aplicación se cierra sola",
    "I can't log in to the app",
    "The website has been very slow since yesterday",
    "I get an error when paying",
    "The contact form is not working",
    "How do I change my password",
    "The page doesn't load on mobile",
    "I lost access to my account",
    "The send button does nothing",
    "Images are not showing on the site",
    "I get a 500 error when I open it",
    "I don't receive the confirmation email",
    "The app keeps crashing",
    "Se me ha roto la web, ayuda",
    "Tengo un problema con mi página",
    "Hay un fallo en la aplicación",
    "La web está caída",
    "My site is broken, help",
    "I have a problem with my page",
    "There is a bug in the app",
    "The website is down",
  ],
  spam: [
    "Gana dinero rápido desde casa",
    "Has ganado un premio, haz clic aquí",
    "Compra seguidores baratos ya",
    "Préstamo inmediato sin preguntas",
    "Invierte en criptomonedas y hazte rico",
    "Felicidades, eres el ganador del sorteo",
    "Oferta exclusiva solo hoy, descuento del 90%",
    "Pastillas milagrosas para adelgazar",
    "Reclama tu regalo gratis ahora",
    "Tu cuenta bancaria será bloqueada, verifica tus datos",
    "Gana bitcoins gratis cada día",
    "Casino online con bono gratis",
    "Make money fast from home",
    "You won a prize, click here",
    "Buy cheap followers now",
    "Instant loan, no questions asked",
    "Invest in crypto and get rich",
    "Congratulations, you are the lucky winner",
    "Exclusive offer today only, 90% off",
    "Miracle pills to lose weight",
    "Claim your free gift now",
    "Your bank account will be locked, verify your details",
    "Earn free bitcoin every day",
    "Online casino with free bonus",
    "Haz clic en este enlace para ganar",
    "Click this link to win",
    "SEO barato, primera posición en Google garantizada",
    "Cheap SEO, guaranteed first page on Google",
    "Has sido seleccionado para recibir una recompensa",
    "You have been selected to receive a reward",
  ],
};

/** Mensajes de la bandeja de entrada (distintos de los de entrenamiento). */
export const POOL: Record<"es" | "en", string[]> = {
  es: [
    "¿Cuánto me costaría una web para mi clínica?",
    "Hola, busco a alguien que me haga una tienda online",
    "Queremos automatizar las reservas con IA, ¿hablamos?",
    "Necesito una landing para lanzar mi producto",
    "¿Cuánto cobras por una app a medida?",
    "No me deja entrar con mi contraseña",
    "Error al subir imágenes desde el móvil",
    "El pago se queda cargando y no termina",
    "La web no carga desde esta mañana",
    "No me llega el email para recuperar la cuenta",
    "¡¡Gana 5.000 € al mes sin salir de casa!!",
    "Has sido seleccionado: reclama tu premio",
    "Bitcoin gratis solo por registrarte",
    "Verifica tus datos o tu cuenta será bloqueada",
    "Descuento exclusivo del 90% solo hoy",
  ],
  en: [
    "How much would a website for my clinic cost?",
    "Hi, I'm looking for someone to build an online shop",
    "We want to automate bookings with AI, can we talk?",
    "I need a landing page to launch my product",
    "What are your rates for a custom app?",
    "It won't let me log in with my password",
    "Error uploading images from my phone",
    "Payment keeps loading and never finishes",
    "The site hasn't loaded since this morning",
    "I'm not getting the email to recover my account",
    "Earn $5,000 a month without leaving home!!",
    "You have been selected: claim your prize",
    "Free bitcoin just for signing up",
    "Verify your details or your account will be locked",
    "Exclusive 90% discount today only",
  ],
};

/** Palabras vacías: no aportan a la decisión. */
const STOP = new Set(
  (
    "de la el en y a que los las un una para con por mi mis tu tus me se lo le al del es son " +
    "the a an to of in on for my your is are it and or with i we you this that be at from me our"
  ).split(" ")
);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    // Plurales sencillos: "apps" cuenta como "app".
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

export class Classifier {
  private readonly counts = new Map<string, number[]>();
  private readonly totals = [0, 0, 0];
  private readonly docs = [0, 0, 0];
  private vocab = 0;

  constructor() {
    LABELS.forEach((label, li) => {
      for (const text of TRAINING[label]) {
        this.docs[li]++;
        for (const w of tokenize(text)) {
          let c = this.counts.get(w);
          if (!c) {
            c = [0, 0, 0];
            this.counts.set(w, c);
          }
          c[li]++;
          this.totals[li]++;
        }
      }
    });
    this.vocab = this.counts.size;
  }

  /** Probabilidad de cada etiqueta para un texto (suma 1). */
  predict(text: string) {
    const nDocs = this.docs.reduce((a, b) => a + b, 0);
    const logp = LABELS.map((_, li) => Math.log(this.docs[li] / nDocs));
    const words = tokenize(text);
    let known = 0;
    for (const w of words) {
      const c = this.counts.get(w);
      if (!c) continue; // palabra nunca vista: no aporta
      known++;
      for (let li = 0; li < LABELS.length; li++) {
        logp[li] += Math.log((c[li] + 1) / (this.totals[li] + this.vocab));
      }
    }
    const max = Math.max(...logp);
    const exp = logp.map((v) => Math.exp(v - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    const probs = exp.map((v) => v / sum);
    let best = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
    // Sin palabras conocidas o con dudas, decide una persona.
    const sure = known > 0 && probs[best] >= MIN_CONFIDENCE;
    return { label: LABELS[best], probs, known, confidence: probs[best], sure };
  }
}
