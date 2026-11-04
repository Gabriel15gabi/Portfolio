"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ProjectMedia from "@/components/ui/ProjectMedia";
import Reveal, { Line } from "@/components/ui/Reveal";
import { KineticLine, Parallax } from "@/components/ui/Kinetic";
import { PROJECTS, type Project } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

type T = (k: string) => string;
const TOTAL = String(PROJECTS.length).padStart(2, "0");

/* ── Piezas comunes ─────────────────────────────────────── */

function MetaStrip({ p, t }: { p: Project; t: T }) {
  return (
    <div className="label-mono flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t-2 border-fg pt-3">
      <span>
        <span className="text-accent">{t("work.index")} {p.num}</span>
        <span className="text-muted"> / {TOTAL}</span>
      </span>
      <span className="text-muted">{p.stack.join(" · ")}</span>
    </div>
  );
}

function Actions({ p, t, className = "" }: { p: Project; t: T; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {p.demo && (
        <a
          href={p.demo}
          target="_blank"
          rel="noreferrer"
          data-cursor={t("cursor.open")}
          className="label-mono group/btn inline-flex items-center gap-3 border-2 border-fg bg-fg px-4 py-3 text-bg transition-colors hover:border-accent hover:bg-accent hover:text-paper"
        >
          {t("work.demo")}
          <span className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5">↗</span>
        </a>
      )}
      {p.repo && (
        <a
          href={p.repo}
          target="_blank"
          rel="noreferrer"
          data-cursor={t("cursor.code")}
          className="label-mono group/btn inline-flex items-center gap-3 border-2 border-fg px-4 py-3 transition-colors hover:bg-fg hover:text-bg"
        >
          {t("work.code")}
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </a>
      )}
    </div>
  );
}

function Title({ children, className = "", id }: { children: string; className?: string; id?: string }) {
  return (
    <Reveal as="h3" id={id} className={`display ${className}`}>
      <Line>{children}</Line>
    </Reveal>
  );
}

/** Divide un título compuesto ("JobFlow") en macizo + contorno. */
function SplitTitle({ title }: { title: string }) {
  const cut = title.search(/(?<=.)[A-Z\s]/);
  if (cut <= 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, cut)}
      <span className="text-outline">{title.slice(cut).trim()}</span>
    </>
  );
}

/* ── 01 · Composición tipográfica (sin captura) ─────────── */
function PieceType({ p, t }: { p: Project; t: T }) {
  const features = p.featuresKey ? t(p.featuresKey).split("|") : [];
  return (
    <article aria-labelledby={`p-${p.slug}`} className="relative">
      <MetaStrip p={p} t={t} />
      <div className="relative mt-6 overflow-clip">
        <KineticLine drift={10}>
          <h3 id={`p-${p.slug}`} className="display whitespace-nowrap text-[22vw] leading-[0.78] md:text-[24vw]">
            <span className="mask-line">
              <span className="block">
                <SplitTitle title={p.title} />
              </span>
            </span>
          </h3>
        </KineticLine>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <p className="text-xl leading-snug md:col-span-5 md:text-2xl">{t(p.descKey)}</p>
        <ol className="md:col-span-6 md:col-start-7">
          {features.map((f, i) => (
            <li
              key={f}
              className="group/row flex items-baseline justify-between gap-4 border-t border-fg py-3 transition-colors last:border-b hover:bg-fg hover:text-bg md:px-2"
            >
              <span className="label-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-lg font-medium md:text-xl">{f}</span>
              <span className="label-mono opacity-0 transition-opacity group-hover/row:opacity-100">■</span>
            </li>
          ))}
        </ol>
      </div>
      <Actions p={p} t={t} className="mt-8" />
    </article>
  );
}

/* ── 02 · Imagen a sangre con título superpuesto ────────── */
function PieceBleed({ p, t }: { p: Project; t: T }) {
  return (
    <article aria-labelledby={`p-${p.slug}`} className="relative">
      <MetaStrip p={p} t={t} />
      <div className="relative mt-6 grid md:grid-cols-12">
        <Reveal variant="clip" className="md:col-span-10">
          <ProjectMedia src={p.media ?? ""} title={p.title} href={p.demo} t={t} className="aspect-[16/10] md:aspect-[16/8.5]" />
        </Reveal>
        <div className="relative md:col-span-7 md:col-start-6 md:-mt-[9vw]">
          <Title id={`p-${p.slug}`} className="text-[19vw] [-webkit-text-stroke:0.07em_var(--bg)] [paint-order:stroke_fill] md:text-[13vw]">{p.title}</Title>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <p className="text-lg leading-snug md:col-span-4 md:col-start-2 md:text-xl">{t(p.descKey)}</p>
        <Actions p={p} t={t} className="md:col-span-4 md:col-start-8 md:justify-end md:self-end" />
      </div>
    </article>
  );
}

