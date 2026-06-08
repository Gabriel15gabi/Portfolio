"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function TextRevealScroll({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      container.querySelectorAll<HTMLSpanElement>(".word").forEach((w) => {
        w.style.opacity = "1";
      });
      return;
    }

    const words = container.querySelectorAll(".word");

    const ctx = gsap.context(() => {
      gsap.set(words, { opacity: 0.08 });

      gsap.to(words, {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <p
      ref={containerRef}
      className={`flex flex-wrap justify-center gap-x-[0.35em] gap-y-1 ${className}`}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="word">
          {word}
        </span>
      ))}
    </p>
  );
}
