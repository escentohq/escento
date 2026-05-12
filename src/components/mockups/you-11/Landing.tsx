"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Landing() {
  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#17130F]">
      <section className="relative min-h-[calc(100vh-49px)] overflow-hidden">
        <Stage />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
          <nav className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-[0.18em]">GigForge</span>
            <Link href="/musicians" className="rounded-[4px] bg-[#7BAE3A] px-5 py-2 text-sm font-bold text-white">Find musicians</Link>
          </nav>
          <div className="max-w-4xl pt-[28vh]">
            <RevealText text="Put the right musician in the room." />
            <p className="mt-7 max-w-2xl text-lg leading-[1.6] text-[#5C574F]">
              A directory for student creators. Browse free. Email directly. White Stage frames GigForge as a bright performance space waiting for the right collaborator.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/musicians" className="rounded-[4px] bg-[#7BAE3A] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#668F30] hover:shadow-[0_14px_32px_rgba(123,174,58,0.22)]">Find musicians -&gt;</Link>
              <Link href="/gigs/create" className="rounded-[4px] border border-[#DED8CC] bg-white/70 px-7 py-4 text-sm font-bold transition hover:border-[#7BAE3A] hover:bg-white">Post a gig</Link>
            </div>
          </div>
        </div>
      </section>
      <ProgramRows />
    </main>
  );
}

function Stage() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F8F7F2]">
      <div className="absolute left-1/2 top-24 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[rgba(255,206,92,0.18)] blur-2xl" />
      <div className="absolute bottom-0 left-1/2 h-[58vh] w-[115vw] -translate-x-1/2 bg-[#E8E2D6]" style={{ clipPath: "polygon(24% 0, 76% 0, 100% 100%, 0 100%)" }} />
      <div className="absolute bottom-[20vh] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#FFF1B8] blur-sm" />
      <div className="absolute bottom-[24vh] left-1/2 h-32 w-10 -translate-x-1/2 rounded-full bg-[#2A2620]" />
      {[0, 1, 2, 3, 4].map((step) => (
        <div key={step} className="absolute left-1/2 h-10 -translate-x-1/2 bg-[#DCD5C8] shadow-[0_8px_18px_rgba(50,42,30,0.10)]" style={{ bottom: `${6 + step * 4}vh`, width: `${55 + step * 9}%` }} />
      ))}
    </div>
  );
}

function RevealText({ text }: { text: string }) {
  return (
    <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-[108px]">
      {text.split(" ").map((word, index) => (
        <motion.span key={`${word}-${index}`} className="mr-[0.22em] inline-block" initial={{ opacity: 0, y: 28, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: index * 0.12, type: "spring", stiffness: 140, damping: 16 }}>
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

function ProgramRows() {
  return (
    <section className="mx-auto grid max-w-[1280px] gap-4 px-5 py-20 sm:px-8">
      {[
        ["01", "OPEN GIG", "Browse anonymously. See who needs what. No account required."],
        ["02", "MATCHED PROFILE", "Find the right student by instrument, genre, campus, availability."],
        ["03", "DIRECT EMAIL", "One email. Their inbox. Done. No platform fee."],
      ].map(([n, title, body], index) => (
        <motion.article key={n} className="grid gap-4 border border-[#DED8CC] bg-white p-6 sm:grid-cols-[80px_220px_1fr]" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
          <span className="font-mono text-[#7BAE3A]">* {n}</span>
          <h2 className="font-bold">{title}</h2>
          <p className="text-[#5C574F]">{body}</p>
        </motion.article>
      ))}
    </section>
  );
}
