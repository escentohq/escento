"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";

import { BlueprintMesh } from "./BlueprintMesh";
import { CountUp, HoverCell, Reveal } from "./Reveal";

const STAT_BLOCKS = [
  { value: 142, label: "MUSICIANS" },
  { value: 24, label: "OPEN GIGS" },
  { value: 12, label: "CAMPUSES" },
];

const DIRECTORY_CELLS = [
  {
    name: "Maya C.",
    instrument: "Guitar",
    school: "UT Austin",
    available: true,
  },
  {
    name: "Jordan L.",
    instrument: "Cello",
    school: "USC",
    available: true,
  },
  {
    name: "Sam P.",
    instrument: "Piano",
    school: "Berklee",
    available: true,
  },
];

const HOW_IT_WORKS = [
  "Browse the directory - no account needed.",
  "Find someone you like - email is right there.",
  "Contact them - that is the whole product.",
];

const COORDINATES = [
  { label: "A1", top: "96px", left: "48px" },
  { label: "B3", top: "96px", right: "56px" },
  { label: "C2", top: "420px", left: "calc(50% - 18px)" },
  { label: "D4", bottom: "182px", right: "72px" },
];

const theme = {
  "--page-bg": "#EEF4FF",
  "--card-bg": "#FFFFFF",
  "--cell-bg": "rgba(255,255,255,0.6)",
  "--cta-bg": "#2D3FDB",
  "--grid-line": "rgba(45,63,219,0.12)",
  "--grid-line-heavy": "rgba(45,63,219,0.30)",
  "--mesh-wire": "rgba(45,63,219,0.45)",
  "--ink-primary": "#0F172A",
  "--ink-secondary": "#334155",
  "--ink-muted": "#64748B",
  "--accent-indigo": "#2D3FDB",
  "--accent-indigo-hover": "#1E2BA6",
  "--accent-cyan": "#06B6D4",
  "--grotesk": "\"Space Grotesk\", \"DM Sans\", system-ui, sans-serif",
} as CSSProperties;

