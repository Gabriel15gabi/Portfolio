/* Piezas comunes de los experimentos del laboratorio. */

export function ExpBar({ code, medium, live, playing }: { code: string; medium: string; live: string; playing: boolean }) {
  return (
    <div className="label-mono flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-8 md:px-6 lg:px-8">
      {/* Sin recortar: en columnas estrechas el rótulo pasa a dos líneas. */}
      <span className="min-w-0">
        <span className="text-accent">{code}</span> — {medium}
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 bg-signal px-2 py-1 text-paper">
        <span className={`h-1.5 w-1.5 bg-paper ${playing ? "animate-blink" : ""}`} aria-hidden />
        {live}
      </span>
    </div>
  );
}

export function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-b border-r border-line px-3 py-2.5">
      <dt className="label-mono text-muted">{label}</dt>
      <dd className={`mt-1 font-mono text-xl tabular-nums tracking-tight md:text-2xl ${accent ? "text-accent" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export function LabButton({
  children,
  onClick,
  pressed,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  pressed?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={pressed}
      className={`label-mono relative border border-line px-3 py-2.5 transition-colors before:absolute before:-inset-y-1 before:inset-x-0 hover:border-fg hover:bg-fg hover:text-bg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg ${className}`}
    >
      {children}
    </button>
  );
}
