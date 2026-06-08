"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 });
  const y = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setVisible(true);

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[data-cursor]"))
        setHovered(true);
    };
    const out = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[data-cursor]"))
        setHovered(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseout", out, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <motion.div
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hovered ? 56 : 28,
        height: hovered ? 56 : 28,
        borderColor: hovered
          ? "rgba(239,68,68,0.8)"
          : "rgba(239,68,68,0.35)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="pointer-events-none fixed left-0 top-0 z-[10000] rounded-full border-2"
    />
  );
}
