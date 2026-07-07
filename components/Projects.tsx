"use client";

import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import TiltCard from "@/components/anim/TiltCard";
import { FaGithub } from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useLanguage } from "@/lib/i18n";

/* ── Proyectos reales (basados en el CV) ──────────────
   demo  → web en vivo (cuando esté desplegada)
   repo  → repositorio de GitHub
   Cada enlace solo se muestra si existe (nada de enlaces falsos).
   `media` queda preparado para meter imagen/vídeo en el futuro. */
type Project = {
  title: string;
  descKey: string;
  demo: string | null;
  repo: string | null;
  stack: string[];
  num: string;
  media: string | null;
  soon?: boolean;
};

const projects: Project[] = [
  {
    title: "JobFlow",
    descKey: "projects.jobflow.desc",
    demo: "https://jobflow-lac.vercel.app",
    repo: "https://github.com/Gabriel15gabi/jobflow",
    stack: ["Next.js", "TypeScript", "MongoDB", "Auth.js"],
    num: "01",
    media: null,
  },
  {
    title: "Streamio",
    descKey: "projects.streamio.desc",
    demo: "https://streamio-red.vercel.app",
    repo: "https://github.com/Gabriel15gabi/Streamio",
    stack: ["JavaScript", "Node.js", "Express", "SQLite"],
    num: "02",
    media: "/projects/streamio.mp4",
  },
  {
    title: "Invoice Tracker",
    descKey: "projects.invoice.desc",
    demo: "https://invoice-tracker-kohl.vercel.app",
    repo: "https://github.com/Gabriel15gabi/invoice-tracker",
    stack: ["React", "Express", "SQLite", "JWT"],
    num: "03",
    media: "/projects/invoice.mp4",
  },
  {
    title: "Restaurant App",
    descKey: "projects.restaurant.desc",
    demo: "https://el-restaurante-alpha.vercel.app",
    repo: "https://github.com/Gabriel15gabi/El-Restaurante",
    stack: ["HTML5", "CSS3", "JavaScript"],
    num: "04",
    media: "/projects/restaurant.mp4",
  },
  {
    title: "",
    descKey: "",
    demo: null,
    repo: null,
    stack: [],
    num: "05",
    media: null,
    soon: true,
  },
];

/* ── Fondo de tarjeta — neutro y uniforme ──────────
   Si en el futuro hay `media`, se muestra la imagen/vídeo.
   Si no, un placeholder neutro idéntico para todas. */
