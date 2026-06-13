"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EscentoMark } from "@/components/ui/brand";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  useInView,
  animate,
  type Transition,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Film,
  MessageCircle,
  Search,
  Star,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

const ease = [0.16, 1, 0.3, 1] as const;
const STEP_COUNT = 5;

// ---------------------------------------------------------------------------
// Story data — adapted to Escento's two-sided campus marketplace. We follow two
// real mock personas (reused from the landing page proof cards) as the gap
// between them closes: a film student who needs a composer, and a pianist who
// needs the work.
// ---------------------------------------------------------------------------

type Step = {
  id: string;
  label: string;
  headline: string;
  support: string;
  insight: string;
  accent: string;
  accentText: string;
};

const STEPS: Step[] = [
  {
    id: "soundcheck",
    label: "Soundcheck",
    headline: "Missed each other.",
    support:
      "A film student needs a composer. A pianist needs the work. Neither one knows the other exists.",
    insight: "Word of mouth only travels so far.",
    accent: "#64748B",
    accentText: "text-[#64748B]",
  },
  {
    id: "clarity",
    label: "Clarity",
    headline: "On the board.",
    support:
      "Post the gig in two minutes. Build the profile once. The noise turns into a list you can actually read.",
    insight: "Quick sign-in. Then browse the board.",
    accent: "#0055FF",
    accentText: "text-[#0055FF]",
  },
  {
    id: "fit",
    label: "The fit",
    headline: "The right fit.",
    support:
      "Piano. Strings. Film scoring. UT Austin. The specifics line up — and you see exactly why.",
    insight: "No feed. No algorithm. You pick.",
    accent: "#FF3366",
    accentText: "text-[#FF3366]",
  },
  {
    id: "connection",
    label: "Connection",
    headline: "One message.",
    support:
      "Send a request. They accept. The thread opens — and every reply stays in one place.",
    insight: "Request, accept, talk. All in Escento.",
    accent: "#0055FF",
    accentText: "text-[#0055FF]",
  },
  {
    id: "outcome",
    label: "On screen",
    headline: "On screen.",
    support:
      "Two days to the first reply. $200 and an on-screen credit. A thesis short, scored.",
    insight: "Talent met need. Both took the stage.",
    accent: "#FFB000",
    accentText: "text-[#FFB000]",
  },
];

const SHARED_TAGS = ["Piano", "Strings", "Film scoring"];

// ---------------------------------------------------------------------------
// Count-up metric. Gated so it only runs when its step is on screen.
// ---------------------------------------------------------------------------

function CountUp({
  to,
  gate = true,
  prefix = "",
  suffix = "",
}: {
  to: number;
  gate?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const hasRun = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduced || !(inView && gate) || hasRun.current) return;
    hasRun.current = true;
    const controls = animate(0, to, {
      duration: 1.2,
      ease,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, gate, reduced, to]);

  const display = reduced ? to : Math.round(val);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Left-column copy for one step (the swapping narrative).
// ---------------------------------------------------------------------------

function StepCopy({
  step,
  index,
  showCta,
}: {
  step: Step;
  index: number;
  showCta?: boolean;
}) {
  return (
    <>
      <span
        className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${step.accentText}`}
      >
        {String(index + 1).padStart(2, "0")} · {step.label}
      </span>

      <h3 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight text-[#0F172A] md:text-5xl lg:text-6xl">
        {step.headline}
      </h3>

      <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-[#475569] md:text-lg">
        {step.support}
      </p>

      <div className="mt-7 flex items-start gap-3">
        <span
          className="mt-1 h-5 w-1 flex-shrink-0 rounded-full"
          style={{ backgroundColor: step.accent }}
          aria-hidden
        />
        <p className="text-sm font-bold leading-snug text-[#0F172A] md:text-base">
          {step.insight}
        </p>
      </div>

      {showCta ? (
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/musicians"
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] transition-colors duration-200 hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Browse musicians
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
          <Link
            href="/gigs"
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] transition-colors duration-200 hover:text-[#FF3366] focus-visible:outline-2 focus-visible:outline-[#FF3366] focus-visible:outline-offset-2"
          >
            Browse gigs
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Small pieces of the product canvas.
// ---------------------------------------------------------------------------

function Tag({
  label,
  matched,
  lit,
}: {
  label: string;
  matched?: boolean;
  lit?: boolean;
}) {
  const cls = lit
    ? "bg-[#FF3366] text-white"
    : matched
      ? "bg-[#FF3366]/10 text-[#FF3366]"
      : "bg-[#0055FF]/10 text-[#0055FF]";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold leading-none transition-colors duration-500 ${cls}`}
    >
      {label}
    </span>
  );
}

