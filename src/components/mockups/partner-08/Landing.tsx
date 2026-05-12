"use client";

import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  AnimatePresence,
  animate,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const WaveformMesh = dynamic(
  () => import("./WaveformMesh").then((m) => m.WaveformMesh),
  { ssr: false }
);

// ── Data ─────────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  { name: "Maya Chen", event: "joined", detail: "guitar · vocals" },
  { name: "Composer needed", event: "posted", detail: "thesis short · paid" },
  { name: "Jordan Lee", event: "joined", detail: "cello · classical" },
  { name: "Loop composer gig", event: "posted", detail: "indie game · flexible" },
  { name: "Sam Park", event: "joined", detail: "piano · producer" },
  { name: "Film scorer needed", event: "posted", detail: "short film · negotiable" },
  { name: "Priya Kapoor", event: "joined", detail: "violin · orchestral" },
  { name: "Podcast theme gig", event: "posted", detail: "remote · paid" },
];

const MUSICIANS = [
  { id: "1", name: "Maya Chen", role: "Guitar · Vocals", school: "UT Austin", available: true, bio: "Indie, folk, film. Evenings free." },
  { id: "2", name: "Jordan Lee", role: "Cello · Classical", school: "USC", available: true, bio: "Film scoring, chamber work. Weekends open." },
  { id: "3", name: "Sam Park", role: "Piano · Producer", school: "Berklee", available: false, bio: "Jazz, pop, hip-hop production." },
];

const STATS = [
  { value: 142, label: "musicians" },
  { value: 24, label: "open gigs" },
  { value: 12, label: "universities" },
];

// ── Animated stat ─────────────────────────────────────────────────────────────

function AnimatedStat({ value, label, reduced }: { value: number; label: string; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!isInView || reduced) return;
    const ctrl = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [isInView, value, reduced]);

  return (
    <div ref={ref} className="text-center px-8">
      <span
        className="block font-bold leading-none"
        style={{ fontSize: "clamp(48px,5vw,72px)", color: "#FF5F1F", fontFamily: "'Syne', sans-serif" }}
      >
        {display}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] mt-2 block" style={{ color: "#A89070" }}>
        {label}
      </span>
    </div>
  );
}

// ── EQ bar bullet ─────────────────────────────────────────────────────────────

