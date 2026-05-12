"use client";

import { motion } from "framer-motion";
import { SpatialNetworkScene } from "./SpatialNetworkScene";

export function CampusHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 px-6 md:px-12 overflow-hidden bg-[#F4F7F5]">
      <SpatialNetworkScene />
      
      <div className="relative z-10 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/80"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#166534] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">B</div>
              <div className="w-6 h-6 rounded-full bg-[#FF5A5F] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">U</div>
              <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">N</div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">12 Campuses Connected</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-fraunces)' }}
            className="text-6xl md:text-8xl text-[#0F172A] font-bold leading-[1.05] tracking-tight"
          >
            Your Campus. <br />
            <span className="text-[#166534] italic">Your Roster.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-xl text-[#475569] leading-relaxed max-w-lg font-medium"
          >
            The living network for student musicians. Find collaborators across your campus and beyond.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button className="h-[56px] px-8 bg-[#FF5A5F] text-white font-sans font-bold text-sm rounded-full shadow-[0_8px_24px_rgba(255,90,95,0.3)] hover:shadow-[0_12px_32px_rgba(255,90,95,0.4)] hover:-translate-y-1 transition-all duration-300">
              Join the Network
            </button>
            <button className="h-[56px] px-8 bg-white/80 backdrop-blur-sm text-[#0F172A] font-sans font-bold text-sm rounded-full shadow-sm border border-white/80 hover:border-[#0F172A] transition-all duration-300">
              Explore Schools &rarr;
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
