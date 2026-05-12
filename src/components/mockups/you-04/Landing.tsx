"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CARDS = [
  ["Composer for senior film", "OPEN / Apr 18", "bg-[#FFFDF6]"],
  ["Bassist for launch party", "LIVE SET / Friday", "bg-[#FFE176]"],
  ["Singer for podcast theme", "REMOTE / Paid", "bg-[#CFF08A]"],
  ["Violin for game trailer", "SCORE / 2 weeks", "bg-[#A7D8FF]"],
  ["Pianist for recital", "CAMPUS / Weekend", "bg-[#FFFDF6]"],
  ["Producer for short doc", "MIX / Remote", "bg-[#FFE176]"],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#FFF3DE] text-[#17120B]">
      <section className="relative overflow-hidden px-5 py-10 sm:px-8">
        <div className="absolute inset-x-0 top-[56%] h-24 -rotate-2 bg-[#FF5A3D]" />
        <div className="absolute inset-x-0 bottom-20 h-24 rotate-1 bg-[#57C7FF]" />
        <div className="relative mx-auto max-w-[1280px]">
          <CorkBoard />
          <div className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="border-4 border-[#17120B] bg-[#FFF3DE] p-6 shadow-[12px_12px_0_#17120B] sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.2em]">GigForge campus board</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] sm:text-7xl lg:text-[104px]">
                Projects need sound. Students need gigs.
              </h1>
              <p className="mt-7 max-w-2xl text-[17px] font-medium leading-[1.55] text-[#59422B]">
                A digital flyer wall for finding student musicians, listing creative gigs, and jumping straight to contact.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/gigs/create" className="border-[3px] border-[#17120B] bg-[#FFE176] px-6 py-4 text-sm font-black uppercase transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#17120B]">Post the gig</Link>
                <Link href="/musicians" className="border-[3px] border-[#17120B] bg-white px-6 py-4 text-sm font-black uppercase transition hover:bg-[#A7D8FF]">Find talent</Link>
              </div>
            </div>
            <ExpandedCard />
          </div>
        </div>
      </section>
      <Pitch />
    </main>
  );
}

function CorkBoard() {
  return (
    <div className="relative mx-auto min-h-[420px] max-w-5xl border-[14px] border-[#6B4328] bg-[#C89B62] p-6 shadow-[0_28px_60px_rgba(92,61,35,0.18)]">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#9F6F3D_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(([title, meta, bg], index) => (
          <motion.article
            key={title}
            className={`${bg} relative min-h-32 border-4 border-[#17120B] p-4 shadow-[7px_7px_0_rgba(23,18,11,0.7)]`}
            style={{ rotate: `${[-4, 3, -2, 4, -3, 2][index]}deg` }}
            whileHover={{ y: -10, rotateX: -5, zIndex: 5 }}
          >
            <span className="absolute left-1/2 top-[-14px] h-6 w-6 -translate-x-1/2 rounded-full border-2 border-[#17120B] bg-[#D83A24]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B6D4A]">{meta}</p>
            <h2 className="mt-4 text-2xl font-black leading-tight">{title}</h2>
            <p className="mt-3 text-sm font-medium text-[#59422B]">Remote or campus / portfolio links welcome</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function ExpandedCard() {
  return (
    <motion.aside className="border-4 border-[#17120B] bg-[#FFFDF6] p-6 shadow-[10px_10px_0_#17120B]" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D83A24]">Open gig</p>
      <h2 className="mt-4 text-4xl font-black leading-tight">Composer for senior film</h2>
      <dl className="mt-6 grid gap-4 text-sm">
        {[
          ["Needs", "Ambient strings, piano, subtle synth"],
          ["Deadline", "Apr 18"],
          ["Contact", "Email creator directly"],
        ].map(([dt, dd]) => (
          <div key={dt} className="border-t-2 border-[#17120B] pt-3">
            <dt className="font-mono text-[10px] uppercase text-[#8B6D4A]">{dt}</dt>
            <dd className="mt-1 font-bold">{dd}</dd>
          </div>
        ))}
      </dl>
    </motion.aside>
  );
}

function Pitch() {
  const cols = [
    ["01", "Post clearly", "Project type, instruments, deadline, contact email."],
    ["02", "Browse locally", "Musicians list campus, genre, availability, and links."],
    ["03", "Email directly", "No platform DMs. No feed. No matching ritual."],
  ];
  return (
    <section className="mx-auto grid max-w-[1280px] gap-8 px-5 pb-20 sm:px-8 md:grid-cols-3">
      {cols.map(([n, title, body]) => (
        <motion.article key={n} className="border-t-4 border-[#17120B] pt-5" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="font-mono text-sm text-[#8B6D4A]">{n} / {title}</span>
          <h2 className="mt-4 text-2xl font-black">{title}</h2>
          <p className="mt-3 leading-7 text-[#59422B]">{body}</p>
        </motion.article>
      ))}
    </section>
  );
}
