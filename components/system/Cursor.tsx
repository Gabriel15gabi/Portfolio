"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Cursor contextual.
 *  - Por defecto: un bloque cuadrado de señal.
 *  - [data-cursor="TEXTO"]: etiqueta mono con el texto (VIEW, PLAY, COPY…).
 *  - Enlaces / botones: el bloque crece y se vuelve marco.
 *  - Campos de texto: barra vertical tipo caret.
 * Solo en dispositivos con puntero fino; en táctil no se monta.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const dur = reduce ? 0 : 0.18;
    const xTo = gsap.quickTo(el, "x", { duration: dur, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: dur, ease: "power3.out" });

    let visible = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) {
        visible = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.dataset.visible = "true";
      }
    };

    const setState = (target: EventTarget | null) => {
      const node = target as HTMLElement | null;
      if (!node || !node.closest) return;
      const labelled = node.closest<HTMLElement>("[data-cursor]");
      if (labelled && labelled.dataset.cursor) {
        el.dataset.state = "label";
        label.textContent = labelled.dataset.cursor;
        return;
      }
      if (node.closest("input, textarea, select")) {
        el.dataset.state = "text";
        return;
      }
      if (node.closest("a, button, [role='button'], label")) {
        el.dataset.state = "link";
        return;
      }
      el.dataset.state = "idle";
    };

    const over = (e: PointerEvent) => setState(e.target);
    const leave = () => {
      visible = false;
      el.dataset.visible = "false";
    };
    const down = () => (el.dataset.pressed = "true");
    const up = () => (el.dataset.pressed = "false");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-state="idle"
      data-visible="false"
      className="group/cursor pointer-events-none fixed left-0 top-0 z-[10000] opacity-0 data-[visible=true]:opacity-100"
    >
      <div
        className={[
          "relative -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color,border-radius,transform] duration-300 ease-[var(--ease-expo)]",
          "h-3 w-3 bg-[var(--cursor)]",
          // link: marco vacío
          "group-data-[state=link]/cursor:h-11 group-data-[state=link]/cursor:w-11 group-data-[state=link]/cursor:border-2 group-data-[state=link]/cursor:border-[var(--cursor)] group-data-[state=link]/cursor:bg-transparent",
          // text: caret
          "group-data-[state=text]/cursor:h-7 group-data-[state=text]/cursor:w-[3px]",
          // label: caja con texto
          "group-data-[state=label]/cursor:h-auto group-data-[state=label]/cursor:w-auto group-data-[state=label]/cursor:bg-ink group-data-[state=label]/cursor:px-3 group-data-[state=label]/cursor:py-2",
          "group-data-[pressed=true]/cursor:scale-75",
        ].join(" ")}
      >
        <span
          ref={labelRef}
          className="label-mono hidden whitespace-nowrap text-paper group-data-[state=label]/cursor:block"
        />
      </div>
    </div>
  );
}
