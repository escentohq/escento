"use client";

import { motion } from "framer-motion";
import { SoftShapesScene } from "./SoftShapesScene";

export function PaperHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      <SoftShapesScene />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#1A1A1A] leading-[1.1] tracking-tight"
        >
          The network for <br className="hidden md:block" />
          <span className="italic text-[#FF5A36]">student musicians.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-lg md:text-xl text-[#666666] max-w-2xl mx-auto leading-relaxed"
        >
          A lighter, warmer way to find collaborators, book gigs, and build your musical roster on campus. Real people, direct connections.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="h-[54px] px-8 bg-[#FF5A36] text-white font-sans font-medium rounded-full shadow-[0_8px_24px_rgba(255,90,54,0.3)] hover:shadow-[0_12px_32px_rgba(255,90,54,0.4)] hover:-translate-y-1 transition-all duration-300">
            Join the directory
          </button>
          <button className="h-[54px] px-8 bg-transparent text-[#1A1A1A] font-sans font-medium rounded-full border border-[#E5E3DB] hover:border-[#1A1A1A] hover:bg-white transition-all duration-300">
            Explore roster &rarr;
          </button>
        </motion.div>
      </div>
    </section>
  );
}
