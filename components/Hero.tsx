"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import MagneticButton from "@/components/anim/MagneticButton";
import { useLanguage } from "@/lib/i18n";

/* ── Glitch / Scramble text hook ─────────────────── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>{}[]";

function useTextScramble(target: string, start: boolean, delayMs: number = 0) {
  const [display, setDisplay] = useState(target);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setDisplay(target);
      return;
    }
    if (!start) return;

    const scramble = (resolved: number) =>
      target
        .split("")
        .map((char, i) => {
          if (char === " " || char === ".") return char;
          if (i < resolved) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

    setDisplay(scramble(0));

    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const perChar = 90;

      const interval = setInterval(() => {
        const resolved = Math.floor((Date.now() - startTime) / perChar);
        if (resolved >= target.length) {
          setDisplay(target);
          clearInterval(interval);
          return;
        }
        setDisplay(scramble(resolved));
      }, 35);

      return () => clearInterval(interval);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [target, start, delayMs, reduce]);

  return display;
}

/* ── Roles ───────────────────────────────────────── */
const roles = [
  "Frontend Developer",
  "Backend Developer",
  "AI Automation",
  "Fullstack Engineer",
];

/* ── Nav links ───────────────────────────────────── */
const navKeys = [
  { href: "#about", key: "nav.about" },
  { href: "#projects", key: "nav.projects" },
  { href: "#contact", key: "nav.contact" },
];

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [glitchStart, setGlitchStart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { lang, setLang, t } = useLanguage();

  // El glitch arranca cuando el loader termina (evento), con fallback de seguridad
  useEffect(() => {
    const trigger = () => setGlitchStart(true);
    window.addEventListener("loader:done", trigger);
    const fallback = setTimeout(trigger, 3500);
    return () => {
      window.removeEventListener("loader:done", trigger);
      clearTimeout(fallback);
    };
  }, []);

  const firstName = useTextScramble("GABRIEL", glitchStart, 0);
  const lastName = useTextScramble("RODRÍGUEZ", glitchStart, 350);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIdx((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reduce || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        yPercent: -10,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [reduce]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloquea scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#030303]"
    >
      {/* BG */}
      <div className="absolute left-1/2 top-[-20%] z-[1] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-red-950/15 blur-[80px]" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-[#030303]" />

      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.04] bg-[#030303]/80 py-4 backdrop-blur-md"
            : "py-6"
        }`}
      >
        <div className="flex w-full items-center justify-end px-6 lg:px-12">
          {/* DESKTOP LINKS */}
          <div className="hidden items-center gap-7 md:flex lg:gap-9">
            {/* Inicio — aparece al hacer scroll, en rojo */}
            <AnimatePresence>
              {scrolled && (
                <motion.a
                  href="#home"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.4 }}
                  className="group relative overflow-hidden whitespace-nowrap text-[11px] uppercase tracking-[3px] text-red-500"
                >
                  {t("nav.home")}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              )}
            </AnimatePresence>

            {navKeys.map((link) => (
              <MagneticButton key={link.href} intensity={0.2}>
                <a
                  href={link.href}
                  className="group relative whitespace-nowrap text-[11px] uppercase tracking-[3px] text-white/50 transition-colors duration-300 hover:text-white"
                >
                  {t(link.key)}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
                </a>
              </MagneticButton>
            ))}

            {/* Lang toggle */}
            <div className="flex items-center gap-2 border-l border-white/[0.06] pl-5">
              <button
                onClick={() => setLang("es")}
                className={`text-[11px] tracking-[2px] transition ${
                  lang === "es" ? "text-red-500" : "text-white/30 hover:text-white/60"
                }`}
              >
                ES
              </button>
              <span className="text-[10px] text-white/10">/</span>
              <button
                onClick={() => setLang("en")}
                className={`text-[11px] tracking-[2px] transition ${
                  lang === "en" ? "text-red-500" : "text-white/30 hover:text-white/60"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* MOBILE — hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="text-2xl text-white/70 transition hover:text-white md:hidden"
          >
            <HiMenuAlt3 />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE MENU OVERLAY ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#030303]/95 backdrop-blur-lg md:hidden"
          >
            {/* close */}
            <div className="flex justify-end px-6 py-6">
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="text-2xl text-white/70 transition hover:text-white"
              >
                <HiX />
              </button>
            </div>

            {/* links */}
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-light uppercase tracking-[4px] text-red-500"
              >
                {t("nav.home")}
              </a>
              {navKeys.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="text-2xl font-light uppercase tracking-[4px] text-white/70 transition hover:text-white"
                >
                  {t(link.key)}
                </motion.a>
              ))}

              {/* lang */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setLang("es")}
                  className={`text-sm tracking-[3px] ${
                    lang === "es" ? "text-red-500" : "text-white/30"
                  }`}
                >
                  ES
                </button>
                <span className="text-white/10">/</span>
                <button
                  onClick={() => setLang("en")}
                  className={`text-sm tracking-[3px] ${
                    lang === "en" ? "text-red-500" : "text-white/30"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN — CENTERED ─── */}
      <div
        ref={contentRef}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-28"
      >
        <div className="flex w-full max-w-[1200px] flex-col items-center text-center">
          {/* ROTATING ROLE */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.2 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div className="h-px w-8 bg-red-500/40" />
            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={roleIdx}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="text-[10px] uppercase tracking-[8px] text-red-500 sm:text-xs"
                >
                  {roles[roleIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="h-px w-8 bg-red-500/40" />
          </motion.div>

          {/* NAME — GLITCH SCRAMBLE */}
          <h1
            className="font-mono font-light leading-[0.95]"
            style={{ fontSize: "clamp(2.2rem, 9vw, 9.5rem)" }}
          >
            <span className="block text-white">{firstName}</span>
            <span className="block">
              <span className="text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.14)]">
                {lastName}
              </span>
              <span className="text-red-500">.</span>
            </span>
          </h1>

          {/* LINE */}
          <div className="mt-10 w-full max-w-md">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, delay: 4.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-px w-full origin-center bg-gradient-to-r from-transparent via-red-500 to-transparent"
            />
          </div>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 4.5 }}
            className="mt-8 max-w-[460px] text-sm leading-relaxed text-white/30 sm:text-base"
          >
            {t("hero.description")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 4.7 }}
            className="mt-10"
          >
            <MagneticButton intensity={0.2}>
              <a
                href="#projects"
                className="group inline-flex items-center gap-3 border border-white/[0.08] px-10 py-4 text-[10px] uppercase tracking-[5px] text-white/60 transition-all duration-500 hover:border-red-500/40 hover:text-white"
              >
                {t("hero.cta")}
                <span className="inline-block text-red-500 transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
