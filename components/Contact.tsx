"use client";

import { useRef, useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import MagneticButton from "@/components/anim/MagneticButton";
import RevealText from "@/components/anim/RevealText";
import SectionLabel from "@/components/ui/SectionLabel";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { useLanguage } from "@/lib/i18n";

const EMAIL = "gabriel_gabiz@hotmail.com";

// Clave pública de Web3Forms (gratis en https://web3forms.com).
// Se puede poner aquí directamente o vía variable de entorno NEXT_PUBLIC_WEB3FORMS_KEY.
// Si está vacía, el formulario hace fallback a mailto (abre el correo del visitante).
const WEB3FORMS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ??
  "67f26fc6-6011-4265-881c-492f28f55f5a";

/* ── Social icon con glow rojo ───────────────────── */
function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <MagneticButton intensity={0.3}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        data-cursor
        className="group relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-red-500/30 hover:bg-red-500/[0.05]"
      >
        <div className="absolute inset-0 rounded-2xl bg-red-500/0 blur-[22px] transition-all duration-500 group-hover:bg-red-500/25" />
        <span className="relative text-[30px] text-white/25 transition-all duration-500 group-hover:text-red-500">
          {children}
        </span>
      </a>
    </MagneticButton>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  useEffect(() => {
    if (reduce || !lineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 55%",
            scrub: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [reduce]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Sin clave de Web3Forms → fallback a mailto (abre el correo del visitante).
    if (!WEB3FORMS_KEY) {
      const subject = encodeURIComponent(`Contacto Portfolio — ${formData.name}`);
      const body = encodeURIComponent(
        `Nombre: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      );
      window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`, "_self");
      return;
    }

    // Envío real: el mensaje llega a tu correo sin backend.
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Contacto Portfolio — ${formData.name}`,
          from_name: formData.name,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const inputCls =
    "w-full border-b border-white/[0.08] bg-transparent py-3 text-base text-white caret-red-500 outline-none transition-all duration-300 placeholder:text-white/10 focus:border-red-500/60 focus:shadow-[0_1px_12px_-6px_rgba(239,68,68,0.6)]";
  const labelCls =
    "mb-2 block text-[10px] uppercase tracking-[4px] text-white/25";

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex justify-center overflow-hidden bg-[#030303] px-6 pb-12 pt-28 lg:pt-44"
    >
      {/* BG */}
      <div className="pointer-events-none absolute left-1/2 top-[25%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-red-950/8 blur-[60px]" />

      <div className="relative z-10 flex w-full max-w-[1080px] flex-col items-center">
        {/* SEPARATOR */}
        <div
          ref={lineRef}
          className="mb-24 h-px w-full max-w-lg origin-center bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        />

        {/* LABEL */}
        <div className="mb-10">
          <SectionLabel>{t("contact.label")}</SectionLabel>
        </div>

        {/* HEADING */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-light leading-[1.05] sm:text-5xl lg:text-7xl">
            <RevealText delay={0.1}>
              <span className="text-white/90">{t("contact.heading1")}</span>
            </RevealText>
            <RevealText delay={0.25}>
              <span className="text-white/90">{t("contact.heading2")}</span>
              <span className="text-red-500">?</span>
            </RevealText>
          </h2>
        </div>

        {/* INTRO */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8 max-w-[440px] text-center text-sm leading-relaxed text-white/35 sm:text-base"
        >
          {t("contact.intro")}
        </motion.p>

        {/* DIRECT CONTACT — email (copiar) + ubicación */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center gap-4 sm:flex-row sm:gap-7"
        >
          {/* Email — click para copiar */}
          <button
            onClick={copyEmail}
            data-cursor
            className="group flex items-center gap-2.5 text-sm text-white/50 transition-colors duration-300 hover:text-white"
            title={t("contact.copy")}
          >
            <HiOutlineMail className="text-base text-red-500" />
            <span className="tabular-nums">{copied ? t("contact.copied") : EMAIL}</span>
          </button>

          <span className="hidden h-3 w-px bg-white/10 sm:block" />

          {/* Ubicación */}
          <div className="flex items-center gap-2.5 text-sm text-white/40">
            <HiOutlineLocationMarker className="text-base text-red-500/70" />
            <span>{t("contact.location")}</span>
          </div>
        </motion.div>

        {/* ─── 3 COLUMNAS: CV · FORMULARIO · LOGOS ─── */}
        <div className="grid w-full items-center gap-10 lg:grid-cols-[200px_1fr_auto] lg:gap-16">
          {/* 1 · CV */}
          <motion.a
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            href="/cvportfolio.pdf"
            target="_blank"
            rel="noreferrer"
            className="group block w-full max-w-[230px] justify-self-center overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-red-500/20"
            data-cursor
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/[0.03]">
              <img
                src="/cvpreview.jpeg"
                alt="CV Preview"
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-[10px] uppercase tracking-[3px] text-white backdrop-blur-sm">
                  {t("contact.cv")}
                  <span className="text-red-500">↗</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-xs text-white/40">Curriculum Vitae</span>
              <span className="text-[9px] uppercase tracking-[2px] text-white/15">
                PDF
              </span>
            </div>
          </motion.a>

          {/* 2 · FORMULARIO */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10"
          >
            <div className="mb-6">
              <label className={labelCls}>{t("contact.form.name")}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className={inputCls}
                placeholder="Gabriel..."
              />
            </div>

            <div className="mb-6">
              <label className={labelCls}>{t("contact.form.email")}</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                className={inputCls}
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-8 flex-1">
              <label className={labelCls}>{t("contact.form.message")}</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, message: e.target.value }))
                }
                className={`${inputCls} resize-none`}
                placeholder={t("contact.form.placeholder")}
              />
            </div>

            <MagneticButton intensity={0.15}>
              <button
                type="submit"
                disabled={status === "sending" || status === "sent"}
                className={`group flex w-full items-center justify-center gap-3 rounded-xl border py-4 text-[11px] uppercase tracking-[4px] transition-all duration-500 ${
                  status === "sent"
                    ? "border-green-500/30 bg-green-500/[0.06] text-green-400"
                    : status === "error"
                    ? "border-red-500/40 bg-red-500/[0.08] text-red-300"
                    : "border-red-500/20 bg-red-500/[0.04] text-white hover:border-red-500/40 hover:bg-red-500/[0.08]"
                }`}
              >
                {status === "sent" ? (
                  <>
                    <span className="text-green-400">✓</span>
                    {t("contact.sent")}
                  </>
                ) : status === "sending" ? (
                  <span className="animate-pulse">{t("contact.sending")}</span>
                ) : status === "error" ? (
                  <>{t("contact.error")}</>
                ) : (
                  <>
                    {t("contact.form.send")}
                    <span className="text-red-500 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </MagneticButton>
          </motion.form>

          {/* 3 · LOGOS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-row justify-center gap-5 lg:flex-col"
          >
            <SocialIcon
              href="https://www.linkedin.com/in/gabriel-rodr%C3%ADguez-blanco-72776a252/"
              label="LinkedIn"
            >
              <FaLinkedin />
            </SocialIcon>
            <SocialIcon href="https://github.com/Gabriel15gabi" label="GitHub">
              <FaGithub />
            </SocialIcon>
          </motion.div>
        </div>

        {/* AVAILABILITY */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[10px] uppercase tracking-[4px] text-white/20">
              {t("contact.available")}
            </span>
          </div>
        </motion.div>

        {/* FOOTER */}
        <div className="mt-24 w-full border-t border-white/[0.04] pt-8 text-center">
          <p className="text-[10px] uppercase tracking-[3px] text-white/10">
            {t("contact.footer")}
          </p>
        </div>
      </div>
    </section>
  );
}
