"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const rows = [
  ["Project", "Short film score", "OPEN"],
  ["Needs", "Cello, ambient synth", "3 matches"],
  ["Deadline", "Apr 18", "Direct email"],
  ["Campus", "UT Austin", "Verified"],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#EEF1F5] text-[#101827]">
      <Ticker />
      <section className="mx-auto min-h-[calc(100vh-85px)] max-w-[1280px] px-5 py-8 sm:px-8">
        <nav className="flex items-center justify-between border-b border-[#D5DEE8] pb-4">
          <span className="text-lg font-bold">GigForge</span>
          <Link href="/signin" className="rounded-[6px] border border-[#C7D2E0] bg-white px-4 py-2 text-sm font-semibold hover:border-[#2563EB] hover:bg-[#EFF6FF]">Sign in</Link>
        </nav>
        <div className="grid gap-12 pt-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8794A6]">Built for student projects / Spring semester</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-7xl">
              A calmer way to find collaborators before the deadline.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-[#4D5B6C]">
              Structured profiles. Direct email contact. No chaos. Studio Ledger makes GigForge feel like the workbench for serious student projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/gigs" className="rounded-[6px] bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:shadow-[0_8px_24px_rgba(37,99,235,0.22)]">Browse gigs</Link>
              <Link href="/profile/create" className="rounded-[6px] border border-[#C7D2E0] bg-white px-6 py-3 text-sm font-semibold hover:border-[#2563EB] hover:bg-[#EFF6FF]">Create profile</Link>
            </div>
            <Stats />
          </div>
          <Ledger />
        </div>
      </section>
      <FeatureGrid />
    </main>
  );
}

function Ticker() {
  return (
    <div className="overflow-hidden border-y border-[#D5DEE8] bg-white py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#4D5B6C]">
      <motion.div className="flex w-max gap-8 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
        {[...Array(2)].map((_, i) => (
          <span key={i}>OPEN: 24 gigs / ACTIVE: 142 musicians / NEW: 3 profiles today / DIRECT EMAIL ONLY /</span>
        ))}
      </motion.div>
    </div>
  );
}

function Ledger() {
  return (
    <motion.div className="relative mx-auto w-full max-w-2xl rounded-[10px] border border-[#C7D2E0] bg-white/75 p-5 shadow-[0_24px_70px_rgba(37,55,88,0.18)] backdrop-blur" initial={{ opacity: 0, rotateY: -8, y: 20 }} animate={{ opacity: 1, rotateY: -3, y: 0 }} whileHover={{ rotateY: 3, rotateX: 2 }}>
      <div className="absolute -inset-3 -z-10 rounded-[14px] border border-[#C7D2E0]/60" />
      <div className="flex items-center justify-between border-b border-[#D5DEE8] pb-4">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#8794A6]">GigForge Ledger</span>
        <span className="rounded-full bg-[#E7F8EF] px-3 py-1 text-xs font-bold text-[#128A5A]">LIVE</span>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map(([field, value, status], index) => (
          <motion.div key={field} className="grid grid-cols-[100px_1fr_auto] items-center gap-3 rounded-[6px] border border-[#D5DEE8] bg-[#F8FAFC] p-4 text-sm" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
            <span className="font-mono text-xs uppercase text-[#8794A6]">{field}</span>
            <span className="font-semibold">{value}</span>
            <span className={status === "OPEN" ? "font-bold text-[#128A5A]" : "text-[#4D5B6C]"}>{status}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Stats() {
  return (
    <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
      {[
        ["142", "musicians", "LIVE"],
        ["24", "open gigs", "OPEN"],
        ["12", "universities", "LOCAL"],
      ].map(([n, label, pill]) => (
        <div key={label} className="border border-[#D5DEE8] bg-white p-4">
          <div className="text-4xl font-extrabold">{n}</div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[#8794A6]">{label}</div>
          <div className="mt-3 inline-flex rounded-full bg-[#E7F8EF] px-2 py-1 text-[10px] font-bold text-[#128A5A]">{pill}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureGrid() {
  const features = [
    ["01", "Filter people", "Search by instrument, genre, campus, and availability. No account needed to browse."],
    ["02", "Post briefs", "Describe the project clearly. Set a deadline. List what the music needs to do."],
    ["03", "Contact directly", "Email is on every profile. No platform DM. No matching fee."],
  ];
  return (
    <section className="mx-auto grid max-w-[1280px] gap-0 px-5 pb-20 sm:px-8 md:grid-cols-3">
      {features.map(([n, title, body]) => (
        <motion.article key={n} className="border-t border-[#D5DEE8] bg-white/50 p-6 md:border-l md:first:border-l-0" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="font-mono text-sm text-[#8794A6]">{n}</span>
          <h2 className="mt-4 text-xl font-bold">{title}</h2>
          <p className="mt-3 leading-7 text-[#4D5B6C]">{body}</p>
        </motion.article>
      ))}
    </section>
  );
}
