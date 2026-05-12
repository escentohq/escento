"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const StageScene = dynamic(
  () => import("./StageScene").then((m) => m.StageScene),
  { ssr: false }
);

// ── Data ─────────────────────────────────────────────────────────────────────

const MUSICIANS = [
  {
    id: "1",
    name: "Maya Chen",
    role: "Guitar · Vocals",
    school: "UT Austin · Music '25",
    bio: "Indie, folk, and film scoring. Evenings and weekends free.",
    tags: ["guitar", "vocals", "indie", "folk"],
    email: "maya@example.com",
  },
  {
    id: "2",
    name: "Jordan Lee",
    role: "Cello · Film Scoring",
    school: "USC · Music '26",
    bio: "Classical and contemporary. Specialises in short-form narrative work.",
    tags: ["cello", "classical", "film"],
    email: "jordan@example.com",
  },
  {
    id: "3",
    name: "Sam Park",
    role: "Piano · Producer",
    school: "Berklee · Music Production '25",
    bio: "Jazz, hip-hop, and genre-blending. Studio-ready with home setup.",
    tags: ["piano", "producer", "jazz"],
    email: "sam@example.com",
  },
];

const GIGS = [
  {
    id: "g1",
    role: "Composer",
    title: "Thesis Short Film",
    org: "UT Austin",
    pay: "PAID",
    deadline: "Jun 1",
  },
  {
    id: "g2",
    role: "Guitarist",
    title: "Indie EP Recording",
    org: "Remote",
    pay: "UNPAID",
    deadline: "Flexible",
  },
  {
    id: "g3",
    role: "Vocalist",
    title: "Podcast Intro Theme",
    org: "Remote",
    pay: "NEGOTIABLE",
    deadline: "ASAP",
  },
];

// ── Skill tag ─────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-[12px] font-medium"
      style={{ background: "#EDE9FF", color: "#7C3AED" }}
    >
      {label}
    </span>
  );
}

// ── Gig card ──────────────────────────────────────────────────────────────────