function EQBar() {
  return (
    <span className="inline-flex items-end gap-px mr-3 shrink-0" aria-hidden>
      <span className="w-[2px] rounded-full bg-[#FF5F1F]" style={{ height: 14 }} />
      <span className="w-[2px] rounded-full bg-[#FF5F1F]" style={{ height: 22 }} />
      <span className="w-[2px] rounded-full bg-[#FF5F1F]" style={{ height: 10 }} />
    </span>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────

function Marquee({ reduced }: { reduced: boolean }) {
  const controls = useAnimation();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced) return;
    controls.start({ x: ["0%", "-50%"], transition: { duration: 35, repeat: Infinity, ease: "linear" } });
  }, [controls, reduced]);

  const handleHoverStart = () => {
    if (reduced) return;
    controls.stop();
    setPaused(true);
  };

  const handleHoverEnd = () => {
    if (reduced) return;
    controls.start({ x: ["0%", "-50%"], transition: { duration: 35, repeat: Infinity, ease: "linear" } });
    setPaused(false);
  };

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  const displayItems = reduced ? MARQUEE_ITEMS.slice(0, 4) : items;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ background: "#FF5F1F", height: "clamp(100px,14vw,200px)" }}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      <div className="flex h-full items-center">
        <motion.div
          animate={controls}
          className={`flex items-center gap-0 whitespace-nowrap ${reduced ? "flex-wrap px-8 gap-6 justify-center" : ""}`}
        >
          {displayItems.map((item, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="italic font-bold"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(56px,10vw,140px)",
                  color: "#FFF9F0",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {item.name}
              </span>
              <span
                className="mx-4 font-bold not-italic"
                style={{ fontSize: "clamp(14px,1.5vw,18px)", color: "rgba(255,249,240,0.6)" }}
              >
                {item.event === "joined" ? "joined" : "posted"} · {item.detail}
              </span>
              <span
                className="mx-4"
                style={{ fontSize: "clamp(24px,3vw,48px)", color: "#FFF9F0", opacity: 0.5 }}
              >
                ★
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Paused pill */}
      <AnimatePresence>
        {paused && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(255,249,240,0.15)", color: "#FFF9F0", border: "1px solid rgba(255,249,240,0.3)" }}
          >
            paused
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Musician card ─────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotate: -1.5 },
  visible: { opacity: 1, y: 0, rotate: 0 },
};

function MusicianCard({ musician }: { musician: typeof MUSICIANS[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      whileHover={{ y: -8, boxShadow: "0 16px 48px rgba(255,95,31,0.20)" }}
      className="bg-white rounded-xl p-6 cursor-pointer flex flex-col"
      style={{
        borderTop: "3px solid #FF5F1F",
        boxShadow: "0 4px 20px rgba(255,95,31,0.10)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: musician.available ? "#15803D" : "#A89070" }}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "#A89070" }}>
          {musician.available ? "Available" : "Not looking"}
        </span>
      </div>

      <p className="font-bold text-[20px] leading-tight" style={{ color: "#1A1207", fontFamily: "'Syne', sans-serif" }}>
        {musician.name}
      </p>
      <p className="text-[14px] mt-1" style={{ color: "#6B5B3E" }}>{musician.role}</p>
      <p className="text-[13px]" style={{ color: "#A89070" }}>{musician.school}</p>
      <p className="text-[14px] mt-3 leading-relaxed flex-1" style={{ color: "#6B5B3E" }}>{musician.bio}</p>

      <motion.div
        className="mt-5 inline-flex items-center gap-1 font-bold text-[14px]"
        style={{ color: "#FF5F1F" }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        View profile →
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};


export function Landing() {
  const reduced = useReducedMotion() ?? false;
  const cardsRef = useRef<HTMLDivElement>(null);
  const isCardsInView = useInView(cardsRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(26,18,7,0.10)" }}>
        <span className="font-bold text-[18px] tracking-[0.06em]" style={{ fontFamily: "'Syne', sans-serif", color: "#1A1207" }}>
          GIGFORGE
        </span>
        <a href="#" className="text-[14px] transition-colors" style={{ color: "#6B5B3E" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FF5F1F")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6B5B3E")}
        >
          Sign in →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        {/* Three.js waveform */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <WaveformMesh reduced={reduced} />
        </div>

        {/* Hero content */}
        <div className="relative px-8 pt-10 pb-16 max-w-5xl" style={{ zIndex: 1 }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-6" style={{ color: "#A89070" }}>
              Live · 12 Campuses · Right Now
            </p>
            <h1
              className="font-bold leading-none tracking-[-0.03em]"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(52px, 7.5vw, 104px)",
                color: "#1A1207",
              }}
            >
              The place where<br />
              student musicians<br />
              get found.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed max-w-lg" style={{ color: "#6B5B3E" }}>
              Browse 142 musicians. Post a gig. Direct email contact. No account needed.
            </p>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.03, boxShadow: "0 12px 32px rgba(255,95,31,0.45)" }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="inline-flex items-center justify-center font-bold text-[15px] rounded-lg cursor-pointer"
              style={{
                height: 52,
                padding: "0 28px",
                background: "#FF5F1F",
                color: "#FFF9F0",
                boxShadow: "0 8px 24px rgba(255,95,31,0.35)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Browse musicians
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ background: "rgba(255,95,31,0.08)" }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center justify-center font-bold text-[15px] rounded-lg cursor-pointer"
              style={{
                height: 52,
                padding: "0 28px",
                border: "2px solid #FF5F1F",
                color: "#FF5F1F",
                background: "transparent",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Post a gig
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee reduced={reduced} />

      {/* ── MUSICIAN CARDS ── */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-8" style={{ color: "#A89070" }}>
          On the network now
        </p>
        <motion.div
          ref={cardsRef}
          variants={containerVariants}
          initial="hidden"
          animate={isCardsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {MUSICIANS.map((m) => (
            <MusicianCard key={m.id} musician={m} />
          ))}
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#FFF9F0", borderTop: "1px solid rgba(26,18,7,0.08)", borderBottom: "1px solid rgba(26,18,7,0.08)" }}>
        <div className="max-w-3xl mx-auto py-14 flex flex-wrap justify-around gap-8 divide-x divide-[rgba(26,18,7,0.08)]">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} reduced={reduced} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 py-16 max-w-2xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-10" style={{ color: "#A89070" }}>
          How it works
        </p>
        <div className="flex flex-col gap-8">
          {[
            { text: "Browse the directory.", sub: "No account. Just look." },
            { text: "Find who you need.", sub: "Filter, skim, email." },
            { text: "Hire them, or don't.", sub: "That's the whole thing." },
          ].map(({ text, sub }, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 240, damping: 22 }}
              className="flex items-start gap-4"
            >
              <EQBar />
              <div>
                <p className="font-bold text-[17px]" style={{ color: "#1A1207", fontFamily: "'Syne', sans-serif" }}>
                  {text}
                </p>
                <p className="text-[14px] mt-1" style={{ color: "#6B5B3E" }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-8" style={{ borderTop: "1px solid rgba(26,18,7,0.08)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold tracking-[0.06em]" style={{ fontFamily: "'Syne', sans-serif", color: "#1A1207" }}>
            GIGFORGE
          </span>
          <div className="flex items-center gap-6 text-[13px]" style={{ color: "#A89070" }}>
            <a href="#" style={{ color: "#A89070" }} onMouseEnter={e => (e.currentTarget.style.color = "#FF5F1F")} onMouseLeave={e => (e.currentTarget.style.color = "#A89070")}>About</a>
            <a href="#" style={{ color: "#A89070" }} onMouseEnter={e => (e.currentTarget.style.color = "#FF5F1F")} onMouseLeave={e => (e.currentTarget.style.color = "#A89070")}>Privacy</a>
            <a href="#" style={{ color: "#A89070" }} onMouseEnter={e => (e.currentTarget.style.color = "#FF5F1F")} onMouseLeave={e => (e.currentTarget.style.color = "#A89070")}>Post a gig</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
