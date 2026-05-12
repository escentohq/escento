"use client";

import { motion, useReducedMotion } from "framer-motion";

const mockActivities = [
  "Maya Chen joined · guitar",
  "Composer gig posted · $300",
  "Sam Park updated availability",
  "Jazz ensemble looking for bassist",
  "Alex M. connected with Producer",
  "New venue added: The Basement",
  "Recording session booked",
  "Drummer needed for indie pop project",
];

export function ActivityMarquee() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full h-[80px] bg-[#050F08] overflow-hidden flex items-center whitespace-nowrap border-y border-[#0A1A0F]">
      <motion.div
        animate={shouldReduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex min-w-max"
      >
        {/* Render twice for seamless loop */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex font-mono text-[13px] tracking-wide items-center">
            {mockActivities.map((activity, j) => (
              <div key={j} className="flex items-center">
                <span className="text-[#00FF88] px-6">{activity}</span>
                <span className="text-[#2A4A36] text-[10px]">&bull;</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
