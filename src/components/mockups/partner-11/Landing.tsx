"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
  animate,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const BulletinBoard = dynamic(
  () => import("./BulletinBoard").then((m) => m.BulletinBoard),
  { ssr: false }
);

// ── Color identity ────────────────────────────────────────────────────────────

const PALETTE = [
  { bg: "#FEE2E2", ink: "#991B1B" },
  { bg: "#DCFCE7", ink: "#166534" },
  { bg: "#DBEAFE", ink: "#1E40AF" },
  { bg: "#FEF9C3", ink: "#854D0E" },
  { bg: "#EDE9FE", ink: "#5B21B6" },
  { bg: "#FFEDD5", ink: "#9A3412" },
];

function colorOf(id: string) {
  const n = id.charCodeAt(0) % PALETTE.length;
  return PALETTE[n];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const MUSICIANS = [
  { id: "a", name: "Maya Chen",    role: "Guitar · Vocals",     school: "UT Austin",  avail: true,  bio: "Indie, folk, film. Evenings and weekends.", tags: ["guitar","vocals","indie"] },
  { id: "b", name: "Jordan Lee",   role: "Cello · Film Scoring",school: "USC",         avail: true,  bio: "Classical and contemporary narrative work.", tags: ["cello","classical","film"] },
  { id: "c", name: "Sam Park",     role: "Piano · Producer",    school: "Berklee",     avail: false, bio: "Jazz, hip-hop, genre-blending. Studio-ready.", tags: ["piano","producer","jazz"] },
  { id: "d", name: "Priya Kapoor", role: "Violin · Orchestral", school: "UCLA",        avail: true,  bio: "Chamber, orchestral, and hybrid scoring.", tags: ["violin","orchestral"] },
  { id: "e", name: "Alex Rivera",  role: "Drums · Percussion",  school: "NYU",         avail: true,  bio: "Session drumming and live performance.", tags: ["drums","percussion","session"] },
];

const GIGS = [
  { id: "g1", role: "Composer",  title: "Thesis Short Film",    org: "UT Austin", pay: "PAID",        deadline: "Jun 1" },
  { id: "g2", role: "Guitarist", title: "Indie EP Recording",   org: "Remote",    pay: "UNPAID",      deadline: "Flexible" },
  { id: "g3", role: "Vocalist",  title: "Podcast Intro Theme",  org: "Remote",    pay: "NEGOTIABLE",  deadline: "ASAP" },
];

const STATS = [
  { value: 142, label: "musicians" },
  { value: 24,  label: "open gigs" },
  { value: 12,  label: "universities" },
];

// ── Animated stat ─────────────────────────────────────────────────────────────

function AnimStat({ value, label, reduced }: { value: number; label: string; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const ctrl = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v: number) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, value, reduced]);

  return (
    <div ref={ref} className="text-center">
      <span
        className="block font-bold leading-none"
        style={{ fontSize: "clamp(44px,5vw,64px)", color: "#1A1A18" }}
      >
        {display}
      </span>
      <span
        className="font-mono text-[11px] uppercase tracking-[0.16em] mt-2 block"
        style={{ color: "#9B9B8E" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Musician profile card ─────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.94, rotate: -1.5 },
  visible: { opacity: 1, y: 0, scale: 1, rotate: 0 },
};

function MusicianCard({
  musician,
  onExpand,
}: {
  musician: typeof MUSICIANS[0];
  onExpand: (id: string) => void;
}) {
  const { bg, ink } = colorOf(musician.id);

  return (
    <motion.div
      layoutId={`card-${musician.id}`}
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      whileHover={{ y: -8, scale: 1.02, rotate: 1 }}
      onClick={() => onExpand(musician.id)}
      className="cursor-pointer rounded-2xl p-6 flex flex-col"
      style={{
        background: bg,
        boxShadow: `0 4px 20px ${ink}18`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: musician.avail ? "#16A34A" : "#9B9B8E" }}
        />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ color: ink, opacity: 0.6 }}
        >
          {musician.avail ? "Available" : "Not looking"}
        </span>
      </div>

      <p
        className="font-bold text-[18px] leading-snug"
        style={{ color: ink }}
      >
        {musician.name}
      </p>
      <p className="text-[13px] mt-0.5" style={{ color: ink, opacity: 0.75 }}>
        {musician.role}
      </p>
      <p className="text-[12px] mt-0.5" style={{ color: ink, opacity: 0.5 }}>
        {musician.school}
      </p>
      <p className="text-[13px] mt-3 leading-relaxed flex-1" style={{ color: ink, opacity: 0.8 }}>
        {musician.bio}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {musician.tags.map((t) => (
          <span
            key={t}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.45)", color: ink }}
          >
            {t}
          </span>
        ))}
      </div>

      <motion.span
        className="mt-4 text-[13px] font-semibold"
        style={{ color: ink }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        View profile →
      </motion.span>
    </motion.div>
  );
}

