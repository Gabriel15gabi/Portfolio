"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useLanguage } from "@/lib/i18n";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AboutMe() {
  const { t } = useLanguage();
  const disciplines = ["pillar1", "pillar2", "pillar3"];

  return (
    <section
      id="about"
      className="relative flex justify-center overflow-hidden bg-[#030303] px-6 py-32 lg:py-48"
    >
      {/* BG */}
      <div className="pointer-events-none absolute left-1/2 top-[12%] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-red-950/8 blur-[80px]" />

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col items-center text-center">
        {/* LABEL */}
        <SectionLabel>{t("about.label")}</SectionLabel>

        {/* HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          viewport={{ once: true }}
          className="mt-8 text-4xl font-light leading-[1.1] sm:text-5xl lg:text-6xl"
        >
          {t("about.heading1")}{" "}
          <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)]">
            {t("about.heading2")}
          </span>
          <span className="text-red-500">.</span>
        </motion.h2>

        {/* BIO */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          viewport={{ once: true }}
          className="mt-10 max-w-[580px] text-base leading-[1.9] text-white/40 sm:text-lg"
        >
          {t("about.bio")}
        </motion.p>

        {/* DISCIPLINES — número gigante en outline como marca de agua, sin cajitas */}
        <div className="mt-20 flex w-full max-w-[760px] flex-col gap-6">
          {disciplines.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              viewport={{ once: true }}
              className="group relative flex flex-col items-center py-12"
            >
              {/* número gigante en outline — marca de agua detrás */}
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[130px] font-extralight leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] transition-all duration-700 group-hover:[-webkit-text-stroke:1px_rgba(239,68,68,0.25)] sm:text-[190px]">
                0{i + 1}
              </span>

              {/* contenido encima */}
              <div className="relative flex flex-col items-center">
                <h3 className="text-3xl font-light text-white transition-colors duration-500 sm:text-4xl">
                  {t(`about.${key}.title`)}
                </h3>

                {/* línea roja que crece al hover */}
                <span className="my-5 h-px w-10 bg-red-500/50 transition-all duration-500 group-hover:w-20" />

                <p className="max-w-[440px] text-[15px] leading-relaxed text-white/40 sm:text-base">
                  {t(`about.${key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
