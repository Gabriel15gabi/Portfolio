"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLanguage } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";

const LINKS = [
  { href: "#top", key: "nav.home", num: "00" },
  { href: "#work", key: "nav.work", num: "01" },
  { href: "#lab", key: "nav.lab", num: "02" },
  { href: "#engineer", key: "nav.engineer", num: "03" },
  { href: "#contact", key: "nav.contact", num: "04" },
];

/** Hora local de Mérida (Europe/Madrid), actualizada cada 30 s. */
function useMeridaTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={`label-mono flex items-center ${className}`} role="group" aria-label="Language">
      {(["es", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 opacity-40">/</span>}
          <button
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-1 py-1 transition-colors ${
              lang === l ? "text-accent" : "opacity-50 hover:opacity-100"
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function Nav() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const time = useMeridaTime();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  // Barra: se oculta al bajar y vuelve al subir; sólida tras el primer scroll.
  const lenis = useLenis(({ scroll, direction }) => {
    const nextSolid = scroll > 40;
    const nextHidden = scroll > 200 && direction === 1;
    setSolid((s) => (s === nextSolid ? s : nextSolid));
    setHidden((h) => (h === nextHidden ? h : nextHidden));
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Timeline del menú fullscreen: cortina diagonal + líneas que caen.
  useGSAP(
    () => {
      const el = overlayRef.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set(el, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", visibility: "hidden" });
      tl.current = gsap
        .timeline({ paused: true })
        .set(el, { visibility: "visible" })
        .to(el, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: reduce ? 0.01 : 0.7,
          ease: "expo.inOut",
        })
        .fromTo(
          el.querySelectorAll("[data-menu-line]"),
          { yPercent: 110 },
          { yPercent: 0, duration: reduce ? 0.01 : 0.8, stagger: 0.05, ease: "expo.out" },
          reduce ? 0 : "-=0.35"
        )
        .fromTo(
          el.querySelectorAll("[data-menu-fade]"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4 },
          "<0.2"
        );
    },
    { scope: overlayRef }
  );

  useEffect(() => {
    if (!tl.current) return;
    if (open) {
      tl.current.timeScale(1).play();
      lenis?.stop();
      // Foco al primer enlace para teclado
      const first = overlayRef.current?.querySelector<HTMLAnchorElement>("a");
      setTimeout(() => first?.focus({ preventScroll: true }), 50);
    } else {
      tl.current.timeScale(1.6).reverse();
      lenis?.start();
    }
  }, [open, lenis]);

  // Escape cierra; Tab queda atrapado dentro del menú.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && overlayRef.current) {
        const focusables = Array.from(
          overlayRef.current.querySelectorAll<HTMLElement>("a, button")
        ).concat(buttonRef.current ? [buttonRef.current] : []);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setOpen(false);
      const target = href === "#top" ? 0 : href;
      // Espera a que la cortina empiece a cerrarse antes de desplazar.
      setTimeout(() => {
        if (lenis) lenis.scrollTo(target, { duration: 1.4 });
        else if (typeof target === "string") document.querySelector(target)?.scrollIntoView();
        else window.scrollTo(0, 0);
      }, 120);
    },
    [lenis]
  );

  return (
    <>
      <a
        href="#main"
        className="label-mono fixed left-3 top-3 z-[200] -translate-y-24 bg-ink px-3 py-2 text-paper focus:translate-y-0"
      >
        {t("nav.skip")}
      </a>

      {/* Barra superior */}
      <header
        className={`fixed inset-x-0 top-0 z-[120] px-4 sm:px-8 lg:px-12 transition-[transform,background-color,color,padding] duration-500 ease-[var(--ease-expo)] ${
          open
            ? "py-4 text-paper"
            : solid
              ? "border-b-2 border-fg bg-bg py-3 text-fg"
              : "py-4 text-fg"
        } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="flex items-start justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => go(e, "#top")}
            className="group flex items-baseline gap-3"
            aria-label="Gabriel Rodríguez — inicio"
          >
            <span className="display text-[1.9rem] leading-none tracking-tight">
              GR<span className="text-accent">/</span>
            </span>
            <span className="label-mono hidden leading-tight lg:block">
              Gabriel Rodríguez
              <br />
              <span className="opacity-60">{t("intro.role")}</span>
            </span>
          </a>

          <div className="label-mono hidden items-center gap-2 md:flex" aria-hidden={!time}>
            <span className="h-2 w-2 bg-accent animate-blink" />
            <span>
              Mérida — {time ?? "--:--"} CET
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <LangToggle className="hidden sm:flex" />
            <button
              ref={buttonRef}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              data-cursor={open ? t("nav.close") : t("nav.menu")}
              className="group label-mono flex items-center gap-3 border-2 border-current px-3 py-2 transition-colors hover:bg-accent hover:text-paper hover:border-accent"
            >
              <span>{open ? t("nav.close") : t("nav.menu")}</span>
              <span className="relative block h-2.5 w-4" aria-hidden>
                <span
                  className={`absolute left-0 h-[2px] w-full bg-current transition-transform duration-300 ${
                    open ? "top-1 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[2px] w-full bg-current transition-transform duration-300 ${
                    open ? "top-1 -rotate-45" : "top-2"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú fullscreen experimental */}
      <div
        ref={overlayRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.index")}
        aria-hidden={!open}
        inert={!open}
        className="theme-dark invisible fixed inset-0 z-[110] flex flex-col overflow-hidden"
      >
        {/* Retícula */}
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />

        <nav className="relative flex flex-1 flex-col justify-center px-4 pt-20 sm:px-8 lg:px-12">
          <p data-menu-fade className="label-mono mb-4 text-accent">
            {t("nav.index")} / 05
          </p>
          <ul className="border-t border-line">
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-line">
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="group relative flex items-baseline gap-4 overflow-hidden py-1 md:gap-10"
                >
                  <span className="label-mono w-8 shrink-0 text-accent transition-colors group-hover:text-paper group-focus-visible:text-paper">{l.num}</span>
                  <span className="mask-line">
                    <span
                      data-menu-line
                      className="display block text-[clamp(3rem,10.5vh,8.5rem)] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-6 md:group-hover:translate-x-12"
                    >
                      {t(l.key)}
                    </span>
                  </span>
                  {/* Barra roja que barre */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 -z-10 w-full origin-left scale-x-0 bg-signal transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          data-menu-fade
          className="label-mono relative grid grid-cols-2 gap-4 border-t border-line px-4 py-5 sm:px-8 md:grid-cols-4 lg:px-12"
        >
          <a href={`mailto:${PROFILE.email}`} className="link-sweep col-span-2 w-fit break-all">
            {PROFILE.email}
          </a>
          {PROFILE.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="link-sweep w-fit">
              {l.label} ↗
            </a>
          ))}
          <LangToggle className="sm:hidden" />
        </div>
      </div>
    </>
  );
}