/* ── 03 · Columna estrecha + título vertical ────────────── */
function PieceColumn({ p, t }: { p: Project; t: T }) {
  return (
    <article aria-labelledby={`p-${p.slug}`} className="relative">
      <MetaStrip p={p} t={t} />
      <div className="mt-6 grid gap-6 md:grid-cols-12 md:gap-x-6">
        <div className="relative hidden md:col-span-2 md:block">
          <h3
            id={`p-${p.slug}`}
            className="display sticky top-24 text-[8.5vw] leading-[0.8] [writing-mode:vertical-rl] rotate-180"
          >
            {p.title}
          </h3>
        </div>
        <h3 className="display text-[17vw] leading-[0.8] md:hidden">{p.title}</h3>
        <div className="flex flex-col justify-end gap-6 md:col-span-4 md:col-start-4 md:pb-4">
          <span className="display text-outline text-[22vw] leading-none md:text-[12vw]" aria-hidden>
            {p.num}
          </span>
          <p className="text-lg leading-snug md:text-xl">{t(p.descKey)}</p>
          <Actions p={p} t={t} />
        </div>
        <Parallax speed={-0.15} className="md:col-span-5 md:col-start-8">
          <Reveal variant="clip">
            <ProjectMedia src={p.media ?? ""} title={p.title} href={p.demo} t={t} className="aspect-[4/5]" />
          </Reveal>
        </Parallax>
      </div>
    </article>
  );
}

/* ── 04 · Bloque rojo con media insertada ───────────────── */
function PieceBlock({ p, t }: { p: Project; t: T }) {
  return (
    <article aria-labelledby={`p-${p.slug}`} className="relative">
      <MetaStrip p={p} t={t} />
      <div className="theme-red relative mt-6 grid gap-6 p-4 sm:p-6 md:grid-cols-12 md:p-10">
        <div className="flex flex-col justify-between gap-6 md:col-span-4">
          <p className="label-mono">{p.stack.join(" / ")}</p>
          <p className="text-lg font-medium leading-snug md:text-xl">{t(p.descKey)}</p>
        </div>
        <div className="md:col-span-8">
          <ProjectMedia
            src={p.media ?? ""}
            title={p.title}
            href={p.demo}
            t={t}
            className="aspect-[16/10] border-2 border-ink"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Title id={`p-${p.slug}`} className="text-[17vw] md:text-[11.5vw]">{p.title}</Title>
        <Actions p={p} t={t} className="md:mb-4" />
      </div>
    </article>
  );
}

/* ── 05 · Hueco: siguiente pieza (sin inventar contenido) ── */
function NextPiece({ t }: { t: T }) {
  return (
    <aside className="relative">
      <div className="label-mono flex justify-between border-t-2 border-fg pt-3">
        <span>
          <span className="text-accent">{t("work.index")} 05</span>
        </span>
        <span className="text-muted">{t("work.nextTag")}</span>
      </div>
      <div
        className="mt-6 flex min-h-[38vh] flex-col justify-between gap-8 border-2 border-dashed border-fg p-6 md:flex-row md:items-end md:p-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in srgb, var(--fg) 7%, transparent) 14px 16px)",
        }}
      >
        <p className="display text-[16vw] leading-[0.8] text-muted md:text-[9vw]">{t("work.next")}</p>
        <p className="max-w-[34ch] text-base leading-snug md:text-lg">{t("work.nextSub")}</p>
      </div>
    </aside>
  );
}

const LAYOUTS = {
  type: PieceType,
  bleed: PieceBleed,
  column: PieceColumn,
  block: PieceBlock,
} as const;

export default function Work() {
  const { t } = useLanguage();
  return (
    <section id="work" data-theme="light" aria-labelledby="work-title" className="relative overflow-clip pb-20 md:pb-32">
      <SectionHeader num="01" title={t("work.title")} label={t("work.label")} meta={t("work.meta")} id="work-title" />
      <div className="mt-16 flex flex-col gap-24 px-4 sm:px-8 md:mt-24 md:gap-48 lg:px-12">
        {PROJECTS.map((p) => {
          // Las composiciones con imagen necesitan media; sin ella, tipográfica.
          const Piece = p.media ? LAYOUTS[p.layout] : PieceType;
          return <Piece key={p.slug} p={p} t={t} />;
        })}
        <NextPiece t={t} />
      </div>
    </section>
  );
}
