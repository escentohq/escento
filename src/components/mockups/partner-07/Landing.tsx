"use client";

import { motion, useMotionValue, useTransform, useInView, useReducedMotion, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

const MUSICIANS = [
  { id: "1", name: "Maya C.", instrument: "Guitar · Vocals", school: "UT Austin", available: true },
  { id: "2", name: "Jordan L.", instrument: "Cello", school: "USC", available: true },
  { id: "3", name: "Sam P.", instrument: "Piano · Producer", school: "Berklee", available: true },
  { id: "4", name: "Priya K.", instrument: "Violin", school: "UCLA", available: false },
];

const THIS_WEEK = [
  { type: "MUSICIAN", school: "UT AUSTIN", name: "Maya Chen", desc: "Guitar, vocals. Indie, folk." },
  { type: "GIG", school: "REMOTE", name: "Film Composer", desc: "Thesis short, paid. Jun deadline." },
  { type: "MUSICIAN", school: "BERKLEE", name: "Sam Park", desc: "Piano, producer. Jazz, pop." },
];

const STATS = [
  { value: 142, label: "musicians" },
  { value: 24, label: "open gigs" },
  { value: 12, label: "universities" },
];

function TiltCard({ musician }: { musician: typeof MUSICIANS[0] }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-80, 80], [-5, 5]);
  const rotateX = useTransform(mouseY, [-80, 80], [5, -5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={shouldReduceMotion
        ? { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }
        : { rotateX, rotateY, transformPerspective: 1200, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-xl p-4 cursor-pointer group"
    >
      <motion.div
        className="absolute left-0 top-2 bottom-2 w-0 bg-[#0A66C2] rounded-l-xl"
        whileHover={{ width: 3 }}
        transition={{ duration: 0.15 }}
      />
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: musician.available ? "#057642" : "#888888" }}
        />
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">
          {musician.available ? "Available" : "Not looking"}
        </span>
      </div>
      <p className="font-semibold text-[#191919] text-[17px] leading-tight">{musician.name}</p>
      <p className="text-[13px] text-[#555555] mt-0.5">{musician.instrument}</p>
      <p className="text-[12px] text-[#888888]">{musician.school}</p>
      <motion.div
        className="flex items-center gap-1 mt-3 text-[13px] font-medium text-[#0A66C2]"
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        View profile →
      </motion.div>
    </motion.div>
  );
}

function AnimatedStat({ value, label }: { value: number; label: string }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(inViewRef, { once: true });
  const [displayed, setDisplayed] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplayed(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, shouldReduceMotion]);

  return (
    <div ref={inViewRef} className="text-center">
      <span ref={ref} className="block font-bold text-[#191919]" style={{ fontSize: "clamp(40px, 5vw, 56px)" }}>
        {displayed}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-[#888888] mt-1 block">{label}</span>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  visible: { transition: { staggerChildren: 0.09 } },
};

export function Landing() {
  const shouldReduceMotion = useReducedMotion();
  const thisWeekRef = useRef<HTMLDivElement>(null);
  const isThisWeekInView = useInView(thisWeekRef, { once: true });

  return (
    <div className="bg-white text-[#191919] min-h-screen font-sans">
      {/* ── NAV ── */}
      <nav className="border-b border-[#1F1B16] px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-[20px] tracking-[0.04em]">GIGFORGE</span>
          <div className="h-px bg-[#B8860B] mt-0.5" style={{ width: "calc(3ch)" }} />
        </div>
        <a href="#" className="text-[15px] text-[#555555] hover:text-[#0A66C2] transition-colors">
          Sign in →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-12 items-start">
        {/* Left: pitch */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-6">
            Campus Label · Spring &apos;26
          </p>
          <h1
            className="font-bold text-[#191919] leading-[1.0] tracking-[-0.025em]"
            style={{ fontSize: "clamp(48px, 6.5vw, 88px)" }}
          >
            Find the right student musician for your next project.
          </h1>
          <p className="mt-6 text-[#555555] leading-relaxed max-w-md" style={{ fontSize: "clamp(16px, 1.5vw, 20px)" }}>
            The campus directory for student creators. No feed. Direct email contact.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center px-7 font-semibold text-[15px] text-white bg-[#0A66C2] hover:bg-[#004182] transition-colors rounded-[4px]"
              style={{ height: 52 }}
            >
              Browse musicians
            </a>
            <a
              href="#"
              className="text-[15px] font-medium text-[#0A66C2] underline underline-offset-[3px] hover:text-[#004182] transition-colors"
            >
              Post a gig
            </a>
          </div>
        </motion.div>

        {/* Right: mini-directory */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {MUSICIANS.map((m) => (
              <motion.div key={m.id} variants={cardVariants} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
                <TiltCard musician={m} />
              </motion.div>
            ))}
          </div>
          <motion.a
            href="#"
            variants={cardVariants}
            className="text-[13px] text-[#0A66C2] font-medium hover:underline text-right"
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            + 138 more musicians →
          </motion.a>
        </motion.div>
      </section>

      {/* ── STAT ROW ── */}
      <section className="bg-[#F3F2EF] border-t border-b border-[rgba(0,0,0,0.10)]">
        <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-3 divide-x divide-[rgba(0,0,0,0.10)]">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ── THIS WEEK ── */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-6">
          This Week
        </p>
        <motion.div
          ref={thisWeekRef}
          variants={containerVariants}
          initial="hidden"
          animate={isThisWeekInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(0,0,0,0.10)]"
        >
          {THIS_WEEK.map((item) => (
            <motion.div
              key={item.name}
              variants={cardVariants}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="px-0 sm:px-6 first:pl-0 last:pr-0 py-6 sm:py-0 group cursor-pointer"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#888888] mb-2">
                {item.type} · {item.school}
              </p>
              <p className="font-bold text-[#191919] text-[22px] leading-tight group-hover:text-[#0A66C2] transition-colors">
                {item.name}
              </p>
              <p className="text-[14px] text-[#555555] mt-1 leading-relaxed">{item.desc}</p>
              <motion.span
                className="inline-flex items-center gap-1 mt-4 text-[13px] font-medium text-[#0A66C2]"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                →
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#F3F2EF] border-t border-[rgba(0,0,0,0.10)] px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-8">
            How it works
          </p>
          <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.10)]">
            {[
              { n: "01", title: "Browse the directory.", body: "No account needed. Fully open." },
              { n: "02", title: "Find someone you need.", body: "Filter by instrument, genre, or school." },
              { n: "03", title: "Email them directly.", body: "No platform in between. Their email is right there." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex items-start gap-6 py-6">
                <span className="font-mono text-sm font-semibold text-[#0A66C2] w-8 shrink-0">{n}</span>
                <div>
                  <p className="font-semibold text-[#191919]">{title}</p>
                  <p className="text-[14px] text-[#555555] mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(0,0,0,0.12)] px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-[16px] tracking-[0.04em] text-[#191919]">GIGFORGE</span>
          <div className="flex items-center gap-6 text-[13px] text-[#888888]">
            <a href="#" className="hover:text-[#0A66C2] transition-colors">About</a>
            <a href="#" className="hover:text-[#0A66C2] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#0A66C2] transition-colors">Post a gig</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
