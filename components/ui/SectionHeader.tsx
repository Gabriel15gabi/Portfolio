import Reveal, { Line } from "@/components/ui/Reveal";
import { KineticLine } from "@/components/ui/Kinetic";

/**
 * Cabecera editorial de sección:
 *  número gigante en outline + etiqueta mono + titular display cinético.
 */
export default function SectionHeader({
  num,
  title,
  label,
  meta,
  id,
}: {
  num: string;
  title: string;
  label: string;
  meta?: string;
  id?: string;
}) {
  return (
    <header className="relative px-4 pt-24 sm:px-8 md:pt-36 lg:px-12">
      {/* Barra técnica superior */}
      <div className="label-mono flex items-center justify-between border-t-2 border-fg pt-3">
        <span>
          <span className="text-accent">§{num}</span> — {label}
        </span>
        {meta && <span className="hidden text-muted md:block">{meta}</span>}
      </div>

      <div className="relative mt-6 md:mt-10">
        {/* Número de sección gigante */}
        <span
          aria-hidden
          className="display text-outline pointer-events-none absolute -top-[0.06em] right-0 select-none text-[34vw] leading-none opacity-30 md:text-[22vw]"
        >
          {num}
        </span>

        <Reveal>
          <h2 id={id} className="display relative text-[clamp(3.6rem,13vw,13rem)]">
            <KineticLine drift={8}>
              <Line>{title}</Line>
            </KineticLine>
          </h2>
        </Reveal>
      </div>
    </header>
  );
}
