"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Intensidad de la inclinación en grados. Por defecto 9 */
  intensity?: number;
};

export default function TiltCard({
  children,
  className = "",
  intensity = 9,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 18 });
  const springY = useSpring(y, { stiffness: 150, damping: 18 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

  // Posición del brillo que sigue al cursor
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, rgba(255,68,68,0.18), transparent 60%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px - 0.5);
    y.set(py - 0.5);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`group relative ${className}`}
    >
      {/* Capa de brillo */}
      <motion.div
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </motion.div>
  );
}