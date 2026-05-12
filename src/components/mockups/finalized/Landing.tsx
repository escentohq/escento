"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { FrequencyMesh } from "./FrequencyMesh";
import { RosterStack } from "./RosterStack";

const stats = [
  { label: "musicians", value: "142" },
  { label: "open gigs", value: "24" },
  { label: "campuses", value: "12" },
];

const activityItems = [
  "7 new roster cards this week",
  "Austin string trio booked in 14 minutes",
  "USC producer joined from a scoring club",
  "12 campus hosts browsing right now",
  "New gig board posts every afternoon",
];

const rosterCards = [
  {
    name: "Jordan Lee",
    role: "Drums + live production",
    school: "Northwestern",
    status: "available tonight",
    note: "Fast with rehearsals, campus venue backlines, and last-minute festival fills.",
  },
  {
    name: "Sofia Patel",
    role: "Vocalist + topline",
    school: "NYU",
    status: "now reviewing briefs",
    note: "Prefers short, direct outreach with references and a clear project vibe.",
  },
  {
    name: "Micah Reed",
    role: "Composer + synth textures",
    school: "Berklee",
    status: "open this weekend",
    note: "Best for film cues, visual albums, and projects that need atmosphere quickly.",
  },
];

const gigCards = [
  {
    title: "Student short film needs intimate score",
    meta: "3 week turnaround / paid / remote-friendly",
    body: "Looking for guitar, cello, or textured production with emotional restraint.",
  },
  {
    title: "Campus spring show opening slot",
    meta: "UT Austin / indie-pop / Friday night",
    body: "Host wants a duo or trio that can load in fast and bring a tight live set.",
  },
  {
    title: "Podcast relaunch theme package",
    meta: "Recurring / 30 sec stingers / quick brief",
    body: "Ideal for a producer who can move from scratch demos to polished stems fast.",
  },
];

const flow = [
  {
    step: "01",
    title: "Browse a live roster",
    body: "Availability, roles, schools, and the right amount of personality all show up immediately.",
  },
  {
    step: "02",
    title: "Spot the right fit faster",
    body: "Compact cards keep profiles, openings, and timing visible without turning the page into a dashboard.",
  },
  {
    step: "03",
    title: "Reach out while the signal is hot",
    body: "Clear CTAs make it obvious where to click next, whether you are hiring or looking to join.",
  },
];

const networkNotes = [
  "Open roster indicators keep the page feeling alive.",
  "Compact rails and labels borrow the denser scanability from the editorial direction.",
  "Hover states stay tactile and warm instead of turning the interface into a toy.",
];

