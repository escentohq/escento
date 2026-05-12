"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      animate={shouldReduceMotion || isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (current) => setDisplayValue(Math.floor(current)),
    });

    return () => controls.stop();
  }, [isInView, shouldReduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}

export function HoverCell({
  children,
  className,
  invert,
}: {
  children: ReactNode;
  className?: string;
  invert?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        shouldReduceMotion
          ? undefined
          : invert
            ? { backgroundColor: "var(--accent-indigo-hover)", color: "var(--page-bg)", scale: 1.008 }
            : { backgroundColor: "var(--accent-indigo)", color: "var(--page-bg)", scale: 1.008 }
      }
      transition={{ duration: 0.08, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