function ProjectMedia({
  media,
  active = false,
}: {
  media: string | null;
  active?: boolean;
}) {
  // En escritorio se activa con hover (group-hover). En móvil, con `active`
  // (cuando la tarjeta entra en pantalla), porque el hover no existe al tocar.
  const poster = media ? media.replace(/\.mp4$/, ".jpg") : undefined;
  return (
    <div className="absolute inset-0" aria-hidden>
      {media ? (
        <video
          src={media}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            active
              ? "scale-[1.03] grayscale-0"
              : "grayscale group-hover:scale-[1.03] group-hover:grayscale-0"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-[#0c0c0c] to-[#070707]">
          {/* grid pattern neutro */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
    </div>
  );
}

/* ── Skills — recuadros rectangulares con fondo gris ── */
function SkillTags({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {stack.map((tech) => (
        <span
          key={tech}
          className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[2px] text-white/65 backdrop-blur-sm transition-colors duration-300 group-hover:border-white/20 group-hover:text-white/85"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

/* ── Acciones: Demo / Código (solo si existen) ─────── */
function ProjectActions({
  project,
  t,
}: {
  project: Project;
  t: (k: string) => string;
}) {
  const btnCls =
    "flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[1.5px] text-white/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/60 hover:bg-black/80 hover:text-white";

  if (!project.demo && !project.repo) {
    return (
      <span className="text-[11px] uppercase tracking-[2px] text-white/25">
        {t("projects.soon")}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {project.demo && (
        <a
          href={project.demo}
          target="_blank"
          rel="noreferrer"
          data-cursor
          onClick={(e) => e.stopPropagation()}
          className={btnCls}
        >
          <HiOutlineExternalLink className="text-base" />
          {t("projects.demo")}
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          data-cursor
          onClick={(e) => e.stopPropagation()}
          className={btnCls}
        >
          <FaGithub className="text-base" />
          {t("projects.code")}
        </a>
      )}
    </div>
  );
}

/* ── Tarjeta MÓVIL — se activa (color + vídeo) al entrar en pantalla ── */
function MobileProjectCard({
  project,
  t,
}: {
  project: Project;
  t: (k: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const video = el.querySelector("video");

    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        setActive(visible);
        if (video) {
          if (visible) video.play().catch(() => {});
          else {
            video.pause();
            video.currentTime = 0;
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="cursor-pointer [perspective:1200px]"
      onClick={() => {
        const url = project.demo || project.repo;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      <TiltCard className="group overflow-hidden rounded-2xl border border-white/5">
        <div className="relative h-[400px] overflow-hidden">
          <ProjectMedia media={project.media} active={active} />
          <span className="absolute right-5 top-5 text-6xl font-light text-white/10">
            {project.num}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            {project.soon ? (
              <>
                <h3 className="mb-2 text-2xl font-light text-white/70">
                  {t("projects.soon")}
                </h3>
                <p className="text-[10px] font-medium uppercase tracking-[3px] text-white/30">
                  {t("projects.soonSub")}
                </p>
              </>
            ) : (
              <>
                <h3 className="mb-3 text-2xl font-light">{project.title}</h3>
                <div className="mb-5">
                  <SkillTags stack={project.stack} />
                </div>
                <ProjectActions project={project} t={t} />
              </>
            )}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (reduce || isMobile) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${totalScroll}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
            if (counterRef.current) {
              const idx = Math.min(
                Math.floor(self.progress * projects.length),
                projects.length - 1
              );
              counterRef.current.textContent = projects[idx].num;
            }
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduce, isMobile]);

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <section id="projects" className="bg-[#030303] px-6 py-24">
        <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-red-500">
          {t("projects.label")}
        </p>
        <h2 className="mb-16 text-5xl font-light">
          {t("projects.heading")}
          <span className="text-red-500">.</span>
        </h2>
        <div className="space-y-8">
          {projects.map((project) => (
            <MobileProjectCard key={project.title} project={project} t={t} />
          ))}
        </div>
      </section>
    );
  }

  /* ── DESKTOP — horizontal pinned scroll ── */
  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative overflow-hidden bg-[#030303]"
    >
      {/* FIXED HEADER */}
      <div className="absolute left-10 top-12 z-10 lg:left-20">
        <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-red-500">
          {t("projects.label")}
        </p>
        <h2 className="text-5xl font-light md:text-6xl">
          {t("projects.heading")}
          <span className="text-red-500">.</span>
        </h2>
      </div>

      {/* COUNTER */}
      <div className="absolute right-10 top-12 z-10 flex items-baseline gap-1 lg:right-20">
        <span
          ref={counterRef}
          className="text-6xl font-light text-white/10 transition-all md:text-8xl"
        >
          01
        </span>
        <span className="text-lg text-white/10">
          /{String(projects.length).padStart(2, "0")}
        </span>
      </div>

      {/* TRACK */}
      <div
        ref={trackRef}
        className="flex h-screen items-center gap-8 will-change-transform"
        style={{ paddingLeft: "14vw", paddingRight: "14vw" }}
      >
        <div className="w-[26vw] flex-shrink-0" />

        {projects.map((project) => (
          <div
            key={project.title}
            className="w-[48vw] flex-shrink-0 cursor-pointer [perspective:1200px] lg:w-[34vw]"
            onClick={() => {
              const url = project.demo || project.repo;
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
            onMouseEnter={(e) => {
              const v = e.currentTarget.querySelector("video");
              if (v) v.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              const v = e.currentTarget.querySelector("video");
              if (v) {
                v.pause();
                v.currentTime = 0;
              }
            }}
          >
            <TiltCard
              intensity={6}
              className="group relative h-[52vh] overflow-hidden rounded-3xl border border-white/5 transition-colors duration-500 hover:border-red-500/30"
            >
              <ProjectMedia media={project.media} />

              {/* NUMBER */}
              <span className="absolute right-7 top-5 text-[110px] font-light leading-none text-white/[0.05]">
                {project.num}
              </span>

              {/* CONTENT */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-9 text-center lg:p-11">
                {project.soon ? (
                  <>
                    <h3 className="mb-3 text-3xl font-light text-white/70 lg:text-4xl">
                      {t("projects.soon")}
                    </h3>
                    <p className="text-[10px] font-medium uppercase tracking-[3px] text-white/30">
                      {t("projects.soonSub")}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="mb-4 text-3xl font-light lg:text-4xl">
                      {project.title}
                    </h3>

                    {/* SKILLS — línea minimalista centrada */}
                    <div className="mb-6">
                      <SkillTags stack={project.stack} />
                    </div>

                    {/* ACCIONES */}
                    <ProjectActions project={project} t={t} />
                  </>
                )}
              </div>
            </TiltCard>
          </div>
        ))}
      </div>

      {/* PROGRESS BAR */}
      <div className="absolute bottom-10 left-10 right-10 z-10 lg:left-20 lg:right-20">
        <div className="h-px bg-white/10">
          <div
            ref={progressRef}
            className="h-full origin-left bg-red-500"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