function GigCard({ gig }: { gig: typeof GIGS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      whileHover={{ y: -6, boxShadow: "0 12px 36px rgba(217,119,6,0.16)" }}
      className="bg-white rounded-xl p-6 flex flex-col"
      style={{ borderTop: "3px solid #D97706", boxShadow: "0 3px 12px rgba(28,10,60,0.08)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-mono text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "#9D8CB0" }}
        >
          GIG
        </span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: gig.pay === "PAID" ? "#DCFCE7" : "#F5F0FF",
            color: gig.pay === "PAID" ? "#166534" : "#7C3AED",
          }}
        >
          {gig.pay}
        </span>
      </div>
      <p
        className="font-bold text-[11px] uppercase tracking-[0.14em] mb-1"
        style={{ color: "#D97706" }}
      >
        {gig.role}
      </p>
      <p className="font-semibold text-[17px] leading-snug" style={{ color: "#1C0A3C" }}>
        {gig.title}
      </p>
      <p className="text-[13px] mt-1" style={{ color: "#4B3B6B" }}>
        {gig.org} · Deadline: {gig.deadline}
      </p>
      <motion.a
        href="#"
        className="mt-5 text-[13px] font-semibold inline-flex items-center gap-1"
        style={{ color: "#7C3AED" }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Apply via email →
      </motion.a>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Landing() {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const bgColor = useTransform(scrollYProgress, [0, 0.28], ["#F5F0FF", "#FFFBF0"]);

  const current = MUSICIANS[index];
  const total = MUSICIANS.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <motion.div
      ref={pageRef}
      style={{ backgroundColor: reduced ? "#F5F0FF" : bgColor, fontFamily: "'Outfit', sans-serif" }}
      className="min-h-screen"
    >
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600;1,700&family=Outfit:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ── NAV ── */}
      <nav
        className="flex items-center justify-between px-8 py-5 relative z-20"
        style={{ borderBottom: "1px solid rgba(28,10,60,0.10)" }}
      >
        <span
          className="font-bold text-[18px] tracking-[0.06em]"
          style={{ color: "#1C0A3C", fontFamily: "'Outfit', sans-serif" }}
        >
          GIGFORGE
        </span>
        <a
          href="#"
          className="text-[14px] transition-colors"
          style={{ color: "#9D8CB0" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D97706")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9D8CB0")}
        >
          Sign in →
        </a>
      </nav>

      {/* ── STAGE HERO ── */}
      <section className="relative" style={{ height: "54vh", minHeight: 380 }}>
        {/* Three.js stage */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <StageScene musician={current} reduced={reduced} />
        </div>

        {/* Annotation bottom-left */}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-5 left-8 font-mono text-[10px] uppercase tracking-[0.18em] z-10"
          style={{ color: "rgba(157,140,176,0.7)" }}
        >
          Fig. 01 — Stage View · {index + 1}/{total}
        </motion.p>
      </section>

      {/* ── PROFILE CARD SECTION ── */}
      <section className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        {/* Card cycling */}
        <div className="relative" style={{ minHeight: 260 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="bg-white rounded-2xl p-8"
              style={{
                boxShadow: "0 8px 40px rgba(28,10,60,0.12)",
                border: "1px solid rgba(124,58,237,0.12)",
              }}
            >
              {/* Status */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#16A34A", boxShadow: "0 0 0 3px rgba(22,163,74,0.2)" }}
                />
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: "#9D8CB0" }}
                >
                  Open to Collaborate
                </span>
              </div>

              {/* Name */}
              <h2
                className="italic font-bold leading-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(40px, 5.5vw, 68px)",
                  color: "#1C0A3C",
                  letterSpacing: "-0.01em",
                }}
              >
                {current.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <p className="text-[15px] font-medium" style={{ color: "#4B3B6B" }}>
                  {current.role}
                </p>
                <span style={{ color: "#9D8CB0" }}>·</span>
                <p className="text-[14px]" style={{ color: "#9D8CB0" }}>
                  {current.school}
                </p>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#4B3B6B" }}>
                {current.bio}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {current.tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>

              {/* Divider + contact */}
              <div
                className="mt-6 pt-5 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(28,10,60,0.08)" }}
              >
                <span className="text-[13px]" style={{ color: "#9D8CB0" }}>
                  {current.email}
                </span>
                <motion.a
                  href={`mailto:${current.email}`}
                  className="inline-flex items-center justify-center text-[14px] font-semibold rounded-full cursor-pointer"
                  style={{
                    padding: "8px 20px",
                    border: "1.5px solid #7C3AED",
                    color: "#7C3AED",
                    background: "transparent",
                  }}
                  whileHover={{ background: "rgba(124,58,237,0.08)", borderColor: "#8B5CF6" }}
                  transition={{ duration: 0.15 }}
                >
                  Contact →
                </motion.a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <motion.button
            onClick={prev}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-[22px] cursor-pointer"
            style={{ color: "#D97706", background: "none", border: "none" }}
          >
            ←
          </motion.button>
          <span
            className="font-mono text-[12px] tracking-widest"
            style={{ color: "#9D8CB0" }}
          >
            {index + 1} / {total}
          </span>
          <motion.button
            onClick={next}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-[22px] cursor-pointer"
            style={{ color: "#D97706", background: "none", border: "none" }}
          >
            →
          </motion.button>
        </div>

        {/* Subhead + CTAs */}
        <div className="mt-10 text-center">
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="italic font-semibold leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              color: "#1C0A3C",
            }}
          >
            Find the musician your project needs.
          </motion.h1>
          <p className="mt-3 text-[15px]" style={{ color: "#4B3B6B" }}>
            A directory for student creators. Browse free. Email directly.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.03, boxShadow: "0 12px 32px rgba(217,119,6,0.35)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center font-bold text-[15px] rounded-lg cursor-pointer text-white"
              style={{
                height: 52,
                padding: "0 28px",
                background: "#D97706",
                boxShadow: "0 6px 20px rgba(217,119,6,0.28)",
              }}
            >
              Browse musicians
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ background: "rgba(124,58,237,0.08)" }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center justify-center font-semibold text-[15px] rounded-lg cursor-pointer"
              style={{
                height: 52,
                padding: "0 28px",
                border: "1.5px solid #7C3AED",
                color: "#7C3AED",
                background: "transparent",
              }}
            >
              Post a gig
            </motion.a>
          </div>
        </div>
      </section>

      {/* ── GIG CARDS (LOBBY) ── */}
      <section className="px-8 py-14 max-w-5xl mx-auto">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-8"
          style={{ color: "#9D8CB0" }}
        >
          Open Gigs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {GIGS.map((g, i) => (
            <motion.div
              key={g.id}
              initial={reduced ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 220, damping: 22 }}
            >
              <GigCard gig={g} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 py-14 max-w-xl mx-auto">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-10"
          style={{ color: "#9D8CB0" }}
        >
          How it works
        </p>
        <div
          className="flex flex-col"
          style={{ gap: 0, borderTop: "1px solid rgba(217,119,6,0.15)" }}
        >
          {[
            { n: "i.", text: "Browse the directory.", sub: "No account. Any device." },
            { n: "ii.", text: "Find who you need.", sub: "Filter by instrument, genre, school." },
            { n: "iii.", text: "Email them directly.", sub: "No DMs. No platform. Just email." },
          ].map(({ n, text, sub }, i) => (
            <motion.div
              key={n}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 240, damping: 22 }}
              className="flex items-start gap-5 py-6"
              style={{ borderBottom: "1px solid rgba(217,119,6,0.15)" }}
            >
              <span
                className="italic shrink-0 mt-0.5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#D97706",
                  width: 32,
                  textAlign: "right",
                }}
              >
                {n}
              </span>
              <div>
                <p className="font-semibold text-[16px]" style={{ color: "#1C0A3C" }}>
                  {text}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#4B3B6B" }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-8 py-8"
        style={{ borderTop: "1px solid rgba(28,10,60,0.08)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold tracking-[0.06em] text-[16px]" style={{ color: "#1C0A3C" }}>
            GIGFORGE
          </span>
          <div className="flex items-center gap-6 text-[13px]">
            {["About", "Privacy", "Post a gig"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ color: "#9D8CB0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D97706")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9D8CB0")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
