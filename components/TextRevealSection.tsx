"use client";

import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextRevealScroll from "@/components/anim/TextRevealScroll";
import { useLanguage } from "@/lib/i18n";

export default function TextRevealSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const lineLeftRef = useRef<HTMLDivElement>(null);
  const lineRightRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const ctx = gsap.context(() => {
      /* Lines that grow from center */
      if (lineLeftRef.current) {
        gsap.fromTo(
          lineLeftRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      }
      if (lineRightRef.current) {
        gsap.fromTo(
          lineRightRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      }

      /* Counter fade in */
      if (counterRef.current) {
        gsap.fromTo(
          counterRef.current,
          { opacity: 0, yPercent: 30 },
          {
            opacity: 1,
            yPercent: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 50%",
              scrub: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#030303] px-6 py-24"
    >
      {/* Background accent */}
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-950/8 blur-[80px]" />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Top decorative line */}
        <div className="mb-12 flex items-center justify-center gap-6">
          <div
            ref={lineLeftRef}
            className="h-px w-24 origin-right bg-gradient-to-l from-red-500/40 to-transparent sm:w-40"
          />
          <span
            ref={counterRef}
            className="text-[10px] uppercase tracking-[6px] text-red-500/60"
          >
            {t("reveal.label")}
          </span>
          <div
            ref={lineRightRef}
            className="h-px w-24 origin-left bg-gradient-to-r from-red-500/40 to-transparent sm:w-40"
          />
        </div>

        {/* Large decorative quote mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <span
            className="inline-block font-light leading-none text-red-500/15"
            style={{ fontSize: "clamp(4rem, 10vw, 10rem)" }}
          >
            &ldquo;
          </span>
        </motion.div>

        {/* Text reveal */}
        <div className="-mt-16 flex justify-center">
          <TextRevealScroll
            text={t("reveal.text")}
            className="max-w-4xl text-center text-2xl font-light italic leading-relaxed tracking-wide text-white sm:text-3xl lg:text-5xl"
          />
        </div>

        {/* Bottom closing quote + line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-4 text-center"
        >
          <span
            className="inline-block rotate-180 font-light leading-none text-red-500/15"
            style={{ fontSize: "clamp(4rem, 10vw, 10rem)" }}
          >
            &ldquo;
          </span>
        </motion.div>

        {/* Bottom decorative line */}
        <div className="mt-8 flex justify-center">
          <div className="h-px w-16 bg-red-500/20" />
        </div>
      </div>
    </section>
  );
}
