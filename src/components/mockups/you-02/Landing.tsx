"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const BUILDINGS = [
  { name: "Music Hall", x: "8%", y: "18%", w: "18%", h: "23%", active: true, count: 14 },
  { name: "Film Lab", x: "32%", y: "16%", w: "20%", h: "16%", active: false, count: 4 },
  { name: "Studio Annex", x: "58%", y: "19%", w: "16%", h: "20%", active: true, count: 9 },
  { name: "Theater", x: "78%", y: "17%", w: "15%", h: "22%", active: false, count: 3 },
  { name: "Media Center", x: "10%", y: "62%", w: "22%", h: "16%", active: false, count: 6 },
  { name: "Practice Rooms", x: "40%", y: "63%", w: "15%", h: "15%", active: true, count: 18 },
  { name: "Arts Library", x: "61%", y: "61%", w: "18%", h: "15%", active: false, count: 2 },
  { name: "Event Hall", x: "83%", y: "60%", w: "14%", h: "19%", active: false, count: 5 },
];

const RESULTS = [
  "Maya R. / Guitar + production / Chicago",
  "Theo L. / Film score / Remote",
  "Nina P. / Violin / Weekend shoots",
];

const STEPS = [
  ["01", "Browse the directory", "No account required."],
  ["02", "Find who you need", "Filter by instrument, genre, campus."],
  ["03", "Email them directly", "That is the whole product promise."],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#FAF6EE] text-[#1A1510]">
      <section className="overflow-hidden">
        <CampusMap />
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex bg-[#E8C44A] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#5D8C1E]">
              GF / Student creative network
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.035em] sm:text-7xl lg:text-[88px]">
              Find the student musician your project is missing.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[#66563D]">
              Browse free. Post gigs. Email directly. Campus Signal makes the local creative
              network visible before anyone signs in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/musicians" className="bg-[#1A1510] px-7 py-4 text-[15px] font-bold text-[#FAF6EE] shadow-[3px_3px_0_#B7D85A] transition hover:bg-[#5D8C1E]">
                Browse musicians -&gt;
              </Link>
              <Link href="/gigs/create" className="border-2 border-[#1A1510] bg-[#E8C44A] px-7 py-4 text-[15px] font-bold transition hover:shadow-[3px_3px_0_#1A1510]">
                Post a gig +
              </Link>
            </div>
            <Stats />
          </div>
          <Preview />
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-4 px-5 pb-20 sm:px-8 md:grid-cols-3">
        {STEPS.map(([n, title, body]) => (
          <motion.article
            key={n}
            className="border-t-2 border-[#1A1510] py-5"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-sm font-bold text-[#5D8C1E]">{n}</span>
            <h2 className="mt-3 text-xl font-black">{title}</h2>
            <p className="mt-2 text-[#66563D]">{body}</p>
          </motion.article>
        ))}
      </section>
    </main>
  );
}

function CampusMap() {
  return (
    <div className="relative h-[35vh] min-h-[300px] overflow-hidden bg-[#EFE6D2]">
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[110%] -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] bg-[#DDD1BA]" />
      <div className="absolute left-1/2 top-1/2 h-[110%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-[74deg] bg-[#DDD1BA]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF6EE] to-transparent" />
      {BUILDINGS.map((building, index) => (
        <motion.div
          key={building.name}
          className={`absolute border border-[#1A1510]/20 shadow-[10px_14px_18px_rgba(60,44,20,0.12)] ${building.active ? "bg-[#B7D85A]" : "bg-[#D8CEBC]"}`}
          style={{ left: building.x, top: building.y, width: building.w, height: building.h, transform: "skewY(-10deg) rotate(-4deg)" }}
          animate={building.active ? { boxShadow: ["0 0 0 rgba(183,216,90,0)", "0 0 42px rgba(183,216,90,0.42)", "0 0 0 rgba(183,216,90,0)"] } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.16 }}
          whileHover={{ y: -10 }}
        >
          <div className="absolute inset-x-0 top-0 h-3 bg-white/25" />
          <div className="absolute left-2 top-2 font-mono text-[10px] uppercase text-[#1A1510]/70">
            {building.name} / {building.count}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Preview() {
  return (
    <div className="grid gap-4">
      <motion.div className="border-2 border-[#1A1510] bg-white p-5 shadow-[10px_10px_0_#1A1510]" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
        <div className="border-b border-[#E2D8C5] pb-4 text-sm font-bold">Search: composer, cello, jazz keys</div>
        <div className="mt-5 grid gap-3">
          {RESULTS.map((item, index) => (
            <motion.div key={item} className="flex items-center justify-between border border-[#E2D8C5] bg-[#FBFAF6] p-3 text-sm" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + index * 0.08 }} whileHover={{ x: 3, backgroundColor: "#F5F1E6" }}>
              <span>{item}</span>
              <span className="font-bold text-[#5D8C1E]">Email</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["I need music", "Post a project brief and invite direct replies.", "bg-white"],
          ["I make music", "List instruments, links, campus, and availability.", "bg-[#EEF5DA]"],
        ].map(([title, text, bg]) => (
          <motion.article key={title} className={`border-2 border-[#1A1510] p-5 ${bg}`} whileHover={{ y: -4, boxShadow: "4px 4px 0 #1A1510" }}>
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#66563D]">{text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className="mt-10 grid max-w-2xl grid-cols-3 divide-x-2 divide-[#1A1510] border-y-2 border-[#1A1510] py-4">
      {[
        ["142", "musicians"],
        ["24", "open gigs"],
        ["12", "campuses"],
      ].map(([n, label]) => (
        <div key={label} className="px-4 first:pl-0">
          <div className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">{n}</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9B835E]">{label}</div>
        </div>
      ))}
    </div>
  );
}
