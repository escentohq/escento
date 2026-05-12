"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  style?: CSSProperties;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  style,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={shouldReduceMotion ? false : { opacity: 0, y, scale: 0.985 }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type HoverRowProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hoverBackground?: string;
};

export function HoverRow({
  children,
  className,
  style,
  hoverBackground = "var(--pill-bg)",
}: HoverRowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={shouldReduceMotion ? undefined : { x: 4, backgroundColor: hoverBackground }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
