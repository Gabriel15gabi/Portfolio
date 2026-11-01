"use client";

import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

/**
 * Media de proyecto con tratamiento propio:
 *  - Póster en escala de grises; al hover (o al entrar en pantalla en
 *    táctil) pasa a color y reproduce el vídeo.
 *  - Distorsión sutil: un feDisplacementMap que se dispara al entrar
 *    el cursor y se asienta en ~0.9 s (solo escritorio + movimiento).
 *  - Parallax interno: la imagen se desplaza dentro del marco.
 */
export default function ProjectMedia({
  src,
  title,
  href,
  className = "",
  cursor = "PLAY",
}: {
  src: string;
  title: string;
  href: string | null;
  className?: string;
  cursor?: string;
}) {
  const filterId = `distort-${useId().replace(/:/g, "")}`;
  const wrapRef = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const poster = src.replace(/\.mp4$/, ".jpg");

  // Parallax interno (desktop + movimiento)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motionDesktop, () => {
        gsap.fromTo(
          innerRef.current,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: { trigger: wrapRef.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: wrapRef }
  );

  // Táctil: reproducir cuando está visible; pausar al salir.
  useEffect(() => {
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        el.dataset.active = on ? "true" : "false";
        if (reduce) return;
        if (on) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const enter = () => {
    const video = videoRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (video && !reduce) video.play().catch(() => {});
    const disp = dispRef.current;
    const media = innerRef.current;
    if (!disp || !media || reduce) return;
    const state = { s: 38 };
    media.style.filter = `url(#${filterId})`;
    gsap.killTweensOf(state);
    gsap.to(state, {
      s: 0,
      duration: 0.9,
      ease: "expo.out",
      onUpdate: () => disp.setAttribute("scale", String(state.s)),
      onComplete: () => {
        media.style.filter = "";
      },
    });
  };

  const leave = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  };

  const Tag = (href ? "a" : "div") as "a";
  const linkProps = href
    ? { href, target: "_blank", rel: "noreferrer", "aria-label": `${title} — demo` }
    : {};

  return (
    <Tag
      ref={wrapRef}
      {...linkProps}
      data-cursor={cursor}
      data-active="false"
      onPointerEnter={enter}
      onPointerLeave={leave}
      className={`group/media relative block overflow-hidden bg-ink ${className}`}
    >
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.06" numOctaves="1" seed="3" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div ref={innerRef} className="absolute inset-[-8%] will-change-transform">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="h-full w-full object-cover grayscale contrast-[1.15] transition-[filter] duration-700 group-hover/media:grayscale-0 group-hover/media:contrast-100 group-data-[active=true]/media:grayscale-0"
        />
      </div>

      {/* Trama de puntos (halftone) que se retira al hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply transition-opacity duration-500 group-hover/media:opacity-0 group-data-[active=true]/media:opacity-0"
        style={{
          backgroundImage: "radial-gradient(var(--color-ink) 1px, transparent 1.2px)",
          backgroundSize: "4px 4px",
        }}
      />
    </Tag>
  );
}
