"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { StageLightsScene } from "./StageLightsScene";
import { ArrowRight, Sparkles, PlayCircle, Plus } from "lucide-react";

export function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#FAFAFA] text-[#0F172A] min-h-screen font-sans selection:bg-[#0055FF] selection:text-white">
      {/* ── 3D SCENE ── */}
      <StageLightsScene />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-difference text-white">
        <span className="font-mono text-sm font-bold tracking-widest uppercase">
          GigForge
        </span>
        <button className="text-sm font-semibold hover:text-[#0055FF] transition-colors uppercase tracking-wide">
          Sign in →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <motion.div 
          className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Stage Directions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0055FF] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFB000] animate-pulse delay-150" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[#64748B] uppercase">
              Live & Loud
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-6"
          >
            Take the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000]">Stage.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[#475569] font-medium max-w-2xl leading-relaxed mb-10"
          >
            The social network for student musicians and creators. Find your next collaborator, book a gig, or just see who's making noise on campus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button className="group relative w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#0F172A] text-white font-bold text-sm tracking-wide overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF]">
              <span className="relative z-10">Browse Musicians</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0055FF] to-[#FF3366] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-[#0F172A] font-bold text-sm tracking-wide border-2 border-[#E2E8F0] hover:border-[#0F172A] transition-colors">
              <Plus className="w-4 h-4" />
              Post a Gig
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-20 bg-white py-32 px-6 border-t border-[#F1F5F9]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Spotlight", desc: "Browse a curated feed of student talent. No account needed to just look around.", icon: PlayCircle, color: "text-[#0055FF]" },
              { num: "02", title: "Connect", desc: "Found the perfect sound? Emails and socials are front and center.", icon: Sparkles, color: "text-[#FF3366]" },
              { num: "03", title: "Create", desc: "Book them for your film, band, or event. It's that simple.", icon: ArrowRight, color: "text-[#FFB000]" }
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative p-8 rounded-3xl bg-[#F8FAFC] border border-[#F1F5F9] hover:bg-white hover:shadow-2xl hover:shadow-[#0055FF]/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className={`font-mono text-4xl font-black opacity-20 group-hover:opacity-100 transition-opacity ${step.color}`}>
                    {step.num}
                  </span>
                  <step.icon className={`w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity ${step.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-[#64748B] font-medium leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE LISTINGS ── */}
      <section className="relative z-20 bg-[#F8FAFC] py-32 px-6 border-t border-[#F1F5F9]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center mb-16"
          >
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#0055FF] uppercase mb-4">
              Now Playing
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Featured Talent
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Musician Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-[#0055FF]/10 border border-[#F1F5F9] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0055FF]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center font-bold text-[#0F172A] overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=maya" alt="Maya" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Maya Chen</h3>
                    <p className="text-sm font-mono text-[#64748B]">Piano • Film Scoring</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0055FF]/10 text-[#0055FF] text-xs font-bold uppercase tracking-wider">
                  Available
                </span>
              </div>
              
              <p className="text-[#475569] font-medium leading-relaxed mb-8 relative z-10">
                UT Austin junior. Film scoring focus. Has tracked on 4 student shorts this semester. Specializes in jazz and orchestral cues.
              </p>
              
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] group-hover:bg-[#0055FF] group-hover:text-white transition-colors relative z-10">
                <span className="font-bold text-sm">View Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Gig Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-[#0F172A] text-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#FF3366]/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF3366]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E293B] flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-[#FF3366]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Short Film Score</h3>
                    <p className="text-sm font-mono text-[#94A3B8]">Film • Unpaid + Credit</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FF3366]/20 text-[#FF3366] text-xs font-bold uppercase tracking-wider">
                  Open
                </span>
              </div>
              
              <p className="text-[#CBD5E1] font-medium leading-relaxed mb-8 relative z-10">
                Need someone who can write sparse orchestral cues. Rough cut ready. 3-week turnaround. Good for portfolio building.
              </p>
              
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1E293B] group-hover:bg-[#FF3366] transition-colors relative z-10">
                <span className="font-bold text-sm">See Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-20 bg-white py-12 px-6 border-t border-[#F1F5F9]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-widest uppercase">
              GigForge
            </span>
            <span className="text-[#94A3B8] text-sm">© {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors">Twitter</a>
            <a href="#" className="text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors">Instagram</a>
            <a href="#" className="text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
