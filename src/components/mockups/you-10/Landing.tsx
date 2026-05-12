"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const tiles = ["Composer reel", "Jazz trio", "Game audio", "Choir vocals", "Synth score", "Live keys"];
const colors = ["#C4F1BE", "#FFD6A5", "#BDE7FF", "#DCD2FF", "#C4F1BE", "#FFFFFF"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#F2F5F8] text-[#111111]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-[1280px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7C3AED]">Portfolio-led discovery</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-none tracking-[-0.035em] sm:text-7xl">
            Hear enough to make the next move.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.65] text-[#5C6470]">
            Profile links become the interface: a gallery of student work with email one flip away.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/musicians" className="rounded-[8px] bg-[#7C3AED] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#5B21B6] hover:shadow-[0_12px_28px_rgba(124,58,237,0.24)]">Browse work</Link>
            <Link href="/profile/create" className="rounded-[8px] border border-[#7C3AED] bg-white px-7 py-4 text-sm font-bold text-[#7C3AED] transition hover:bg-[#EDE9FE]">Add profile</Link>
          </div>
        </div>
        <Gallery />
      </section>
      <section className="mx-auto grid max-w-[1280px] grid-cols-2 gap-3 px-5 pb-20 sm:px-8 md:grid-cols-3">
        {tiles.map((tile, index) => (
          <motion.article key={tile} className="aspect-[4/3] border border-[#CBD5DF] p-4" style={{ backgroundColor: colors[index] }} whileHover={{ y: -4 }}>
            <div className="flex h-full flex-col justify-between">
              <span className="text-[#7C3AED]">+</span>
              <h2 className="text-xl font-extrabold">{tile}</h2>
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}

function Gallery() {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-[#FAFBFC] shadow-[inset_0_-80px_120px_rgba(231,236,241,0.9)]">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#E7ECF1]" style={{ clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)" }} />
      {tiles.map((tile, index) => (
        <motion.div
          key={tile}
          className="absolute h-32 w-44 border border-[#CBD5DF] p-4 shadow-[0_18px_30px_rgba(17,17,17,0.10)]"
          style={{
            backgroundColor: colors[index],
            left: ["9%", "48%", "20%", "62%", "5%", "40%"][index],
            top: ["14%", "9%", "44%", "38%", "68%", "65%"][index],
            scale: [1, 0.94, 0.88, 0.82, 0.76, 0.72][index],
          }}
          animate={{ y: [0, index % 2 ? -8 : 8, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ rotateY: 180 }}
        >
          <div className="flex h-full flex-col justify-between">
            <span className="text-[#7C3AED]">+</span>
            <h2 className="text-lg font-extrabold">{tile}</h2>
            <p className="font-mono text-[10px] uppercase text-[#5C6470]">portfolio link</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
