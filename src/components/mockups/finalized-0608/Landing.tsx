"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { PulseDock } from "./PulseDock";
import { SignalScene } from "./SignalScene";

const networkFeed = [
  "Maya Chen joined from UT Austin",
  "Thesis short posted a scoring brief",
  "Jordan Lee opened weekend availability",
  "Podcast intro job filled in 2 hours",
  "12 campuses active right now",
];

const profiles = [
  {
    name: "Maya Chen",
    role: "Guitar, vocals, arrangement",
    campus: "UT Austin",
    note: "Bright indie sessions, film cues, and soft live sets.",
    status: "open this week",
  },
  {
    name: "Jordan Lee",
    role: "Cello, strings, composition",
    campus: "USC",
    note: "Best for film work, chamber layers, and emotional restraint.",
    status: "taking one more brief",
  },
  {
    name: "Sam Park",
    role: "Keys, producer, mix prep",
    campus: "Berklee",
    note: "Quick with demos, polished stems, and calm project turnaround.",
    status: "late-night sessions",
  },
];

const steps = [
  {
    title: "See who is actually active",
    body: "The first screen tells you whether the network is moving without making you read a paragraph about it.",
  },
  {
    title: "Skim profiles fast",
    body: "The profile layer keeps instrument, vibe, timing, and school visible in one pass.",
  },
  {
    title: "Contact directly",
    body: "The whole point is speed: find the right person, then move the project forward.",
  },
];

const floatingCards = [
  { label: "now open", value: "voice + guitar", className: "left-4 top-5 sm:left-8 sm:top-8" },
  { label: "posted 6m ago", value: "short film score", className: "right-3 top-12 sm:right-10 sm:top-14" },
  { label: "campus pulse", value: "12 schools live", className: "left-10 bottom-6 sm:left-18 sm:bottom-10" },
];