export function Landing() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      style={{
        ...theme,
        backgroundColor: "var(--page-bg)",
        backgroundImage:
          "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }}
      className="relative min-h-screen overflow-hidden text-(--ink-primary)"
    >
      {COORDINATES.map((marker) => (
        <span
          key={marker.label}
          aria-hidden="true"
          className="pointer-events-none absolute z-10 font-mono text-[9px] uppercase tracking-[0.2em] text-(--grid-line-heavy)"
          style={marker}
        >
          {marker.label}
        </span>
      ))}

      <div className="mx-auto max-w-[1200px] px-5 pb-14 pt-5 sm:px-8 sm:pb-20">
        <nav className="flex items-center justify-between border-b border-dashed border-(--grid-line-heavy) pb-4">
          <Link
            href="/mockups"
            className="text-base font-bold uppercase tracking-[0.12em] text-(--ink-primary)"
            style={{ fontFamily: "var(--grotesk)" }}
          >
            GigForge
          </Link>
          <Link
            href="/signin"
            className="text-sm font-medium uppercase tracking-[0.12em] text-(--ink-secondary) transition-colors hover:text-(--accent-indigo)"
          >
            Sign in -&gt;
          </Link>
        </nav>

        <section className="pt-8 sm:pt-10">
          <Reveal>
            <div className="relative h-[300px] overflow-hidden bg-[rgba(255,255,255,0.24)] sm:h-[360px] lg:h-[420px]">
              {mounted ? <BlueprintMesh reduced={shouldReduceMotion} /> : null}
            </div>
          </Reveal>

          <Reveal delay={0.05} className="mt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--ink-muted)">
              Fig. 01 / musician profile component
            </p>
          </Reveal>

          <Reveal delay={0.09} className="mt-6">
            <h1
              className="max-w-[900px] text-[clamp(54px,9vw,128px)] font-extrabold leading-[0.88] tracking-[-0.04em] text-(--ink-primary)"
              style={{ fontFamily: "var(--grotesk)" }}
            >
              STUDENT MUSICIANS.
              <br />
              STUDENT CREATORS.
              <br />
              ONE DIRECTORY.
            </h1>
          </Reveal>

          <Reveal delay={0.12} className="mt-8">
            <div className="grid gap-[2px] bg-(--grid-line-heavy) lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid gap-[2px] bg-(--grid-line-heavy)">
                <div className="grid gap-[2px] bg-(--grid-line-heavy) md:grid-cols-3">
                  {STAT_BLOCKS.map((stat) => (
                    <HoverCell key={stat.label} className="bg-(--page-bg) px-5 py-5 sm:px-6 sm:py-6">
                      <div className="text-[clamp(48px,6vw,80px)] font-extrabold leading-none text-(--accent-indigo)" style={{ fontFamily: "var(--grotesk)" }}>
                        <CountUp value={stat.value} />
                      </div>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-(--ink-muted)">
                        {stat.label}
                      </p>
                    </HoverCell>
                  ))}
                </div>

                <div className="grid gap-[2px] bg-(--grid-line-heavy) md:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="bg-(--page-bg) px-5 py-5 sm:px-6">
                    <p className="max-w-[34ch] text-base leading-relaxed text-(--ink-secondary)">
                      A professional directory. Not a social network. Structured profiles, direct
                      contact, and a UI that reads like a system diagram instead of a feed.
                    </p>
                  </div>
                  <div className="grid gap-[2px] bg-(--grid-line-heavy)">
                    <Link href="/musicians" className="block">
                      <HoverCell invert className="h-full bg-(--accent-indigo) px-5 py-5 text-(--page-bg) sm:px-6">
                        <div className="flex h-full min-h-[118px] flex-col justify-between">
                          <p className="text-[22px] font-bold uppercase tracking-[0.02em]" style={{ fontFamily: "var(--grotesk)" }}>
                            Browse musicians
                          </p>
                          <p className="text-right font-mono text-[12px] uppercase tracking-[0.18em]">
                            Plate 01 -&gt;
                          </p>
                        </div>
                      </HoverCell>
                    </Link>
                    <Link href="/gigs/create" className="block">
                      <HoverCell className="h-full bg-(--page-bg) px-5 py-5 sm:px-6">
                        <div className="flex h-full min-h-[118px] flex-col justify-between">
                          <p className="text-[22px] font-bold uppercase tracking-[0.02em] text-(--ink-primary)" style={{ fontFamily: "var(--grotesk)" }}>
                            Post a gig
                          </p>
                          <p className="text-right font-mono text-[12px] uppercase tracking-[0.18em] text-(--ink-muted)">
                            Plate 02 -&gt;
                          </p>
                        </div>
                      </HoverCell>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal>
            <div className="grid gap-[2px] bg-(--grid-line-heavy) md:grid-cols-4">
              {DIRECTORY_CELLS.map((cell) => (
                <Link key={cell.name} href="/musicians" className="block">
                  <HoverCell className="bg-(--cell-bg) px-5 py-5 backdrop-blur-[2px]">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-sm text-(--accent-cyan)">◉</span>
                      <div>
                        <p className="text-[19px] font-semibold text-(--ink-primary)" style={{ fontFamily: "var(--grotesk)" }}>
                          {cell.name}
                        </p>
                        <p className="mt-1 text-sm text-(--ink-secondary)">{cell.instrument}</p>
                        <p className="text-sm text-(--ink-muted)">{cell.school}</p>
                      </div>
                    </div>
                  </HoverCell>
                </Link>
              ))}

              <Link href="/musicians" className="block">
                <HoverCell invert className="bg-(--accent-indigo) px-5 py-5 text-(--page-bg)">
                  <div className="flex h-full min-h-[132px] flex-col justify-between">
                    <div>
                      <p className="text-[19px] font-semibold" style={{ fontFamily: "var(--grotesk)" }}>
                        142 total
                      </p>
                      <p className="mt-1 text-sm text-[rgba(238,244,255,0.78)]">browse all profiles</p>
                    </div>
                    <p className="text-right font-mono text-[12px] uppercase tracking-[0.18em]">
                      Open -&gt;
                    </p>
                  </div>
                </HoverCell>
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal>
            <div className="grid gap-[2px] bg-(--grid-line-heavy)">
              {HOW_IT_WORKS.map((step, index) => (
                <div key={index} className="grid gap-[2px] bg-(--grid-line-heavy) md:grid-cols-[92px_minmax(0,1fr)]">
                  <div className="bg-(--accent-indigo) px-5 py-5 text-(--page-bg)">
                    <p className="text-[28px] font-bold leading-none" style={{ fontFamily: "var(--grotesk)" }}>
                      0{index + 1}
                    </p>
                  </div>
                  <div className="bg-(--page-bg) px-5 py-5 sm:px-6">
                    <p className="text-base leading-relaxed text-(--ink-primary)">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <footer className="mt-12 border-t border-dashed border-(--grid-line-heavy) pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--ink-muted)">
              Blueprint / internal landing study
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-(--ink-secondary)">
              <Link className="transition-colors hover:text-(--accent-indigo)" href="/mockups">
                All mockups
              </Link>
              <Link className="transition-colors hover:text-(--accent-indigo)" href="/musicians">
                Directory
              </Link>
              <Link className="transition-colors hover:text-(--accent-indigo)" href="/gigs">
                Gigs
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
