"use client";

import { motion } from "framer-motion";
import { MomentumScene } from "./MomentumScene";
import { TapeReel } from "./TapeReel";
import { ArrowRight, Zap, Radio, Users } from "lucide-react";

export function Landing() {
  return (
    <div className="bg-white text-[#0F172A] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#0F172A] relative overflow-hidden">
      {/* Background 3D */}
      <MomentumScene />

      {/* Nav */}
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between">
        <span className="font-black text-2xl tracking-tighter uppercase">
          GigForge<span className="text-[#CCFF00]">.</span>
        </span>
        <button className="font-bold text-sm bg-[#0F172A] text-white px-6 py-2.5 rounded-full hover:bg-[#CCFF00] hover:text-[#0F172A] transition-colors">
          Log In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-widest text-[#64748B]">
            Network is Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto"
          style={{ fontSize: "clamp(64px, 10vw, 120px)" }}
        >
          Open to<br />
          <span className="relative inline-block">
            <span className="relative z-10 text-[#0F172A]">Collaborate.</span>
            <span className="absolute bottom-2 left-0 w-full h-8 bg-[#CCFF00] -rotate-2 z-0"></span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-xl md:text-2xl font-medium text-[#64748B] max-w-2xl"
        >
          Stop posting into the void. A directory built entirely around momentum, visibility, and making music together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row gap-4"
        >
          <button className="flex items-center justify-center gap-2 bg-[#CCFF00] text-[#0F172A] px-8 h-16 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(204,255,0,0.4)]">
            <Zap className="w-6 h-6" />
            Find a Musician
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border-4 border-[#0F172A] text-[#0F172A] px-8 h-16 rounded-full font-black text-lg hover:bg-[#F8FAFC] transition-colors">
            Post a Gig
          </button>
        </motion.div>
      </section>

      {/* Tape Reel Carousel */}
      <TapeReel />

      {/* Value Props */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "High Visibility", desc: "If you're looking for work, you're front and center. No algorithm burying your profile.", icon: Radio },
            { title: "Direct Contact", desc: "Find the right sound, then email them directly. No middleman messaging platforms.", icon: ArrowRight },
            { title: "Student Focused", desc: "Built for campus scenes. Find peers who want to track, film, and perform right now.", icon: Users },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-4 p-8 rounded-[2rem] bg-[#F8FAFC] border-2 border-[#F1F5F9] hover:border-[#CCFF00] transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-[#F1F5F9] group-hover:bg-[#CCFF00] transition-colors">
                <item.icon className="w-8 h-8 text-[#0F172A]" />
              </div>
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="text-[#64748B] font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="relative z-10 bg-[#0F172A] text-white py-24 px-6 border-t-[16px] border-[#CCFF00]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="font-black text-5xl md:text-7xl tracking-tighter mb-8">
            Ready to record?
          </h2>
          <button className="bg-[#CCFF00] text-[#0F172A] px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform flex items-center gap-3">
            Join the Roster <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