function reveal(index: number, reduceMotion: boolean) {
  if (reduceMotion) return {};

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen overflow-hidden bg-[#FCFAF7] text-[#172033] selection:bg-[#FF8C62]/20">
      <section className="relative overflow-hidden border-b border-[rgba(23,32,51,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,98,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(168,176,255,0.16),transparent_24%),linear-gradient(180deg,#FFFDFC_0%,#FCFAF7_100%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 sm:pb-20">
          <nav className="flex items-center justify-between gap-4 border-b border-[rgba(23,32,51,0.08)] pb-4">
            <div>
              <p className="text-lg font-bold tracking-[-0.03em]">GigForge</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B758C]">
                Finalized 0608
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-full border border-[rgba(23,32,51,0.1)] bg-white/90 px-4 py-2 text-sm font-semibold text-[#172033] transition hover:border-[rgba(255,140,98,0.28)] hover:bg-white"
              >
                Sign in
              </Link>
            </div>
          </nav>

          <div className="grid gap-14 pt-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pt-14">
            <motion.div {...reveal(0, !!reduceMotion)} className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,140,98,0.2)] bg-white/86 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#FF8C62] shadow-[0_10px_30px_rgba(255,140,98,0.12)]">
                <span className="h-2 w-2 rounded-full bg-[#FF8C62]" />
                Social signal is live
              </span>

              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { delay: 0.08, duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 max-w-[10.5ch] text-[clamp(56px,8vw,102px)] font-black leading-[0.92] tracking-[-0.06em] text-[#172033]"
              >
                Open to collaborate. Easy to spot.
              </motion.h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { delay: 0.16, duration: 0.48 }}
                className="mt-5 max-w-lg text-[17px] leading-7 text-[#556177]"
              >
                A social roster for musicians. Light, fast, already moving.
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { delay: 0.24, duration: 0.45 }}
                className="mt-9 flex flex-wrap gap-4"
              >
                <motion.div whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }}>
                  <Link
                  href="/musicians"
                  className="inline-flex h-13 items-center justify-center rounded-full bg-[#FF8C62] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(255,140,98,0.24)] transition hover:bg-[#F47347]"
                  >
                    Browse musicians
                  </Link>
                </motion.div>
                <motion.div whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }}>
                  <Link
                    href="/gigs/create"
                    className="inline-flex h-13 items-center justify-center rounded-full border border-[rgba(23,32,51,0.12)] bg-white/90 px-6 text-sm font-semibold text-[#172033] transition hover:border-[rgba(168,176,255,0.35)] hover:bg-white"
                  >
                    Post a gig
                  </Link>
                </motion.div>
              </motion.div>

              <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-3">
                {[
                  ["142", "musicians"],
                  ["24", "open gigs"],
                  ["12", "campuses"],
                ].map(([value, label], index) => (
                  <motion.div
                    key={label}
                    {...reveal(index + 1, !!reduceMotion)}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: -6,
                            scale: 1.03,
                            rotate: index === 1 ? 0 : index === 0 ? -1.5 : 1.5,
                          }
                    }
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="rounded-[24px] border border-[rgba(23,32,51,0.08)] bg-white/86 px-5 py-5 shadow-[0_12px_36px_rgba(23,32,51,0.05)]"
                  >
                    <p className="text-[34px] font-black tracking-[-0.05em] text-[#172033]">{value}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B758C]">{label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...reveal(1, !!reduceMotion)}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -6, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      y: { duration: 7.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                    }
              }
              className="relative z-10"
            >
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.97, rotateX: 6 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotateX: 0 }}
                transition={reduceMotion ? undefined : { delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { rotateX: -2, rotateY: 2, scale: 1.01 }}
                style={{ transformPerspective: 1200 }}
                className="relative mx-auto h-[480px] max-w-[660px] overflow-hidden rounded-[34px] border border-[rgba(23,32,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.58))] shadow-[0_30px_100px_rgba(23,32,51,0.08)] backdrop-blur"
              >
                <SignalScene reduced={!!reduceMotion} />

                {floatingCards.map((item, index) => (
                  <motion.div
                    key={item.value}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: 1,
                            y: [0, -8, 0],
                            x: [0, index % 2 === 0 ? 6 : -6, 0],
                            rotate: [0, index % 2 === 0 ? -2.5 : 2.5, 0],
                          }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: { duration: 0.4, delay: index * 0.12 },
                            y: {
                              duration: 4.8 + index * 0.7,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: index * 0.25,
                            },
                            x: {
                              duration: 6.2 + index * 0.8,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: index * 0.2,
                            },
                            rotate: {
                              duration: 5.5 + index * 0.6,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: index * 0.18,
                            },
                          }
                    }
                    whileHover={reduceMotion ? undefined : { scale: 1.04, y: -10 }}
                    className={`absolute ${item.className} rounded-[18px] border border-white/80 bg-white/86 px-4 py-3 shadow-[0_18px_40px_rgba(23,32,51,0.10)] backdrop-blur`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B758C]">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#172033]">{item.value}</p>
                  </motion.div>
                ))}

                <PulseDock reduced={!!reduceMotion} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-[rgba(23,32,51,0.08)] bg-white/70">
        <motion.div
          className="flex min-w-max gap-3 px-5 py-4 sm:px-8"
          animate={reduceMotion ? undefined : { x: ["0%", "-40%"] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 18, ease: "linear", repeat: Number.POSITIVE_INFINITY }
          }
        >
          {[...networkFeed, ...networkFeed].map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
              className="flex items-center gap-3 rounded-full border border-[rgba(23,32,51,0.08)] bg-[#FFF8F4] px-4 py-2 text-sm text-[#49556B]"
            >
              <span className="h-2 w-2 rounded-full bg-[#FF8C62]" />
              <span>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <motion.div {...reveal(0, !!reduceMotion)}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF8C62]">Featured now</p>
            <h2 className="mt-3 max-w-[12ch] text-[44px] font-black leading-[0.96] tracking-[-0.05em] text-[#172033]">
              Profiles that feel social before they feel formal.
            </h2>
          </motion.div>
          <motion.p
            {...reveal(1, !!reduceMotion)}
            className="max-w-md text-[16px] leading-7 text-[#556177]"
          >
            Social first, still useful.
          </motion.p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {profiles.map((profile, index) => (
            <motion.article
              key={profile.name}
              {...reveal(index + 2, !!reduceMotion)}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -10,
                      scale: 1.015,
                      rotateX: 3,
                      rotateY: index % 2 === 0 ? -4 : 4,
                    }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformPerspective: 1100 }}
              className="rounded-[28px] border border-[rgba(23,32,51,0.08)] bg-white p-6 shadow-[0_18px_44px_rgba(23,32,51,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[28px] font-bold tracking-[-0.04em] text-[#172033]">{profile.name}</p>
                  <p className="mt-1 text-sm font-medium text-[#607089]">{profile.role}</p>
                </div>
                <span className="rounded-full bg-[#FFF0EA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF8C62]">
                  {profile.status}
                </span>
              </div>

              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8090A6]">{profile.campus}</p>
              <p className="mt-5 text-[15px] leading-7 text-[#556177]">{profile.note}</p>

              <div className="mt-6 flex items-center justify-between border-t border-[rgba(23,32,51,0.08)] pt-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8090A6]">direct contact</span>
                <button
                  type="button"
                  className="rounded-full border border-[rgba(23,32,51,0.1)] px-4 py-2 text-sm font-semibold text-[#172033] transition hover:border-[rgba(255,140,98,0.28)] hover:bg-[#FFF8F4]"
                >
                  View profile
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(23,32,51,0.08)] bg-[#FFFDFC]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                {...reveal(index, !!reduceMotion)}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -8,
                      scale: 1.015,
                    }
              }
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="rounded-[28px] border border-[rgba(23,32,51,0.08)] bg-white p-6 shadow-[0_14px_40px_rgba(23,32,51,0.04)]"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF8C62]">0{index + 1}</p>
                <h3 className="mt-4 text-[28px] font-bold tracking-[-0.04em] text-[#172033]">{step.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-[#556177]">{step.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <motion.div
          {...reveal(0, !!reduceMotion)}
          whileHover={reduceMotion ? undefined : { y: -4, scale: 1.005 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="rounded-[34px] border border-[rgba(23,32,51,0.08)] bg-[#172033] px-6 py-8 text-white shadow-[0_32px_90px_rgba(23,32,51,0.18)] sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FFD6C7]">Final CTA</p>
              <h2 className="mt-3 max-w-[14ch] text-[44px] font-black leading-[0.96] tracking-[-0.05em]">
                Super visible. Easy to join. Hard to forget.
              </h2>
            </div>
            <div>
              <p className="max-w-md text-[16px] leading-7 text-[#C7D0DF]">
                Social clarity, stronger motion, less friction.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/musicians"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#FF8C62] px-5 text-sm font-semibold text-white transition hover:bg-[#F47347]"
                >
                  Explore the network
                </Link>
                <Link
                  href="/mockups"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white transition hover:border-[#A8B0FF] hover:text-[#E0E5FF]"
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
