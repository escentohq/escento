"use client";

const COLS = [
  {
    n: "01",
    title: "For creators",
    body: "Browse musicians, post a gig brief, receive direct replies by email. No platform cut. No DMs.",
  },
  {
    n: "02",
    title: "For musicians",
    body: "Build a profile. List your instruments, your campus, your availability. Clients contact you directly.",
  },
  {
    n: "03",
    title: "For the scene",
    body: "Every campus music department deserves infrastructure. This is that infrastructure.",
  },
];

import { motion } from "framer-motion";

export function Pitch() {
  return (
    <section className="bg-[#F2EFE8] px-5 py-20 sm:px-8 sm:py-24">
      <motion.div
        className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 sm:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {COLS.map((c) => (
          <motion.article
            key={c.n}
            className="border-t-4 border-[#0E0D0B] pt-6"
            variants={{
              hidden: { opacity: 0, y: 32 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 140, damping: 20 },
              },
            }}
          >
            <span className="font-mono text-[13px] uppercase tracking-[0.16em] text-[#8A8278]">
              {c.n} / {c.title}
            </span>
            <h3 className="mt-5 text-[22px] font-bold text-[#0E0D0B]">{c.title}</h3>
            <p className="mt-3 max-w-sm text-[17px] leading-[1.6] text-[#5A5650]">{c.body}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
