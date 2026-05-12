"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const orbs = [
  ["Maya / guitar", "bg-[#BEE8C7]", "left-[8%] top-[18%] h-24 w-24"],
  ["Jordan / cello", "bg-[#BFDDF8]", "left-[42%] top-[10%] h-20 w-20"],
  ["Theo / score", "bg-[#FFD8C5]", "left-[65%] top-[30%] h-28 w-28"],
  ["Nina / violin", "bg-[#D9D2FF]", "left-[24%] top-[54%] h-28 w-28"],
  ["Sam / beats", "bg-[#BEE8C7]", "left-[58%] top-[62%] h-20 w-20"],
  ["Priya / voice", "bg-[#BFDDF8]", "left-[78%] top-[8%] h-16 w-16"],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#24313D]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-[1280px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <OrbField />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D9F0E3] px-4 py-2 text-sm font-bold text-[#176346]">
            + Built for students helping students
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.03] tracking-[-0.035em] sm:text-7xl">
            Make campus collaboration feel less awkward.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.65] text-[#60707E]">
            A softer GigForge direction for lowering the emotional cost of first contact without becoming a social network.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signin" className="rounded-full bg-[#24313D] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#176346]">Get started</Link>
            <Link href="/musicians" className="rounded-full border border-[#B8C6D1] px-7 py-4 text-sm font-bold transition hover:border-[#176346] hover:bg-white">Browse first</Link>
          </div>
          <Conversation />
        </div>
      </section>
      <Trust />
    </main>
  );
}

function OrbField() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[8px] bg-[#EDF5F8]">
      {orbs.map(([label, color, cls], index) => (
        <motion.div key={label} className={`absolute ${cls} ${color} rounded-full shadow-[0_18px_40px_rgba(36,49,61,0.08)]`} animate={{ x: [0, index % 2 ? 18 : -18, 0], y: [0, index % 2 ? -12 : 12, 0] }} transition={{ duration: 7 + index, repeat: Infinity, ease: "easeInOut" }}>
          <span className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-bold text-[#24313D]">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Conversation() {
  return (
    <div className="mt-8 grid gap-4">
      {[
        ["Creator", "I need a warm piano theme for a documentary cut."],
        ["Musician", "I play keys, score shorts, and can meet Thursdays."],
        ["GigForge", "Portfolio link found. Email contact ready."],
      ].map(([label, text], index) => (
        <motion.article key={label} className="rounded-[8px] border border-[#D6E0E8] bg-white p-5 shadow-[0_10px_30px_rgba(36,49,61,0.05)]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} whileHover={{ borderColor: "#176346" }}>
          <div className="text-sm font-bold text-[#176346]">+ {label}</div>
          <p className="mt-3 text-xl font-semibold leading-8">{text}</p>
        </motion.article>
      ))}
    </div>
  );
}

function Trust() {
  return (
    <section className="bg-[#EDF5F8] px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-3">
        {[
          ["Browse without pressure", "Profiles are public, structured, and practical."],
          ["Reach out when ready", "Contact happens through email, not a public feed."],
          ["Keep the project moving", "No DMs to manage, no platform rituals."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-[8px] border border-[#D6E0E8] bg-white p-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 text-[#60707E]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
