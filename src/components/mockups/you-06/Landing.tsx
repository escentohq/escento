"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stories = ["Short films seeking score", "Indie games needing texture", "Campus events booking live sets"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] text-[#1B1712]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-[1280px] px-5 py-10 sm:px-8">
        <div className="border-b border-[#1B1712] pb-4 text-center text-3xl italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>GigForge Review</div>
        <div className="grid gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B23B2E]">A directory for campus sound</p>
            <h1 className="mt-5 max-w-4xl text-6xl leading-[0.96] tracking-[-0.02em] sm:text-8xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The next collaborator is probably three buildings away.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-[1.65] text-[#655D52]">
              GigForge as the publication of a campus creative scene: local, curated, useful, and alive.
            </p>
            <div className="mt-8 flex flex-wrap gap-5">
              <Link href="/musicians" className="bg-[#1B1712] px-6 py-4 text-sm font-bold text-[#FFFDF7] transition hover:bg-[#B23B2E]">Read the directory</Link>
              <Link href="/gigs/create" className="border-b border-[#1B1712] pb-1 pt-4 text-sm font-bold hover:border-[#B23B2E] hover:text-[#B23B2E]">Submit a gig</Link>
            </div>
            <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-[#9A8F80]">142 musicians / 24 open gigs / 12 universities</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <Magazine />
            <aside className="border-l border-[#1B1712] pl-6">
              <p className="text-4xl italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Now listing</p>
              <div className="mt-6 grid gap-5">
                {stories.map((story, index) => (
                  <motion.article key={story} className="border-t border-[#D6CEC2] pt-5" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B23B2E]">Feature 0{index + 1}</span>
                    <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{story}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#655D52]">Browse anonymously, contact by email, keep the project moving.</p>
                  </motion.article>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="bg-[#F6EFE3] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-3">
          {[
            ["Short films", "Composers, string players, ambient producers."],
            ["Podcasts", "Theme music, editing help, voice-friendly instrumentals."],
            ["Games", "Loops, textures, UI sounds, trailer scoring."],
          ].map(([title, body]) => (
            <article key={title} className="border-t border-[#1B1712] bg-[#FFFDF7] p-6">
              <h2 className="text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
              <p className="mt-3 leading-7 text-[#655D52]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Magazine() {
  return (
    <motion.div className="relative mx-auto h-[430px] w-full max-w-[340px]" animate={{ rotateY: [-8, 8, -8], y: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
      <div className="absolute left-10 top-8 h-[360px] w-[250px] rounded-[3px] bg-[#FFF8EC] shadow-[0_28px_50px_rgba(76,50,24,0.16)]" />
      <div className="absolute left-0 top-4 h-[380px] w-[270px] rounded-[3px] border border-[#D6CEC2] bg-[#F2D6C9] p-6 shadow-[18px_24px_40px_rgba(76,50,24,0.14)]">
        <div className="absolute bottom-0 left-0 top-0 w-8 bg-[#B23B2E]" />
        <div className="ml-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#B23B2E]">GigForge Review</p>
          <h2 className="mt-20 text-5xl leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Campus Sound Issue</h2>
          <p className="mt-12 font-mono text-xs uppercase tracking-[0.16em] text-[#655D52]">142 musicians / 24 open gigs</p>
        </div>
      </div>
    </motion.div>
  );
}
