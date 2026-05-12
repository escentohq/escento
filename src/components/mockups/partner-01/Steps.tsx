"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({ value, duration = 1.6 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);

        if (progress < 1) {
          // easeOutExpo
          const currentCount = Math.floor(value * (1 - Math.pow(2, -10 * progress)));
          setCount(currentCount);
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

const blocks = [
  {
    command: "> browse_directory()",
    comment: "// No account needed. Just look.",
  },
  {
    command: "> find_match()",
    comment: "// Filter by instrument, campus, availability.",
  },
  {
    command: "> email_directly()",
    comment: "// No DMs. No platform. Their email is right there.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const blockVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function Steps() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="space-y-32">
      {/* Animated Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="space-y-2">
          <div className="font-mono font-bold text-5xl text-[#00FF88]">
            <AnimatedCounter value={142} />
          </div>
          <div className="font-sans text-[12px] uppercase tracking-wider text-[#2A4A36] font-semibold">
            musicians
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-mono font-bold text-5xl text-[#00FF88]">
            <AnimatedCounter value={24} />
          </div>
          <div className="font-sans text-[12px] uppercase tracking-wider text-[#2A4A36] font-semibold">
            open gigs
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-mono font-bold text-5xl text-[#00FF88]">
            <AnimatedCounter value={12} />
          </div>
          <div className="font-sans text-[12px] uppercase tracking-wider text-[#2A4A36] font-semibold">
            universities
          </div>
        </div>
      </div>

      {/* Terminal Steps */}
      <motion.div
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="bg-[#050F08] border border-[#0A1A0F] rounded-lg p-8 md:p-12 font-mono text-lg space-y-8"
      >
        {blocks.map((block, idx) => (
          <motion.div key={idx} variants={shouldReduceMotion ? {} : blockVariants} className="space-y-2">
            <div className="text-[#00FF88]">{block.command}</div>
            <div className="text-[#4A7A5A] pl-4">{block.comment}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