function GigCard({ highlight, filled }: { highlight: boolean; filled: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#F1F5F9] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#1E293B]">
            <Film className="h-4 w-4 text-[#FF3366]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold leading-tight text-[#0F172A]">
              Composer — thesis short.
            </p>
            <p className="truncate font-mono text-[10px] text-[#64748B]">
              Alex · Film, UT RTF
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${
            filled
              ? "bg-[#FF3366]/10 text-[#FF3366]"
              : "bg-[#0055FF]/10 text-[#0055FF]"
          }`}
        >
          {filled ? "Filled" : "Open"}
        </span>
      </div>

      <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#475569]">
        Sparse strings. $200 flat, on-screen credit. Three-week turnaround.
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        <Tag label="Strings" matched lit={highlight} />
        <Tag label="Piano" matched lit={highlight} />
        <span className="rounded-full bg-[#FFB000]/10 px-2.5 py-1 text-[11px] font-bold leading-none text-[#FFB000]">
          Paid
        </span>
      </div>
    </div>
  );
}

function ProfileCard({
  highlight,
  booked,
}: {
  highlight: boolean;
  booked: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#F1F5F9] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0055FF]/20 via-[#FF3366]/15 to-[#FFB000]/20 text-[10px] font-black text-[#0F172A]">
            MR
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold leading-tight text-[#0F172A]">
              Maya Reyes
            </p>
            <p className="truncate font-mono text-[10px] text-[#64748B]">
              Piano · Film scoring
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${
            booked
              ? "bg-[#FFB000]/10 text-[#FFB000]"
              : "bg-[#0055FF]/10 text-[#0055FF]"
          }`}
        >
          {booked ? "Booked" : "Available"}
        </span>
      </div>

      <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#475569]">
        UT Austin junior. Film scoring focus. Scored four student shorts this term.
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        <Tag label="Piano" matched lit={highlight} />
        <Tag label="Strings" matched lit={highlight} />
        <Tag label="Film scoring" matched lit={highlight} />
        <Tag label="Jazz" />
      </div>
    </div>
  );
}

