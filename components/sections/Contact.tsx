"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Reveal, { Line } from "@/components/ui/Reveal";
import { KineticLine } from "@/components/ui/Kinetic";
import { PROFILE } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";
import { useLenis } from "lenis/react";

// Clave pública de Web3Forms (https://web3forms.com). Se puede definir
// vía NEXT_PUBLIC_WEB3FORMS_KEY. Si está vacía, el formulario hace
// fallback a mailto (abre el correo del visitante).
const WEB3FORMS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "67f26fc6-6011-4265-881c-492f28f55f5a";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const { t, lang } = useLanguage();
  const lenis = useLenis();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!WEB3FORMS_KEY) {
      const subject = encodeURIComponent(`Contacto Portfolio — ${form.name}`);
      const body = encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
      window.open(`mailto:${PROFILE.email}?subject=${subject}&body=${body}`, "_self");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Contacto Portfolio — ${form.name}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
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

  const field =
    "peer w-full border-0 border-b-2 border-ink bg-transparent px-0 py-3 text-lg text-ink caret-paper outline-none transition-colors placeholder:text-ink/45 focus:border-paper focus:bg-transparent";
  const label = "label-mono block";

  const buttonLabel =
    status === "sent"
      ? `${t("contact.sent")} ✓`
      : status === "sending"
        ? t("contact.sending")
        : status === "error"
          ? t("contact.error")
          : t("contact.form.send");

  return (
    <section
      id="contact"
      data-theme="red"
      aria-labelledby="contact-title"
      className="relative flex min-h-[100svh] flex-col overflow-clip px-4 pt-24 sm:px-8 md:pt-36 lg:px-12"
    >
      <div className="label-mono flex items-center justify-between border-t-2 border-fg pt-3">
        <span>
          <span className="text-accent">§04</span> — {t("contact.label")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 bg-ink animate-blink" aria-hidden />
          {t("contact.available")}
        </span>
      </div>

      {/* Cierre monumental */}
      <Reveal as="h2" id="contact-title" className="display mt-10 text-[clamp(4rem,15.5vw,16rem)] md:mt-14">
        <KineticLine drift={6}>
          <Line>Have a good</Line>
        </KineticLine>
        <KineticLine drift={-6}>
          <Line className="md:pl-[16vw]">problem?</Line>
        </KineticLine>
        <Line className="text-paper">Let&apos;s solve it.</Line>
      </Reveal>

      <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-x-6">
        {/* Columna izquierda: email + canales */}
        <div className="flex flex-col gap-10 md:col-span-5">
          <p className="max-w-[36ch] text-xl font-medium leading-snug">{t("contact.intro")}</p>

          <div>
            <p className="label-mono mb-2">{t("contact.write")}</p>
            <a
              href={`mailto:${PROFILE.email}`}
              data-cursor="MAIL ↗"
              className="link-sweep break-all text-[clamp(1.35rem,2.6vw,2.4rem)] font-bold leading-tight tracking-tight"
            >
              {PROFILE.email}
            </a>
            <button
              onClick={copyEmail}
              data-cursor="COPY"
              aria-live="polite"
              className="label-mono mt-3 block border-2 border-ink px-3 py-2 transition-colors hover:bg-ink hover:text-paper"
            >
              {copied ? `${t("contact.copied")} ✓` : t("contact.copy")}
            </button>
          </div>

          <div>
            <p className="label-mono mb-2">{t("contact.channels")}</p>
            <ul className="border-t-2 border-ink">
              {PROFILE.links.map((l, i) => (
                <li key={l.label} className="border-b-2 border-ink">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="OPEN ↗"
                    className="group flex items-baseline justify-between gap-4 py-3 transition-colors hover:bg-ink hover:px-3 hover:text-paper"
                  >
                    <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-2xl font-bold uppercase">{l.label}</span>
                    <span className="label-mono hidden sm:block">{l.handle}</span>
                    <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                  </a>
                </li>
              ))}
              <li className="border-b-2 border-ink">
                <a
                  href={PROFILE.cv}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="PDF ↓"
                  className="group flex items-center justify-between gap-4 py-3 transition-colors hover:bg-ink hover:px-3 hover:text-paper"
                >
                  <span className="label-mono">0{PROFILE.links.length + 1}</span>
                  <span className="flex-1 text-2xl font-bold uppercase">{t("contact.cv")}</span>
                  <span className="relative hidden h-14 w-10 overflow-hidden border border-current sm:block">
                    <Image
                      src={PROFILE.cvPreview}
                      alt={t("contact.cvPreview")}
                      fill
                      sizes="40px"
                      className="object-cover object-top grayscale"
                    />
                  </span>
                  <span className="label-mono">PDF</span>
                </a>
              </li>
            </ul>
          </div>

          <p className="label-mono">
            {PROFILE.location[lang]} — {PROFILE.coords}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:col-span-6 md:col-start-7" noValidate={false}>
          <p className="label-mono flex justify-between border-t-2 border-ink pt-3">
            <span>Form — Web3Forms</span>
            <span>03 fields</span>
          </p>
          <div>
            <label htmlFor="f-name" className={label}>
              01 — {t("contact.form.name")}
            </label>
            <input
              id="f-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="f-email" className={label}>
              02 — {t("contact.form.email")}
            </label>
            <input
              id="f-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="f-message" className={label}>
              03 — {t("contact.form.message")}
            </label>
            <textarea
              id="f-message"
              name="message"
              required
              rows={5}
              value={form.message}
              placeholder={t("contact.form.placeholder")}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              className={`${field} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            data-cursor="SEND"
            className="group label-mono flex items-center justify-between bg-ink px-5 py-5 text-[0.85rem] text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-80"
          >
            <span aria-live="polite">{buttonLabel}</span>
            <span className="text-xl transition-transform duration-300 group-hover:translate-x-2" aria-hidden>
              →
            </span>
          </button>
        </form>
      </div>

      {/* Pie */}
      <footer className="label-mono mt-24 flex flex-col gap-3 border-t-2 border-ink py-5 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} — {t("contact.footer")}</span>
        <span className="hidden md:block">Next.js — GSAP — Lenis</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (lenis) lenis.scrollTo(0, { duration: 1.6 });
            else window.scrollTo(0, 0);
          }}
          className="link-sweep w-fit"
        >
          {t("contact.top")} ↑
        </a>
      </footer>
    </section>
  );
}
