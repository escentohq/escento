"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Clapperboard,
  BadgeDollarSign,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

type Side = "musician" | "gig";

// ── Sample data ────────────────────────────────────────────────────────────────

const MUSICIAN = {
  initials: "MR",
  name: "Maya Reyes",
  meta: "UT Austin · Junior",
  bio: "Tracked on four student shorts this semester. Comfortable with sparse film cues and rough-cut turnarounds. Three-week turnaround is fine.",
  instruments: ["Guitar", "Piano", "Vocals"],
  genres: ["Indie", "Film scoring", "Jazz"],
};

const GIG = {
  title: "Composer for 10-minute thesis short.",
  poster: "Alex Park · Film, UT RTF",
  body: "Rough cut ready. Need sparse orchestral cues, mostly strings. $200 flat, on-screen credit. Three-week turnaround.",
  details: [
    { icon: Clapperboard, label: "Project", value: "Film" },
    { icon: BadgeDollarSign, label: "Comp", value: "Paid" },
    { icon: MapPin, label: "Location", value: "Austin, TX" },
    { icon: Clock, label: "Deadline", value: "3 weeks" },
  ] as const,
  chips: ["Strings", "Piano"],
  requestContext: "Message request: Composer for 10-minute thesis short.",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function Eyebrow({ children, color = "text-[#0055FF]" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${color}`}>
      {children}
    </span>
  );
}

function Chip({ children, variant = "blue" }: { children: React.ReactNode; variant?: "blue" | "pink" | "darkpink" }) {
  const cls =
    variant === "blue"
      ? "bg-[#0055FF]/10 text-[#0055FF]"
      : variant === "pink"
        ? "bg-[#FF3366]/10 text-[#FF3366]"
        : "bg-[#FF3366]/20 text-[#FF3366]";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

// ── Side A: Musician ───────────────────────────────────────────────────────────

function MusicianFace() {
  return (
    <div className="absolute inset-0 flex flex-col rounded-3xl border border-[#F1F5F9] bg-white p-6 md:p-8" style={{ backfaceVisibility: "hidden" }}>
      {/* Top strip */}
      <div className="flex items-center justify-between">
        <Eyebrow>On stage</Eyebrow>
        <span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
          Available
        </span>
      </div>

      {/* Avatar + name */}
      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0055FF]/20 via-[#FF3366]/15 to-[#FFB000]/20">
          <span className="text-xl font-black text-[#0F172A]">{MUSICIAN.initials}</span>
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight text-[#0F172A]">{MUSICIAN.name}</h3>
          <p className="font-mono text-sm text-[#64748B]">{MUSICIAN.meta}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 line-clamp-3 text-base font-medium leading-relaxed text-[#475569]">
        {MUSICIAN.bio}
      </p>

      {/* Instruments */}
      <div className="mt-5 space-y-2">
        <Eyebrow>Plays</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {MUSICIAN.instruments.map((i) => <Chip key={i} variant="blue">{i}</Chip>)}
        </div>
      </div>

      {/* Genres */}
      <div className="mt-4 space-y-2">
        <Eyebrow>Genres</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {MUSICIAN.genres.map((g) => <Chip key={g} variant="pink">{g}</Chip>)}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#F1F5F9] pt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <MessageCircle className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
          Send request
        </div>
      </div>
    </div>
  );
}

// ── Side B: Gig ────────────────────────────────────────────────────────────────

function GigFace() {
  return (
    <div
      className="absolute inset-0 flex flex-col rounded-3xl bg-[#0F172A] p-6 md:p-8"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
    >
      {/* Corner glow */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent" aria-hidden="true" />

      {/* Top strip */}
      <div className="relative z-10 flex items-center justify-between">
        <Eyebrow color="text-[#FF3366]">Backstage</Eyebrow>
        <span className="rounded-full bg-[#0055FF]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
          Open
        </span>
      </div>

      {/* Title */}
      <div className="relative z-10 mt-5">
        <h3 className="text-2xl font-black tracking-tight text-white">{GIG.title}</h3>
        <p className="mt-1 font-mono text-sm text-[#94A3B8]">{GIG.poster}</p>
      </div>

      {/* Body */}
      <p className="relative z-10 mt-4 line-clamp-3 text-base font-medium leading-relaxed text-[#CBD5E1]">
        {GIG.body}
      </p>

      {/* Detail grid */}
      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
        {GIG.details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-[#1E293B] p-3">
            <Icon className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Chips */}
      <div className="relative z-10 mt-5 space-y-2">
        <Eyebrow color="text-[#94A3B8]">Looking for</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {GIG.chips.map((c) => <Chip key={c} variant="darkpink">{c}</Chip>)}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 flex-shrink-0 text-[#94A3B8]" aria-hidden="true" />
          <span className="truncate font-mono text-xs text-[#94A3B8]">{GIG.requestContext}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StageFlip() {
  const [side, setSide] = useState<Side>("musician");
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 150, damping: 20 });

  // Parallax rotates around the current side's base angle
  const baseAngle = side === "musician" ? 0 : 180;
  const rotateY = useTransform(springX, [-0.5, 0.5], [baseAngle - 10, baseAngle + 10]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);

  // Idle tilt (oscillates ±4° Y, ±2° X when no hover)
  const [isHovering, setIsHovering] = useState(false);
  const [idleTick, setIdleTick] = useState(0);

  useEffect(() => {
    if (reduced || isHovering) return;
    const id = setInterval(() => setIdleTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, [reduced, isHovering]);

  const idleRotateY = reduced || isHovering ? 0 : Math.sin(idleTick * 0.017) * 4;
  const idleRotateX = reduced || isHovering ? 0 : Math.cos(idleTick * 0.011) * 2;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    setIsHovering(false);
  }

  function flip() {
    setSide((s) => (s === "musician" ? "gig" : "musician"));
  }

  const cardLabel =
    side === "musician"
      ? "Flip preview. Currently showing musician profile."
      : "Flip preview. Currently showing gig listing.";

  const helperLink = side === "musician"
    ? <><Link href="/musicians" className="underline-offset-4 hover:underline text-[#0055FF]">/musicians</Link></>
    : <><Link href="/gigs" className="underline-offset-4 hover:underline text-[#0055FF]">/gigs</Link></>;

  return (
    <section className="relative z-20 bg-[#FAFAFA] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

          {/* ── Left column ── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Eyebrow>Two-sided stage</Eyebrow>
              <h2 className="text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
                One toggle. Both sides of the marquee.
              </h2>
              <p className="max-w-md text-lg font-medium leading-relaxed text-[#475569]">
                Musicians publish a profile. Creators post a gig. Nobody DMs into the void.
              </p>
            </div>

            {/* Toggle */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#F1F5F9] bg-white p-1 shadow-sm">
                {(["musician", "gig"] as Side[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className="relative h-11 rounded-full px-6 text-sm font-bold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                    style={{ color: side === s ? "white" : "#475569" }}
                  >
                    {side === s && (
                      <motion.div
                        layoutId="stage-flip-thumb"
                        className="absolute inset-0 rounded-full bg-[#0F172A]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {s === "musician" ? "Find a musician" : "Find a gig"}
                    </span>
                  </button>
                ))}
              </div>

              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#64748B]">
                Tap to flip. Sample profile. Real ones live at {helperLink}.
              </p>
            </div>
          </div>

          {/* ── Right column: card ── */}
          <div className="lg:col-span-7">
            <motion.div
              ref={wrapperRef}
              className="group relative"
              style={{ perspective: "1400px" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={flip}
                aria-pressed={side === "gig"}
                aria-label={cardLabel}
                className="w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055FF] focus-visible:ring-offset-4 rounded-3xl"
              >
                <motion.div
                  className="relative aspect-[5/6] w-full md:aspect-[4/5]"
                  style={{
                    transformStyle: "preserve-3d",
                    rotateY: isHovering && !reduced ? rotateY : baseAngle + idleRotateY,
                    rotateX: isHovering && !reduced ? rotateX : idleRotateX,
                  }}
                  animate={{ rotateY: baseAngle }}
                  transition={{ duration: 0.9, ease }}
                >
                  <MusicianFace />
                  <GigFace />
                </motion.div>
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