function Bubble({
  side,
  active,
  reduced,
  delay,
  children,
}: {
  side: "left" | "right";
  active: number;
  reduced: boolean;
  delay: number;
  children: React.ReactNode;
}) {
  const isLeft = side === "left";
  const offset = reduced ? 0 : isLeft ? -10 : 10;
  return (
    <motion.div
      initial={false}
      animate={{ x: active === 3 ? 0 : offset, opacity: active === 3 ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease, delay }}
      className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <span
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] font-medium leading-snug ${
          isLeft
            ? "rounded-bl-sm bg-[#F1F5F9] text-[#475569]"
            : "rounded-br-sm bg-[#0055FF] text-white"
        }`}
      >
        {children}
      </span>
    </motion.div>
  );
}

function NoiseBubble({
  className,
  children,
  tone = "muted",
}: {
  className: string;
  children: React.ReactNode;
  tone?: "muted" | "alert";
}) {
  const toneCls =
    tone === "alert"
      ? "border-[#FF3366]/20 bg-[#FF3366]/10 text-[#FF3366]"
      : "border-[#F1F5F9] bg-[#F8FAFC] text-[#94A3B8]";
  return (
    <span
      className={`absolute inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${toneCls} ${className}`}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The product canvas. One continuous Escento app frame whose layers evolve with
// the active step — it never hard-swaps between unrelated screens.
// ---------------------------------------------------------------------------

function StageCanvas({
  active,
  reduced,
  snapshot = false,
  countGate,
}: {
  active: number;
  reduced: boolean;
  snapshot?: boolean;
  countGate: boolean;
}) {
  const t: Transition =
    snapshot || reduced ? { duration: 0 } : { duration: 0.6, ease };
  const structVisible = active >= 1;
  const highlight = active >= 2;

  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden>
      {/* Behind-frame glow, tinted by the active step */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ backgroundColor: STEPS[active].accent }}
        transition={t}
        className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-[90px]"
      />

      {/* App frame */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white shadow-xl shadow-[#0055FF]/5">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFB000]/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0055FF]/40" />
          </div>
          <span className="flex items-center gap-1.5 text-sm font-black tracking-tight text-[#0F172A]">
            <EscentoMark className="h-3.5 w-auto" />
            escento
          </span>
          <span className="ml-auto font-mono text-[11px] text-[#94A3B8]">
            escento.com
          </span>
        </div>

        {/* Board */}
        <div className="relative h-[440px] p-4">
          {/* Connectors drawn during the "fit" step */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <motion.path
              d="M30 47 C 36 62, 46 66, 50 70"
              fill="none"
              stroke="#FF3366"
              strokeWidth="0.5"
              strokeLinecap="round"
              initial={false}
              animate={{
                pathLength: active === 2 ? 1 : 0,
                opacity: active === 2 ? 0.5 : 0,
              }}
              transition={t}
            />
            <motion.path
              d="M70 47 C 64 62, 54 66, 50 70"
              fill="none"
              stroke="#FF3366"
              strokeWidth="0.5"
              strokeLinecap="round"
              initial={false}
              animate={{
                pathLength: active === 2 ? 1 : 0,
                opacity: active === 2 ? 0.5 : 0,
              }}
              transition={t}
            />
          </svg>

          {/* Spotlight glow for the fit */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: active === 2 ? 0.7 : 0 }}
            transition={t}
            className="absolute left-1/2 top-[74%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF3366]/20 blur-[50px]"
          />

          {/* Step 0 — the noise of word of mouth */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: active === 0 ? 1 : 0 }}
            transition={t}
            className="absolute inset-0 p-4"
          >
            <NoiseBubble className="left-2 top-6">
              <MessageCircle className="h-3 w-3" /> anyone know a film composer?
            </NoiseBubble>
            <NoiseBubble className="right-3 top-24">
              asked around. nothing back.
            </NoiseBubble>
            <NoiseBubble
              className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              tone="alert"
            >
              Rough cut due · 3 weeks
            </NoiseBubble>
            <span className="absolute bottom-8 right-4 inline-flex flex-col gap-1 rounded-2xl border border-dashed border-[#E2E8F0] bg-white/60 px-3 py-2">
              <span className="text-[11px] font-bold text-[#94A3B8]">
                Maya Reyes
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#CBD5E1]">
                unseen
              </span>
            </span>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={false}
            animate={{
              opacity: structVisible ? 1 : 0,
              y: structVisible ? 0 : -8,
            }}
            transition={t}
            className="absolute inset-x-4 top-4 flex items-center gap-1.5 overflow-hidden"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#94A3B8]" aria-hidden />
            {[
              { k: "Piano" },
              { k: "Film scoring" },
              { k: "UT Austin" },
            ].map((f) => (
              <span
                key={f.k}
                className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors duration-500 ${
                  highlight
                    ? "border-[#FF3366]/30 bg-[#FF3366]/10 text-[#FF3366]"
                    : "border-[#F1F5F9] bg-[#F8FAFC] text-[#64748B]"
                }`}
              >
                {f.k}
              </span>
            ))}
          </motion.div>

          {/* The two cards */}
          <motion.div
            initial={false}
            animate={{
              opacity: structVisible ? 1 : 0,
              y: structVisible ? 0 : 12,
            }}
            transition={t}
            className="absolute inset-x-4 top-16 grid h-[150px] grid-cols-2 gap-3"
          >
            <GigCard highlight={highlight} filled={active >= 4} />
            <ProfileCard highlight={highlight} booked={active >= 4} />
          </motion.div>

          {/* Connection zone — evolves beneath the cards */}
          <div className="absolute inset-x-4 bottom-4 top-[230px]">
            {/* Step 1 — browsing */}
            <motion.div
              initial={false}
              animate={{ opacity: active === 1 ? 1 : 0 }}
              transition={t}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-1.5 text-[11px] font-bold text-[#64748B]">
                <Search className="h-3 w-3" aria-hidden />
                Signed in and browsing the board
              </span>
            </motion.div>

            {/* Step 2 — the fit */}
            <motion.div
              initial={false}
              animate={{ opacity: active === 2 ? 1 : 0, y: active === 2 ? 0 : 8 }}
              transition={t}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF3366] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Matched
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {SHARED_TAGS.map((tg) => (
                  <span
                    key={tg}
                    className="rounded-full bg-[#FF3366]/10 px-2.5 py-1 text-[11px] font-bold text-[#FF3366]"
                  >
                    {tg}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">
                No feed. No algorithm.
              </span>
            </motion.div>

            {/* Step 3 — the conversation */}
            <motion.div
              initial={false}
              animate={{ opacity: active === 3 ? 1 : 0 }}
              transition={t}
              className="absolute inset-0 flex flex-col justify-center gap-1.5"
            >
              <div className="mb-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#0055FF]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Request accepted
              </div>
              <Bubble side="left" active={active} reduced={reduced} delay={0.05}>
                Rough cut&rsquo;s ready — sparse strings, mostly. Free this month?
              </Bubble>
              <Bubble side="right" active={active} reduced={reduced} delay={0.15}>
                Yes. Send the cut over.
              </Bubble>
            </motion.div>

            {/* Step 4 — the outcome */}
            <motion.div
              initial={false}
              animate={{ opacity: active === 4 ? 1 : 0, y: active === 4 ? 0 : 8 }}
              transition={t}
              className="absolute inset-0 flex flex-col justify-center gap-2.5"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2">
                <Star className="h-4 w-4 flex-shrink-0 text-[#FFB000]" aria-hidden />
                <span className="text-[12px] font-bold leading-tight text-[#0F172A]">
                  Original score — student short (dir. A. Park)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-[#F1F5F9] bg-white p-2.5 text-center">
                  <p className="text-xl font-black tracking-tight text-[#0055FF]">
                    <CountUp to={2} gate={countGate} />
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                    Days to reply
                  </p>
                </div>
                <div className="rounded-2xl border border-[#F1F5F9] bg-white p-2.5 text-center">
                  <p className="text-xl font-black tracking-tight text-[#FFB000]">
                    <CountUp to={200} prefix="$" gate={countGate} />
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                    Plus credit
                  </p>
                </div>
                <div className="rounded-2xl border border-[#F1F5F9] bg-white p-2.5 text-center">
                  <p className="text-xl font-black tracking-tight text-[#FF3366]">
                    <CountUp to={1} gate={countGate} />
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                    Short scored
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop: scroll-pinned story.
// ---------------------------------------------------------------------------

function PinnedStory() {
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEP_COUNT - 1, Math.max(0, Math.floor(v * STEP_COUNT)));
    setActive(idx);
  });

  const step = STEPS[active];

  return (
    <div ref={scrollRef} className="relative h-[500vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-6">
          {/* Left — narrative */}
          <div className="relative">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
              How it works
            </span>

            <div className="relative mt-6 min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <StepCopy step={step} index={active} showCta={active === 4} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress rail */}
            <div className="mt-10 flex items-center gap-2" aria-hidden>
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]"
                >
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: s.accent, originX: 0 }}
                    initial={false}
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={{ duration: 0.4, ease }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Right — product canvas */}
          <StageCanvas
            active={active}
            reduced={reduced}
            countGate={active === 4}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile / reduced-motion: stacked story. Same narrative, no pinning.
