"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const tags = ["score", "session", "voice", "strings", "beats", "live set"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#FFF6E8] text-[#2A211B]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-[1280px] grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#E9785F]">Press play on the project</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.04em] sm:text-7xl lg:text-[96px]">
            Match the brief to the sound.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-[#735C4C]">
            A sunlit cassette for project briefs, student musicians, and direct email contact. Music-native without turning the page dark.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gigs/create" className="rounded-[6px] border-2 border-[#2A211B] bg-[#F5BF49] px-7 py-4 text-sm font-black transition hover:shadow-[5px_5px_0_#2A211B]">Post gig</Link>
            <Link href="/musicians" className="rounded-[6px] border-2 border-[#2A211B] bg-[#FFFDF4] px-7 py-4 text-sm font-black transition hover:bg-[#A8D8EA]">Browse musicians</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-[#B9855B] bg-[#FFFDF4] px-3 py-1 text-sm text-[#735C4C]">{tag}</span>
            ))}
          </div>
        </div>
        <Cassette />
      </section>
      <Tracklist />
    </main>
  );
}

function Cassette() {
  return (
    <motion.div className="relative mx-auto aspect-[4/2.5] w-full max-w-[620px] rounded-[28px] border-4 border-[#B9855B] bg-[#F2D7B6] p-7 shadow-[0_28px_70px_rgba(92,61,35,0.18)]" animate={{ rotate: [-1.5, 1.5, -1.5], y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
      <div className="absolute left-6 top-6 h-5 w-5 rounded-full border-2 border-[#B9855B]" />
      <div className="absolute right-6 top-6 h-5 w-5 rounded-full border-2 border-[#B9855B]" />
      <div className="absolute bottom-6 left-6 h-5 w-5 rounded-full border-2 border-[#B9855B]" />
      <div className="absolute bottom-6 right-6 h-5 w-5 rounded-full border-2 border-[#B9855B]" />
      <div className="rounded-[10px] border-2 border-[#2A211B] bg-[#FFFDF4] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#E9785F]">GigForge Mix 01</p>
        <h2 className="mt-5 text-3xl font-black sm:text-5xl">Student musicians for real creative briefs</h2>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-[#735C4C]">Side A / Direct email</p>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_1.4fr_1fr] items-center gap-5">
        <Reel />
        <div className="h-20 rounded-[8px] border-2 border-[#2A211B] bg-[#8B6A55]" />
        <Reel />
      </div>
    </motion.div>
  );
}

function Reel() {
  return (
    <motion.div className="mx-auto h-24 w-24 rounded-full border-[12px] border-[#4A3328] bg-[#FFFDF4]" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
      <div className="m-auto mt-7 h-8 w-8 rounded-full bg-[#4A3328]" />
    </motion.div>
  );
}

function Tracklist() {
  return (
    <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-20 sm:px-8 md:grid-cols-4">
      {[
        ["01", "Brief the track", "Describe the project, deadline, instruments, and mood."],
        ["02", "Find the player", "Browse profiles by genre, instrument, and availability."],
        ["03", "Send the email", "GigForge hands off to direct contact."],
        ["04", "Make the thing", "The collaboration happens off-platform."],
      ].map(([n, title, body]) => (
        <article key={n} className="border-t-2 border-[#2A211B] bg-[#FFFDF4] p-5">
          <span className="font-mono text-xs font-bold text-[#E9785F]">{n}</span>
          <h2 className="mt-3 text-xl font-black">{title}</h2>
          <p className="mt-2 text-[#735C4C]">{body}</p>
        </article>
      ))}
    </section>
  );
}
