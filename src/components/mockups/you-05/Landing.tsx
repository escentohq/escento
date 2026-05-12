"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const musicians = ["Film composer", "Jazz vocalist", "Session drummer", "Cellist", "Beat producer", "Piano accompanist"];

export function Landing() {
  return (
    <main className="min-h-screen bg-white text-[#17202A]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-[1280px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[430px_1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0F766E]">Search-first landing</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-none tracking-[-0.035em] sm:text-7xl">
            Start with who you need.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.65] text-[#5C6670]">
            GigForge turns the landing page into the product: filter student musicians and open gigs before signing in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/musicians" className="rounded-[4px] bg-[#17202A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0F766E]">Explore directory</Link>
            <Link href="/gigs" className="rounded-[4px] border border-[#17202A] bg-white px-6 py-3 text-sm font-bold transition hover:border-[#0F766E] hover:bg-[#F6F9FC]">View gigs</Link>
          </div>
        </div>
        <div className="relative">
          <DepthStack />
          <SearchPanel />
        </div>
      </section>
      <HowItWorks />
    </main>
  );
}

function DepthStack() {
  return (
    <div className="absolute inset-0 -z-0 overflow-hidden rounded-[8px]">
      {[
        ["left-[55%] top-[6%] h-40 w-72 opacity-60 blur-[1px]", "#EAF1F7"],
        ["left-[2%] top-[18%] h-40 w-72 opacity-40 blur-[3px]", "#EAF1F7"],
        ["left-[42%] top-[50%] h-36 w-64 opacity-30 blur-[4px]", "#D7F2FF"],
      ].map(([cls, color], index) => (
        <motion.div
          key={index}
          className={`absolute rounded-[6px] border border-[#D5DDE5] ${cls}`}
          style={{ backgroundColor: color }}
          animate={{ y: [0, index % 2 ? -8 : 8, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SearchPanel() {
  return (
    <motion.div className="relative z-10 border border-[#D5DDE5] bg-[#F6F9FC] p-4 shadow-[0_18px_50px_rgba(23,32,42,0.08)]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 border border-[#CBD5DF] bg-white px-4 py-4">
        <span className="font-mono text-xs uppercase text-[#0F766E]">search</span>
        <span className="text-sm text-[#7B8794]">Search instruments, genres, or project types</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Instrument", "Genre", "Remote", "Deadline"].map((filter, index) => (
          <motion.span key={filter} className="border border-[#D5DDE5] bg-white px-3 py-2 text-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: "#D7F2FF", borderColor: "#0F766E" }}>
            + {filter}
          </motion.span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {musicians.map((name, index) => (
          <motion.article key={name} className="group border border-[#D5DDE5] bg-white p-4 transition" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.05 }} whileHover={{ y: -3, borderColor: "#0F766E" }}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold">{name}</h2>
              <span className="text-[#0F766E]" aria-hidden="true">*</span>
            </div>
            <p className="mt-3 text-sm text-[#7B8794]">Portfolio links / Availability / Contact email</p>
            <span className="mt-4 hidden text-sm font-bold text-[#0F766E] group-hover:inline-block">Email</span>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-20 sm:px-8 md:grid-cols-3">
      {[
        ["01", "Search first", "Anonymous browsing, no sign-in wall."],
        ["02", "Compare quickly", "Instruments, genres, links, availability."],
        ["03", "Email directly", "No platform inbox to monitor."],
      ].map(([n, title, body]) => (
        <article key={n} className="border-l-4 border-[#0F766E] bg-[#F6F9FC] p-5">
          <span className="font-mono text-xs font-bold text-[#0F766E]">{n}</span>
          <h2 className="mt-3 text-xl font-bold">{title}</h2>
          <p className="mt-2 text-[#5C6670]">{body}</p>
        </article>
      ))}
    </section>
  );
}
