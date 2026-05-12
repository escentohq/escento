"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SignalField } from "./SignalField";

const metrics = [
  { value: "142", label: "active musicians" },
  { value: "24", label: "open briefs" },
  { value: "12", label: "campuses" },
];

const boardRows = [
  ["Project", "Short film score", "OPEN"],
  ["Needs", "Cello, ambient synth", "3 matches"],
  ["Timing", "Session this weekend", "Fast turnaround"],
  ["Contact", "Direct email on profile", "No DMs"],
] as const;

const openings = [
  {
    title: "Live set for a campus fashion show",
    meta: "UT Austin / Friday night / paid",
    note: "Needs someone reliable, adaptable, and comfortable with a short rehearsal window.",
  },
  {
    title: "Producer for a three-song indie-pop run",
    meta: "Remote-friendly / stems this week",
    note: "Best for someone who can shape demos quickly and keep the process moving.",
  },
  {
    title: "Cellist for a thesis film cue",
    meta: "Northwestern / single session",
    note: "Small brief, strong emotional role, direct outreach encouraged.",
  },
];

const principles = [
  "The page leads with one believable product surface instead of three competing mood devices.",
  "The accent is cobalt: sharper, more grounded, and better aligned with a stricter system than turquoise.",
  "Every section uses the same card grammar so the page reads as designed, not assembled.",
];

function reveal(index: number, reduceMotion: boolean) {
  if (reduceMotion) return {};

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen overflow-hidden bg-[#EEF2F8] text-[#101827] selection:bg-[#214BD6]/18">
      <section className="relative isolate overflow-hidden border-b border-[#D6DEE9]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(33,75,214,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(238,242,248,0.88))]" />
          <SignalField reduced={!!reduceMotion} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-5 sm:px-8 sm:pb-20">
          <nav className="flex items-center justify-between gap-4 border-b border-[#D6DEE9] pb-4">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em]">GigForge</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#728197]">
                Studio signal
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-[8px] border border-[#C7D1E0] bg-white px-4 py-2 text-sm font-semibold text-[#101827] transition hover:border-[#214BD6] hover:bg-[#F6F8FF]"
              >
                Sign in
              </Link>
            </div>
          </nav>

          <div className="grid gap-14 py-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:py-16">
            <motion.div {...reveal(0, !!reduceMotion)} className="relative z-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#214BD6]">
                Clearer product signal
              </p>
              <h1 className="mt-5 max-w-[11ch] text-[clamp(52px,8vw,88px)] font-extrabold leading-[0.96] tracking-[-0.05em]">
                Know who is available before the deadline starts to move.
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-8 text-[#516072]">
                A stricter landing direction for GigForge with one calm proof surface, fewer claims,
                and a cobalt accent that supports the system instead of trying to become the whole identity.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/gigs"
                  className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#214BD6] px-6 text-sm font-semibold text-white transition hover:bg-[#1739AB]"
                >
                  Browse gigs
                </Link>
                <Link
                  href="/profile/create"
                  className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#C7D1E0] bg-white px-6 text-sm font-semibold text-[#101827] transition hover:border-[#214BD6] hover:bg-[#F6F8FF]"
                >
                  Create profile
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    {...reveal(index + 1, !!reduceMotion)}
                    className="border border-[#D6DEE9] bg-white/88 p-4 shadow-[0_16px_36px_rgba(16,24,39,0.05)]"
                  >
                    <p className="text-3xl font-extrabold tracking-[-0.05em]">{metric.value}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#728197]">
                      {metric.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal(2, !!reduceMotion)} className="relative z-10">
              <div className="mx-auto max-w-2xl rounded-[12px] border border-[#CAD4E4] bg-white/86 p-5 shadow-[0_30px_80px_rgba(26,44,82,0.14)] backdrop-blur">
                <div className="flex items-center justify-between border-b border-[#D6DEE9] pb-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#728197]">
                    Availability board
                  </span>
                  <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#214BD6]">
                    live
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {boardRows.map(([field, value, status], index) => (
                    <motion.div
                      key={field}
                      {...reveal(index + 2, !!reduceMotion)}
                      className="grid grid-cols-[96px_1fr_auto] items-center gap-3 rounded-[8px] border border-[#D6DEE9] bg-[#F7F9FD] p-4 text-sm"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#728197]">
                        {field}
                      </span>
                      <span className="font-semibold text-[#101827]">{value}</span>
                      <span className="text-right text-[#425066]">{status}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 border-t border-[#D6DEE9] pt-5 sm:grid-cols-2">
                  <div className="rounded-[8px] border border-[#D6DEE9] bg-[#FBFCFE] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#728197]">
                      Why it lands better
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#516072]">
                      One clear artifact in the hero makes the page feel like a product instead of a collage of signals.
                    </p>
                  </div>
                  <div className="rounded-[8px] border border-[#D6DEE9] bg-[#FBFCFE] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#728197]">
                      Accent logic
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#516072]">
                      Cobalt reads sharper and more trustworthy here than turquoise, which felt too eager and too generic.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.div {...reveal(0, !!reduceMotion)}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#214BD6]">Open gigs</p>
            <h2 className="mt-3 max-w-[12ch] text-[42px] font-extrabold leading-[0.98] tracking-[-0.04em]">
              One supporting section is enough.
            </h2>
            <p className="mt-5 max-w-sm text-[16px] leading-7 text-[#516072]">
              This page keeps gigs visible without turning the landing into a dashboard or a feed.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {openings.map((opening, index) => (
              <motion.article
                key={opening.title}
                {...reveal(index + 1, !!reduceMotion)}
                className="rounded-[10px] border border-[#D6DEE9] bg-white p-6 shadow-[0_14px_32px_rgba(16,24,39,0.05)] transition hover:border-[#B5C3DE]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="max-w-2xl text-[26px] font-bold leading-[1.1] tracking-[-0.03em]">
                    {opening.title}
                  </h3>
                  <span className="rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#214BD6]">
                    open
                  </span>
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#728197]">
                  {opening.meta}
                </p>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#516072]">{opening.note}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#D6DEE9] bg-white/60">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((principle, index) => (
              <motion.article
                key={principle}
                {...reveal(index, !!reduceMotion)}
                className="border border-[#D6DEE9] bg-white p-6"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#214BD6]">0{index + 1}</p>
                <p className="mt-4 text-[16px] leading-7 text-[#425066]">{principle}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
        <motion.div
          {...reveal(0, !!reduceMotion)}
          className="rounded-[14px] border border-[#C9D4E5] bg-[#101827] px-6 py-8 text-white shadow-[0_28px_70px_rgba(16,24,39,0.18)] sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#90A9FF]">Final CTA</p>
              <h2 className="mt-3 max-w-[14ch] text-[42px] font-extrabold leading-[0.98] tracking-[-0.04em]">
                Cleaner signal. Faster decision. Less noise.
              </h2>
            </div>

            <div>
              <p className="max-w-md text-[16px] leading-7 text-[#C5CEDB]">
                This direction says the product works by showing a believable slice of it immediately and then getting out of the way.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/gigs"
                  className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#214BD6] px-5 text-sm font-semibold text-white transition hover:bg-[#1739AB]"
                >
                  Browse gigs
                </Link>
                <Link
                  href="/mockups"
                  className="inline-flex h-11 items-center justify-center rounded-[8px] border border-white/14 px-5 text-sm font-semibold text-white transition hover:border-[#90A9FF] hover:text-[#90A9FF]"
                >
                  Back to mockups
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
