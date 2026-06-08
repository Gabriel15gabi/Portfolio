"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Node.js",
  "SQL",
  "MongoDB",
  "GitHub",
  "OpenAI API",
];

export default function SkillsMarquee() {
  const { t } = useLanguage();

  return (
    <section className="relative flex justify-center overflow-hidden bg-[#030303] px-6 py-32 lg:py-44">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-red-900/5 blur-[200px]" />

      <div className="relative z-10 flex w-full max-w-[960px] flex-col items-center text-center">
        {/* HEADER */}
        <SectionLabel>{t("skills.label")}</SectionLabel>

        {/* SKILLS — centrado y balanceado */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-7">
          {skills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
              viewport={{ once: true }}
              className="group inline-flex cursor-default items-baseline gap-2"
            >
              <span className="text-[11px] tabular-nums text-red-500/40 transition-colors duration-300 group-hover:text-red-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xl font-light text-white/40 transition-colors duration-300 group-hover:text-white sm:text-2xl">
                {skill}
              </span>
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
