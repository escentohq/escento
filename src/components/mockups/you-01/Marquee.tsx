"use client";

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const ITEMS = ["JAZZ", "INDIE", "HIP-HOP", "FOLK", "ELECTRONIC", "CLASSICAL", "PUNK", "SOUL"];

export function Marquee() {
  const controls = useAnimationControls();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) {
      controls.stop();
      return;
    }

    controls.start({
      x: ["0%", "-50%"],
      transition: { duration: 45, ease: "linear", repeat: Infinity },
    });
  }, [controls, paused, reduced]);

  return (
    <section
      className="relative h-[100px] overflow-hidden border-y-4 border-[#0E0D0B] bg-[#0E0D0B] text-[#F2EFE8] sm:h-[160px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex h-full w-max items-center whitespace-nowrap"
        animate={controls}
        initial={{ x: "0%" }}
      >
        {[...ITEMS, ...ITEMS, ...ITEMS].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center font-bold italic leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(96px, 12vw, 180px)" }}
          >
            <span className="px-6">{item}</span>
            <span className="text-[40px] text-[#C8331C]">★</span>
          </span>
        ))}
      </motion.div>
      <AnimatePresence>
        {paused ? (
          <motion.div
            className="absolute right-4 top-4 border border-[#C8331C] bg-[#0E0D0B] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8331C]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            paused
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
