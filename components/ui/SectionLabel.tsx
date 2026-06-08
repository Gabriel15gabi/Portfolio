"use client";

import { motion } from "framer-motion";

/**
 * Etiqueta de sección reutilizable: — TÍTULO —
 * Usada en About, Skills, Experience, Projects y Contact para coherencia visual.
 */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex items-center justify-center gap-4"
    >
      <div className="h-px w-8 bg-red-500/50" />
      <p className="text-[10px] uppercase tracking-[8px] text-red-500">
        {children}
      </p>
      <div className="h-px w-8 bg-red-500/50" />
    </motion.div>
  );
}
