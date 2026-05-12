"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const commands = [
  ["find vocalist genre:r&b", "12 profiles found / 4 available this week"],
  ["post gig project:podcast", "brief ready / direct email replies"],
  ["browse cello remote:true", "3 available / portfolio links attached"],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#F0FAF4] text-[#102019]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-[1280px] grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-[#B8DCC6] bg-white px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[#1B8A4A]">
            * live campus listings
          </div>
          <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-none tracking-[-0.035em] sm:text-7xl">
            A command center for creative collaboration.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-[#4E6358]">
            Search, filter, and contact without building another inbox. Finder Console is fast, precise, and intentionally daylight.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gigs" className="rounded-[6px] bg-[#1B8A4A] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#126C39] hover:shadow-[0_12px_30px_rgba(27,138,74,0.22)]">Open gigs</Link>
            <Link href="/musicians" className="rounded-[6px] border border-[#B8DCC6] bg-white px-7 py-4 text-sm font-bold transition hover:bg-[#E5F4EA]">Musicians</Link>
          </div>
        </div>
        <Console />
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-20 sm:px-8 md:grid-cols-3">
        {["Anonymous browsing", "Structured profiles", "Email handoff"].map((item) => (
          <article key={item} className="rounded-[6px] border border-[#CBE3D4] bg-white p-6 transition hover:border-t-4 hover:border-t-[#1B8A4A]">
            <h2 className="text-xl font-bold">{item}</h2>
            <p className="mt-3 text-[#4E6358]">
              {item === "Anonymous browsing" ? "No account required to see musicians or open gigs." : item === "Structured profiles" ? "Instrument, genre, campus, availability, portfolio." : "GigForge stops at discovery. Your inbox takes over."}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

function Console() {
  return (
    <motion.div className="relative rounded-[10px] border border-[#B8DCC6] bg-white p-5 shadow-[0_28px_70px_rgba(27,138,74,0.16)]" initial={{ opacity: 0, rotateY: -8, y: 20 }} animate={{ opacity: 1, rotateY: -3, y: 0 }} whileHover={{ rotateY: 4 }}>
      <div className="absolute -inset-3 -z-10 rounded-[14px] border border-[#B8DCC6]/60 bg-[#E5F4EA]/50" />
      <div className="border-b border-[#CBE3D4] pb-3 font-mono text-xs uppercase tracking-[0.16em] text-[#7B9286]">cmd GigForge finder</div>
      <div className="mt-5 grid gap-3 font-mono text-sm">
        {commands.map(([command, result], index) => (
          <motion.div key={command} className="rounded-[6px] border border-[#CBE3D4] bg-[#E5F4EA] p-4" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.12 }}>
            <p><span className="font-bold text-[#1B8A4A]">$</span> {command}</p>
            <p className="mt-2 text-[#4E6358]"><span className="text-[#39B7C4]">&gt;</span> {result}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {["142 indexed", "24 briefs", "12 campuses"].map((fact) => (
          <div key={fact} className="rounded-[6px] bg-[#F0FAF4] p-3 text-center font-mono text-[11px] uppercase text-[#1B8A4A]">{fact}</div>
        ))}
      </div>
    </motion.div>
  );
}
