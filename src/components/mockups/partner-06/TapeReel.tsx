"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { PlayCircle, ArrowUpRight } from "lucide-react";

const REEL_PROFILES = [
  { id: 1, name: "Jordan Lee", role: "Producer", status: "Tracking Now", color: "#CCFF00" },
  { id: 2, name: "Sam Patel", role: "Drummer", status: "Open for Gigs", color: "#FFFFFF" },
  { id: 3, name: "Maya Chen", role: "Vocalist", status: "Writing", color: "#FFFFFF" },
  { id: 4, name: "Priya K.", role: "Violinist", status: "Available", color: "#CCFF00" },
  { id: 5, name: "Alex R.", role: "Guitarist", status: "In Session", color: "#FFFFFF" },
];

export function TapeReel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const xTransform = useTransform(springScroll, [0, 1], ["0%", "-50%"]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden py-24 bg-[#0F172A] text-white rotate-[-2deg] scale-105 my-24 border-y-4 border-[#CCFF00]">
      <motion.div 
        className="flex items-center gap-12 whitespace-nowrap px-12"
        style={{ x: xTransform }}
      >
        {/* Render two sets for continuous loop effect */}
        {[...REEL_PROFILES, ...REEL_PROFILES, ...REEL_PROFILES].map((profile, i) => (
          <div 
            key={`${profile.id}-${i}`} 
            className="flex items-center gap-8 group cursor-pointer"
          >
            {/* Cassette / Tape Hub visual */}
            <div className="w-16 h-16 rounded-full border-[6px] border-[#334155] flex items-center justify-center shrink-0 bg-[#1E293B] group-hover:border-[#CCFF00] transition-colors">
              <div className="w-4 h-4 rounded-full bg-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-black text-4xl tracking-tighter hover:text-[#CCFF00] transition-colors uppercase">
                  {profile.name}
                </span>
                <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tracking-widest text-[#94A3B8] uppercase">
                  {profile.role}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#475569]" />
                <span 
                  className="font-bold text-xs uppercase px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: profile.color === "#CCFF00" ? "#CCFF00" : "#334155", 
                    color: profile.color === "#CCFF00" ? "#0F172A" : "#F8FAFC" 
                  }}
                >
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