// ---------------------------------------------------------------------------

function StackedStory({ reduced }: { reduced: boolean }) {
  return (
    <div className="mx-auto max-w-2xl space-y-20 px-6 py-20">
      {STEPS.map((step, i) => (
        <Reveal key={step.id}>
          <div>
            <StepCopy step={step} index={i} showCta={i === STEP_COUNT - 1} />
            <div className="mt-8">
              <StageCanvas
                active={i}
                reduced={reduced}
                snapshot
                countGate
              />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section shell — picks the pinned experience on desktop with motion enabled,
// and the stacked experience everywhere else. Renders the stacked layout during
// SSR / first paint to avoid hydration mismatch and layout jumps.
// ---------------------------------------------------------------------------

function subscribeDesktop(callback: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function ProductStory() {
  const reduced = useReducedMotion() ?? false;
  // useSyncExternalStore reads the media query without a setState-in-effect.
  // The server snapshot is false, so SSR / first paint render the stacked
  // layout, then desktop upgrades to the pinned experience after hydration.
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );

  const usePinned = isDesktop && !reduced;

  return (
    <section
      aria-label="How Escento works"
      className="relative z-20 bg-[#FAFAFA] text-[#0F172A]"
    >
      {/* Shared intro */}
      <div className="mx-auto max-w-6xl px-6 pt-24 text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
          How it works
        </span>
        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
          Watch the gap close.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-[#475569] md:text-lg">
          A creator needs a sound. A musician needs the stage. Here is the part
          in between.
        </p>
      </div>

      {usePinned ? <PinnedStory /> : <StackedStory reduced={reduced} />}
    </section>
  );
}