// ── Expanded card overlay ─────────────────────────────────────────────────────

function ExpandedCard({
  musician,
  onClose,
}: {
  musician: typeof MUSICIANS[0];
  onClose: () => void;
}) {
  const { bg, ink } = colorOf(musician.id);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 cursor-pointer"
        style={{ background: "rgba(26,26,24,0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* Card */}
      <motion.div
        layoutId={`card-${musician.id}`}
        className="fixed inset-0 z-50 m-auto rounded-3xl p-10 flex flex-col"
        style={{
          background: bg,
          maxWidth: 520,
          maxHeight: "80vh",
          boxShadow: `0 32px 80px ${ink}30`,
          overflowY: "auto",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >
        <button
          onClick={onClose}
          className="self-end mb-6 font-mono text-[11px] uppercase tracking-widest cursor-pointer"
          style={{ background: "none", border: "none", color: ink, opacity: 0.5 }}
        >
          ✕ Close
        </button>

        <div className="flex items-center gap-2 mb-5">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: musician.avail ? "#16A34A" : "#9B9B8E",
              boxShadow: musician.avail ? "0 0 0 4px rgba(22,163,74,0.2)" : "none",
            }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: ink, opacity: 0.6 }}>
            {musician.avail ? "Open to Collaborate" : "Not Currently Looking"}
          </span>
        </div>

        <p className="font-bold text-[36px] leading-none" style={{ color: ink }}>
          {musician.name}
        </p>
        <p className="text-[16px] mt-2 font-medium" style={{ color: ink, opacity: 0.8 }}>
          {musician.role}
        </p>
        <p className="text-[14px] mt-1" style={{ color: ink, opacity: 0.55 }}>
          {musician.school}
        </p>
        <p className="text-[15px] mt-5 leading-relaxed" style={{ color: ink, opacity: 0.85 }}>
          {musician.bio}
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {musician.tags.map((t) => (
            <span
              key={t}
              className="text-[12px] font-medium px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.5)", color: ink }}
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href="#"
          className="mt-8 inline-flex items-center justify-center font-bold text-[15px] rounded-full self-start cursor-pointer"
          style={{
            padding: "10px 24px",
            background: ink,
            color: bg,
          }}
        >
          Contact via email →
        </a>
      </motion.div>
    </>
  );
}

// ── Gig card ──────────────────────────────────────────────────────────────────

function GigCard({ gig, index }: { gig: typeof GIGS[0]; index: number }) {
  const { bg, ink } = colorOf(gig.id);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 220, damping: 22 }}
      whileHover={{ y: -6 }}
      className="rounded-2xl p-6 flex flex-col"
      style={{ background: bg, boxShadow: `0 4px 20px ${ink}14` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: ink, opacity: 0.55 }}>
          Gig
        </span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.5)", color: ink }}
        >
          {gig.pay}
        </span>
      </div>
      <p className="font-bold text-[11px] uppercase tracking-[0.12em] mb-1" style={{ color: ink, opacity: 0.7 }}>
        {gig.role}
      </p>
      <p className="font-bold text-[17px] leading-snug" style={{ color: ink }}>
        {gig.title}
      </p>
      <p className="text-[13px] mt-1" style={{ color: ink, opacity: 0.65 }}>
        {gig.org} · {gig.deadline}
      </p>
      <motion.a
        href="#"
        className="mt-5 text-[13px] font-semibold"
        style={{ color: ink }}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Apply via email →
      </motion.a>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export function Landing() {
  const reduced = useReducedMotion() ?? false;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  // Variable font weight: 600 → 900 as user scrolls 0–400px
  const fontWeight = useTransform(scrollY, [0, 400], [600, 900]);

  const expandedMusician = MUSICIANS.find((m) => m.id === expandedId) ?? null;

  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-60px" });

  return (
    <div
      ref={pageRef}
      className="min-h-screen"
      style={{ background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,400&display=swap');
      `}</style>

      {/* ── NAV ── */}
      <nav
        className="flex items-center justify-between px-8 py-5 relative z-20"
        style={{ borderBottom: "1px solid rgba(26,26,24,0.08)" }}
      >
        <span
          className="font-bold text-[18px] tracking-[0.04em]"
          style={{ color: "#1A1A18" }}
        >
          GIGFORGE
        </span>
        <a
          href="#"
          className="text-[14px] transition-colors"
          style={{ color: "#9B9B8E" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9B8E")}
        >
          Sign in →
        </a>
      </nav>

      {/* ── BULLETIN BOARD HERO ── */}
      <section className="relative" style={{ height: "55vh", minHeight: 360 }}>
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <BulletinBoard reduced={reduced} />
        </div>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-5 left-8 font-mono text-[10px] uppercase tracking-[0.18em] z-10"
          style={{ color: "rgba(155,155,142,0.7)" }}
        >
          142 musicians · hover to explore
        </motion.p>
      </section>

      {/* ── HEADLINE + CTAs ── */}
      <section className="px-8 py-14 max-w-3xl mx-auto text-center">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5"
          style={{ color: "#9B9B8E" }}
        >
          A directory where every student musician has a voice.
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(44px, 6.5vw, 88px)",
            fontVariationSettings: reduced ? '"wght" 700' : `"wght" ${fontWeight}`,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            color: "#1A1A18",
          }}
        >
          Browse free.
          <br />
          Email directly.
          <br />
          No middleman.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
          className="mt-6 text-[16px] leading-relaxed"
          style={{ color: "#5C5C55" }}
        >
          Student musicians. Student creators. One place to find each other.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5, ease: "easeOut" }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.03, boxShadow: "0 12px 32px rgba(37,99,235,0.28)" }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="inline-flex items-center justify-center font-bold text-[15px] rounded-xl text-white cursor-pointer"
            style={{
              height: 52,
              padding: "0 28px",
              background: "#2563EB",
              boxShadow: "0 6px 20px rgba(37,99,235,0.22)",
            }}
          >
            Browse musicians
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ background: "rgba(37,99,235,0.06)" }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center justify-center font-semibold text-[15px] rounded-xl cursor-pointer"
            style={{
              height: 52,
              padding: "0 28px",
              border: "1.5px solid #2563EB",
              color: "#2563EB",
              background: "transparent",
            }}
          >
            Post a gig
          </motion.a>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: "1px solid rgba(26,26,24,0.07)", borderBottom: "1px solid rgba(26,26,24,0.07)" }}>
        <div className="max-w-3xl mx-auto px-8 py-12 grid grid-cols-3 divide-x divide-[rgba(26,26,24,0.07)]">
          {STATS.map((s) => (
            <AnimStat key={s.label} value={s.value} label={s.label} reduced={reduced} />
          ))}
        </div>
      </section>

      {/* ── MUSICIAN GRID ── */}
      <section className="px-8 py-16 max-w-6xl mx-auto">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-8"
          style={{ color: "#9B9B8E" }}
        >
          On the network
        </p>
        <motion.div
          ref={gridRef}
          variants={gridContainer}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {MUSICIANS.map((m) => (
            <MusicianCard key={m.id} musician={m} onExpand={setExpandedId} />
          ))}

          {/* "See all" tile */}
          <motion.a
            href="#"
            variants={cardVariants}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer"
            style={{
              background: "#F2F1EE",
              border: "1.5px dashed rgba(26,26,24,0.15)",
              minHeight: 180,
            }}
          >
            <span className="text-[28px] mb-2" aria-hidden>+</span>
            <span className="font-semibold text-[15px]" style={{ color: "#1A1A18" }}>
              137 more musicians
            </span>
            <span className="text-[13px] mt-1" style={{ color: "#9B9B8E" }}>
              Browse the full directory →
            </span>
          </motion.a>
        </motion.div>
      </section>

      {/* ── GIGS ── */}
      <section className="px-8 py-14 max-w-6xl mx-auto">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-8"
          style={{ color: "#9B9B8E" }}
        >
          Open Gigs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {GIGS.map((g, i) => (
            <GigCard key={g.id} gig={g} index={i} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 py-14 max-w-xl mx-auto">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-8"
          style={{ color: "#9B9B8E" }}
        >
          How it works
        </p>
        <div className="flex flex-col gap-0">
          {[
            { color: PALETTE[0], text: "Browse the directory.", sub: "No account. Fully open." },
            { color: PALETTE[1], text: "Find who you need.", sub: "Filter, browse, explore." },
            { color: PALETTE[2], text: "Email them directly.", sub: "No DMs. No platform fee." },
          ].map(({ color, text, sub }, i) => (
            <motion.div
              key={text}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 240, damping: 22 }}
              className="flex items-start gap-4 py-5"
              style={{ borderBottom: "1px solid rgba(26,26,24,0.07)" }}
            >
              <span
                className="w-5 h-5 rounded-sm shrink-0 mt-0.5"
                style={{ background: color.bg, border: `1.5px solid ${color.ink}30` }}
              />
              <div>
                <p className="font-semibold text-[16px]" style={{ color: "#1A1A18" }}>{text}</p>
                <p className="text-[13px] mt-1" style={{ color: "#5C5C55" }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-8" style={{ borderTop: "1px solid rgba(26,26,24,0.08)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold tracking-[0.04em]" style={{ color: "#1A1A18" }}>
            GIGFORGE
          </span>
          <div className="flex gap-6 text-[13px]">
            {["About", "Privacy", "Post a gig"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ color: "#9B9B8E" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9B8E")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── EXPANDED CARD OVERLAY ── */}
      <AnimatePresence>
        {expandedMusician && (
          <ExpandedCard musician={expandedMusician} onClose={() => setExpandedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
