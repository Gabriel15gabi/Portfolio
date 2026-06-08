"use client";

import { motion } from "framer-motion";

/**
 * Línea de texto que entra deslizándose desde abajo con máscara de overflow.
 * Reutilizada en Hero, Contact y cualquier heading editorial.
 */
export default function RevealText({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        whileInView={{ y: "0%" }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        {children}
      </motion.span>
    </span>
  );
}
