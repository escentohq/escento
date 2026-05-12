"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const TypeSculpture = dynamic(
  () => import("@/components/mockups/you-01/TypeSculpture").then((mod) => mod.TypeSculpture),
  { ssr: false },
);

const STATS = [
  { value: 142, label: "musicians" },
  { value: 24, label: "open gigs posted this week" },
  { value: 12, label: "universities" },
];

export function Hero() {
  return (
    <header className="relative min-h-[calc(100vh-49px)] overflow-hidden bg-[#F2EFE8]">
      <TypeSculpture />
      <div className="relative z-10 border-b border-[#0E0D0B]">
        <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/mockups" className="text-sm font-black uppercase tracking-[0.2em] text-[#0E0D0B]">
            GigForge
          </Link>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5A5650]">
            <Link href="/signin" className="transition-colors hover:text-[#C8331C]">
              Sign in
            </Link>
            <span className="hidden sm:inline">Issue 01</span>
          </div>
        </nav>
      </div>

      <div className="relative z-10 border-y-4 border-[#0E0D0B]">
        <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8278]">
            <span className="text-[#C8331C]">Issue No. 01</span> / Spring /
          </p>
          <h1
            className="mt-7 max-w-6xl font-black leading-[0.92] tracking-[-0.02em] text-[#0E0D0B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(72px, 10vw, 144px)" }}
          >
            Book the band.
            <br />
            <span className="font-normal italic text-[#5A5650]">Skip the middleman.</span>
          </h1>
          <p className="mt-8 max-w-[620px] text-[17px] leading-[1.6] text-[#5A5650]">
            GigForge connects student musicians with student creators. Browse free. Email
            directly. No agents. No feeds.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/signin"
              className="inline-flex h-[52px] items-center justify-center bg-[#0E0D0B] px-7 text-[15px] font-semibold text-[#F2EFE8] transition-colors duration-200 hover:bg-[#C8331C]"
            >
              Sign in
            </Link>
            <motion.div whileHover="hover" initial="rest" animate="rest">
              <Link
                href="/musicians"
                className="inline-flex items-center gap-2 border-b border-[#0E0D0B] pb-1 text-[15px] font-semibold text-[#0E0D0B]"
              >
                Browse musicians
                <motion.span
                  aria-hidden="true"
                  className="text-[#C8331C]"
                  variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                  transition={{ duration: 0.2 }}
                >
                  -&gt;
                </motion.span>
              </Link>
            </motion.div>
          </div>
          <Stats />
        </div>
      </div>
    </header>
  );
}

function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className="mt-14 grid max-w-3xl grid-cols-1 border-y-2 border-[#0E0D0B] sm:grid-cols-3 sm:border-y-0"
    >
      {STATS.map((stat, index) => (
        <div
          key={stat.label}
          className="border-b-2 border-[#0E0D0B] py-5 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:px-6 sm:first:pl-0 sm:last:border-r-0"
        >
          <CountUp value={stat.value} active={inView} reduced={reduced ?? false} />
          <p className="mt-1 max-w-36 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8278]">
            {stat.label}
          </p>
          {index === 1 ? <span className="sr-only">accent red used for the open status dot</span> : null}
        </div>
      ))}
    </div>
  );
}

function CountUp({ value, active, reduced }: { value: number; active: boolean; reduced: boolean }) {
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [active, reduced, value]);

  return (
    <span
      className="block font-black leading-none tracking-[-0.02em] text-[#0E0D0B]"
      style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(48px, 6vw, 72px)" }}
    >
      {display}
    </span>
  );
}