function reveal(index: number, reduceMotion: boolean) {
  if (reduceMotion) return {};

  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function hoverCard(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : {
        whileHover: {
          y: -5,
          boxShadow: "0 26px 60px rgba(15,23,42,0.14)",
          borderColor: "rgba(23,201,192,0.24)",
        },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };
}

export function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7FBFA] font-sans text-[#0F172A]">
      <section className="relative isolate overflow-hidden border-b border-[rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,201,192,0.18),transparent_35%),radial-gradient(circle_at_78%_18%,rgba(96,108,255,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,251,250,0.82))]" />
          <FrequencyMesh reduced={!!reduceMotion} />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-18 pt-5 sm:px-8 lg:pb-24">
          <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#17C9C0] text-sm font-black text-[#062B2A]">
                GF
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">GigForge</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5E7786]">
                  Finalized signal direction
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#43606F]">
              <a href="#roster" className="transition hover:text-[#0F172A]">
                Roster
              </a>
              <a href="#gigs" className="transition hover:text-[#0F172A]">
                Open gigs
              </a>
              <a href="#how-it-works" className="transition hover:text-[#0F172A]">
                How it works
              </a>
              <Link
                href="/sign-in"
                className="rounded-full border border-[rgba(15,23,42,0.12)] px-4 py-2 text-[#0F172A] transition hover:border-[rgba(23,201,192,0.26)] hover:bg-white"
              >
                Sign in
              </Link>
            </div>
          </nav>

          <div className="grid gap-14 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-18">
            <motion.div {...reveal(0, !!reduceMotion)} className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(23,201,192,0.22)] bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#0E7F79] backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#17C9C0]" />
                Network live now
              </span>

              <h1 className="mt-6 max-w-[14ch] text-[54px] font-semibold leading-[0.96] tracking-[-0.05em] text-[#0F172A] sm:text-[72px]">
                Find the right musician before the room fills up.
              </h1>

              <p className="mt-6 max-w-xl text-[18px] leading-8 text-[#516577]">
                A bright, socially alive landing page built on the clarity of the open-to-collaborate system,
                then layered with collectible profile cards, a reactive frequency field, warmer hover behavior,
                and compact information rails that stay easy to scan.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/musicians"
                  className="rounded-full bg-[#17C9C0] px-6 py-4 text-sm font-semibold text-[#062B2A] shadow-[0_18px_40px_rgba(23,201,192,0.24)] transition hover:bg-[#12B3AB]"
                >
                  Browse musicians
                </Link>
                <Link
                  href="/gigs/create"
                  className="rounded-full border border-[rgba(15,23,42,0.12)] bg-white/85 px-6 py-4 text-sm font-semibold text-[#0F172A] transition hover:border-[rgba(23,201,192,0.28)] hover:bg-white"
                >
                  Post a gig
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    {...reveal(index + 1, !!reduceMotion)}
                    className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur"
                  >
                    <p className="text-[34px] font-semibold tracking-[-0.05em] text-[#0F172A]">{stat.value}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#5E7786]">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                {...reveal(4, !!reduceMotion)}
                className="mt-8 grid gap-4 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/84 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur md:grid-cols-[0.9fr_1.1fr]"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0E7F79]">
                    Why this composition works
                  </p>
                  <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">
                    Recognizably partner-06 at the base, but more alive before the first scroll.
                  </p>
                </div>
                <div className="grid gap-3 text-sm leading-7 text-[#5E7786]">
                  {networkNotes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div {...reveal(2, !!reduceMotion)} className="relative z-10">
              <div className="grid gap-5 xl:grid-cols-[1fr_260px] xl:items-end">
                <RosterStack />

                <aside className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/88 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.09)] backdrop-blur">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0E7F79]">
                    Now moving
                  </p>
                  <div className="mt-4 grid gap-4">
                    {[
                      "Three campus hosts opened new listings today.",
                      "Five vocalists switched to available in the last hour.",
                      "A film club board post already has 11 clicks.",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`border-t border-[rgba(15,23,42,0.08)] pt-4 ${
                          index === 0 ? "border-t-0 pt-0" : ""
                        }`}
                      >
                        <p className="text-sm font-medium leading-6 text-[#1F3343]">{item}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7A8D9B]">
                          Live activity layer
                        </p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-[rgba(15,23,42,0.08)] bg-white/70">
        <motion.div
          className="flex min-w-max gap-4 px-5 py-4 sm:px-8"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ["0%", "-33%"],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 18,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        >
          {[...activityItems, ...activityItems].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-3 rounded-full border border-[rgba(15,23,42,0.08)] bg-[#F7FBFA] px-4 py-2 text-sm text-[#325264]"
            >
              <span className="h-2 w-2 rounded-full bg-[#17C9C0]" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="roster" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <motion.div {...reveal(0, !!reduceMotion)}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E7F79]">
              Featured roster
            </p>
            <h2 className="mt-3 text-[40px] font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[48px]">
              Profiles with enough detail to move on quickly.
            </h2>
          </motion.div>
          <motion.p
            {...reveal(1, !!reduceMotion)}
            className="max-w-md text-[16px] leading-7 text-[#5E7786]"
          >
            The information density borrows from the editorial direction, but the page still reads like a social product.
          </motion.p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {rosterCards.map((card, index) => (
            <motion.article
              key={card.name}
              {...reveal(index + 1, !!reduceMotion)}
              {...hoverCard(!!reduceMotion)}
              className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[24px] font-semibold tracking-[-0.03em] text-[#0F172A]">{card.name}</p>
                  <p className="mt-1 text-sm font-medium text-[#2D5168]">{card.role}</p>
                </div>
                <span className="rounded-full bg-[#EAFBF9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0E7F79]">
                  {card.status}
                </span>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#8193A0]">{card.school}</p>
              <p className="mt-5 text-[15px] leading-7 text-[#5E7786]">{card.note}</p>
              <div className="mt-6 flex items-center justify-between border-t border-[rgba(15,23,42,0.08)] pt-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7A8D9B]">
                  open roster
                </span>
                <button
                  type="button"
                  className="rounded-full border border-[rgba(15,23,42,0.10)] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[rgba(23,201,192,0.26)] hover:bg-[#F6FFFE]"
                >
                  View profile
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="gigs" className="border-y border-[rgba(15,23,42,0.08)] bg-[#F2F8F7]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div {...reveal(0, !!reduceMotion)}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E7F79]">
                Open gigs
              </p>
              <h2 className="mt-3 text-[38px] font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[46px]">
                The opportunity layer sits beside the profile layer, not underneath it.
              </h2>
              <p className="mt-5 max-w-md text-[16px] leading-7 text-[#5E7786]">
                This keeps the page feeling like a live market of people and projects rather than a passive directory.
              </p>
            </motion.div>

            <div className="grid gap-5">
              {gigCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  {...reveal(index + 1, !!reduceMotion)}
                  {...hoverCard(!!reduceMotion)}
                  className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="max-w-120 text-[26px] font-semibold tracking-[-0.03em] text-[#0F172A]">
                      {card.title}
                    </h3>
                    <span className="rounded-full border border-[rgba(23,201,192,0.18)] bg-[#F6FFFE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0E7F79]">
                      live brief
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7A8D9B]">
                    {card.meta}
                  </p>
                  <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#5E7786]">{card.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {flow.map((item, index) => (
            <motion.article
              key={item.step}
              {...reveal(index, !!reduceMotion)}
              className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E7F79]">{item.step}</p>
              <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#0F172A]">
                {item.title}
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-[#5E7786]">{item.body}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...reveal(4, !!reduceMotion)}
          className="mt-12 rounded-[36px] border border-[rgba(15,23,42,0.08)] bg-[#0F172A] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#87F2EC]">
                Final CTA
              </p>
              <h2 className="mt-3 max-w-[18ch] text-[40px] font-semibold tracking-[-0.04em] sm:text-[48px]">
                Built like a living musician network, not a generic hiring page.
              </h2>
            </div>
            <div>
              <p className="text-[16px] leading-7 text-[#C4D2DC]">
                The final direction stays clean and understandable first, but it has more presence before the first click.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/musicians"
                  className="rounded-full bg-[#17C9C0] px-5 py-3 text-sm font-semibold text-[#062B2A] transition hover:bg-[#12B3AB]"
                >
                  Explore the roster
                </Link>
                <Link
                  href="/gigs/create"
                  className="rounded-full border border-white/16 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#87F2EC] hover:text-[#87F2EC]"
                >
                  Start a posting
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
