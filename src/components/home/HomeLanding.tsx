"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Music, Users, Zap, Mail } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PrimaryCta } from "@/components/ui/primary-cta";
import { SecondaryCta } from "@/components/ui/secondary-cta";
import { TheCallsheet } from "@/components/home/TheCallsheet";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

// ── Data ────────────────────────────────────────────────────────────────────

const SCHOOLS = [
  "UT Austin", "NYU", "USC Film", "Berklee", "UCLA", "Northwestern",
  "Juilliard", "Emerson", "UT Austin", "NYU", "USC Film", "Berklee",
];

const ACCOLADES = [
  { accent: "#0055FF", text: "No account needed to browse" },
  { accent: "#FF3366", text: "Direct email contact — no inbox" },
  { accent: "#FFB000", text: "Free for student musicians" },
  { accent: "#0055FF", text: "Post a gig in under 2 minutes" },
  { accent: "#FF3366", text: "No algorithms. No feed." },
  { accent: "#FFB000", text: "Built for campus collaboration" },
];

const HERO_TAGS = [
  { text: "Piano",        bg: "bg-[#0055FF]/10", fg: "text-[#0055FF]", x: "7%",  y: "22%", dur: 6, delay: 0   },
  { text: "Film Scoring", bg: "bg-[#FF3366]/10", fg: "text-[#FF3366]", x: "76%", y: "14%", dur: 7, delay: 0.4 },
  { text: "Guitar",       bg: "bg-[#FFB000]/10", fg: "text-[#FFB000]", x: "4%",  y: "68%", dur: 8, delay: 0.7 },
  { text: "Jazz",         bg: "bg-[#0055FF]/10", fg: "text-[#0055FF]", x: "80%", y: "68%", dur: 5, delay: 0.2 },
  { text: "Vocals",       bg: "bg-[#FF3366]/10", fg: "text-[#FF3366]", x: "86%", y: "38%", dur: 9, delay: 0.9 },
  { text: "Strings",      bg: "bg-[#FFB000]/10", fg: "text-[#FFB000]", x: "2%",  y: "44%", dur: 7, delay: 0.5 },
];

const VALUE_PROPS = [
  {
    icon: Users,
    title: "No account to browse.",
    body: "Open, find, email. No login gate between you and the musician you need.",
    accent: "#0055FF",
    bg: "bg-[#0055FF]/15",
  },
  {
    icon: Zap,
    title: "Post in two minutes.",
    body: "Describe the project, pick instruments and genres, hit publish. Done.",
    accent: "#FF3366",
    bg: "bg-[#FF3366]/15",
  },
  {
    icon: Mail,
    title: "Email direct. No inbox.",
    body: "Motivo never relays messages. You talk to the musician, not a bot.",
    accent: "#FFB000",
    bg: "bg-[#FFB000]/15",
  },
];

const STATS = [
  { value: "500+",  label: "Student Musicians", accent: "#0055FF" },
  { value: "1,200", label: "Gigs Posted",        accent: "#FF3366" },
  { value: "45",    label: "Campuses",            accent: "#FFB000" },
  { value: "3k+",   label: "Collaborations",      accent: "#0F172A" },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    eyebrow: "Spotlight",
    title: "Browse talent.",
    desc: "No account needed. Filter by instrument, genre, campus. Find who you need in under five minutes.",
    accent: "#0055FF",
    accentBg: "bg-[#0055FF]/10",
    accentText: "text-[#0055FF]",
    hoverShadow: "hover:shadow-[#0055FF]/8",
  },
  {
    num: "02",
    eyebrow: "Connect",
    title: "Email directly.",
    desc: "Every profile has contact info front and center. One click opens your mail client, subject pre-filled.",
    accent: "#FF3366",
    accentBg: "bg-[#FF3366]/10",
    accentText: "text-[#FF3366]",
    hoverShadow: "hover:shadow-[#FF3366]/8",
  },
  {
    num: "03",
    eyebrow: "Create",
    title: "Make the thing.",
    desc: "Film. Podcast. Live set. Game. You found your collaborator. Now go make something worth hearing.",
    accent: "#FFB000",
    accentBg: "bg-[#FFB000]/10",
    accentText: "text-[#FFB000]",
    hoverShadow: "hover:shadow-[#FFB000]/8",
  },
];

const TESTIMONIALS = [
  {
    quote: "Found a composer for my thesis short in two days. Sent one email. She was on set the next week.",
    name: "Alex Park",
    role: "Film · UT RTF",
    initials: "AP",
    variant: "light" as const,
    accent: "#0055FF",
    accentBg: "bg-[#0055FF]",
  },
  {
    quote: "First paid gig came through Motivo. A podcaster needed live guitar. Three sessions, $300, and a credit.",
    name: "Jordan Lee",
    role: "Guitar · Berklee",
    initials: "JL",
    variant: "dark" as const,
    accent: "#FF3366",
    accentBg: "bg-[#FF3366]/25",
    accentText: "text-[#FF3366]",
  },
];

// ── Trust marquee ────────────────────────────────────────────────────────────

function TrustMarquee() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease }}
      aria-label="Schools and platform features"
      className="relative z-20 overflow-hidden border-t border-[#F1F5F9] bg-white py-10"
    >
      <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
        Built for students at
      </p>

      {/* Schools row */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" aria-hidden />
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={reduced ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          style={paused ? { animationPlayState: "paused" } : {}}
          aria-hidden
        >
          {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-sm font-bold text-[#94A3B8]">
              <span className="h-1 w-1 rounded-full bg-[#E2E8F0]" />
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Accolades row */}
      <div
        className="relative mt-5 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" aria-hidden />
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={reduced ? {} : { x: ["-50%", "0%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          aria-hidden
        >
          {[...ACCOLADES, ...ACCOLADES].map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#475569]"
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: a.accent }} />
              {a.text}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

type HomeLandingProps = {
  secondaryHref: string;
  secondaryLabel: string;
  signedInLabel?: string | null;
};

export function HomeLanding({ secondaryHref, secondaryLabel, signedInLabel }: HomeLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 260]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-stat",
        { opacity: 0, y: 30, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".gsap-stats-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.fromTo(
        ".gsap-step",
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".gsap-steps-section",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 -mt-6 min-h-screen w-screen -translate-x-1/2 overflow-hidden bg-[#FAFAFA] font-sans text-[#0F172A] selection:bg-[#0055FF] selection:text-white"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden px-6 py-28">
        {/* Multi-point bg glow */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0055FF]/8 blur-[130px]" />
          <div className="absolute right-1/4 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[#FF3366]/6 blur-[110px]" />
          <div className="absolute bottom-1/4 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-[#FFB000]/5 blur-[90px]" />
        </div>

        {/* Floating instrument tags — desktop, decorative */}
        {!prefersReducedMotion &&
          HERO_TAGS.map((tag) => (
            <motion.span
              key={tag.text}
              aria-hidden
              className={`pointer-events-none absolute hidden rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider lg:inline-flex ${tag.bg} ${tag.fg}`}
              style={{ left: tag.x, top: tag.y }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: [0, 0.65, 0.65, 0.45, 0.65],
                y: [0, -10, 0, -6, 0],
                scale: 1,
              }}
              transition={{
                opacity: { duration: tag.dur, repeat: Infinity, delay: tag.delay + 0.8, ease: "easeInOut" },
                y: { duration: tag.dur, repeat: Infinity, ease: "easeInOut", delay: tag.delay },
                scale: { duration: 0.6, delay: tag.delay + 0.8, ease },
              }}
            >
              {tag.text}
            </motion.span>
          ))}

        <motion.div
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0055FF]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3366]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB000]" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
              Live and loud
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="text-6xl font-black leading-[0.93] tracking-tighter md:text-8xl lg:text-[10rem]"
          >
            Find your{" "}
            <span className="bg-linear-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000] bg-clip-text text-transparent">
              sound.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease }}
            className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-[#475569] md:text-xl"
          >
            Student musicians. Student creators. Campus gigs.
            No algorithms, no feed — just the people you need.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease }}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <PrimaryCta href="/musicians" className="w-full sm:w-auto">
              Browse Musicians
            </PrimaryCta>
            <SecondaryCta href={secondaryHref} className="w-full sm:w-auto">
              {secondaryLabel}
            </SecondaryCta>
          </motion.div>

          {/* Signed-in label */}
          {signedInLabel ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-5 rounded-full border border-[#E2E8F0] bg-white/80 px-4 py-2 text-xs font-medium text-[#64748B]"
            >
              Signed in as {signedInLabel}
            </motion.p>
          ) : null}

          {/* Ghost link to gigs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52, duration: 0.6 }}
            className="mt-5"
          >
            <Link
              href="/gigs"
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] transition-colors duration-200 hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
            >
              Browse open gigs
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stage Flip ───────────────────────────────────────────────────── */}
      <TheCallsheet />

      {/* ── Trust marquee ────────────────────────────────────────────────── */}
      <TrustMarquee />

      {/* ── Value props — dark band ──────────────────────────────────────── */}
      <section className="relative z-20 border-t border-white/5 bg-[#0F172A] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {VALUE_PROPS.map((prop) => (
              <motion.div
                key={prop.title}
                variants={fadeUp}
                className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-[#1E293B] p-8 transition-all duration-300 hover:border-white/10"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${prop.bg}`}
                >
                  <prop.icon className="h-5 w-5" style={{ color: prop.accent }} aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                  <p className="mt-2 font-medium leading-relaxed text-[#94A3B8]">{prop.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="gsap-stats-section relative z-20 border-t border-[#F1F5F9] bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="gsap-stat flex flex-col items-center text-center">
                <span
                  className="text-5xl font-black tracking-tighter md:text-6xl"
                  style={{ color: stat.accent }}
                >
                  {stat.value}
                </span>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="gsap-steps-section relative z-20 border-t border-[#F1F5F9] bg-[#F8FAFC] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <span className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
              The Process
            </span>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Three steps. Full stop.
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line — desktop only */}
            <div
              className="absolute left-1/6 right-1/6 top-9 hidden h-px bg-linear-to-r from-[#0055FF]/25 via-[#FF3366]/25 to-[#FFB000]/25 md:block"
              aria-hidden
            />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.num}
                  className={`gsap-step group relative rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl ${step.hoverShadow}`}
                >
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease }}>
                    <div className="mb-6 flex items-start justify-between">
                      <span
                        className="font-mono text-5xl font-black leading-none opacity-15 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ color: step.accent }}
                      >
                        {step.num}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${step.accentBg} ${step.accentText}`}>
                        {step.eyebrow}
                      </span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                    <p className="font-medium leading-relaxed text-[#64748B]">{step.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured talent ──────────────────────────────────────────────── */}
      <section className="relative z-20 border-t border-[#F1F5F9] bg-white px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <span className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
              Now playing
            </span>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              A taste of who&apos;s on stage.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {/* Light card — musician */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease }}
              className="group relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-[#F8FAFC] p-8 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-[#0055FF]/10"
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-linear-to-br from-[#0055FF]/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0055FF]/20 via-[#FF3366]/15 to-[#FFB000]/20">
                    <span className="text-lg font-black text-[#0F172A]">MR</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Maya Reyes</h3>
                    <p className="font-mono text-sm text-[#64748B]">Piano · Film Scoring</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
                  Available
                </span>
              </div>

              <p className="relative z-10 mb-6 font-medium leading-relaxed text-[#475569]">
                UT Austin junior. Film scoring focus. Tracked on four student
                shorts this semester. Comfortable with sparse cues and rough-cut turnarounds.
              </p>

              <div className="relative z-10 mb-8 flex flex-wrap gap-2">
                {["Guitar", "Piano", "Vocals"].map((t) => (
                  <span key={t} className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold text-[#0055FF]">
                    {t}
                  </span>
                ))}
                {["Indie", "Jazz", "Film scoring"].map((t) => (
                  <span key={t} className="rounded-full bg-[#FF3366]/10 px-3 py-1 text-xs font-bold text-[#FF3366]">
                    {t}
                  </span>
                ))}
              </div>

              <Link
                href="/musicians"
                className="relative z-10 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#F1F5F9] bg-white p-4 transition-all duration-300 group-hover:border-transparent group-hover:bg-[#0055FF] group-hover:text-white focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
              >
                <span className="text-sm font-bold">View Musicians</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.div>

            {/* Dark card — gig */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease }}
              className="group relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/15"
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#1E293B]">
                    <Music className="h-6 w-6 text-[#FF3366]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Composer for thesis short.</h3>
                    <p className="font-mono text-sm text-[#94A3B8]">Alex Park · Film, UT RTF</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0055FF]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
                  Open
                </span>
              </div>

              <p className="relative z-10 mb-6 font-medium leading-relaxed text-[#CBD5E1]">
                Rough cut ready. Need sparse orchestral cues — mostly strings.
                $200 flat, on-screen credit. Three-week turnaround.
              </p>

              <div className="relative z-10 mb-8 flex flex-wrap gap-2">
                {["Strings", "Piano"].map((t) => (
                  <span key={t} className="rounded-full bg-[#FF3366]/20 px-3 py-1 text-xs font-bold text-[#FF3366]">
                    {t}
                  </span>
                ))}
                <span className="rounded-full bg-[#FFB000]/15 px-3 py-1 text-xs font-bold text-[#FFB000]">
                  Paid
                </span>
              </div>

              <Link
                href="/gigs"
                className="relative z-10 flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#1E293B] p-4 transition-all duration-300 group-hover:bg-[#FF3366] focus-visible:outline-2 focus-visible:outline-[#FF3366] focus-visible:outline-offset-2"
              >
                <span className="text-sm font-bold">Browse Gigs</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="relative z-20 border-t border-[#F1F5F9] bg-[#F8FAFC] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <span className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
              On stage
            </span>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              From the people who used it.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {/* Light testimonial */}
            <motion.figure
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="group relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/10"
            >
              <span
                className="pointer-events-none absolute left-6 top-4 select-none text-9xl font-black leading-none text-[#0055FF]/8"
                aria-hidden
              >
                &ldquo;
              </span>
              <blockquote className="relative z-10 mt-8 text-xl font-bold leading-snug tracking-tight text-[#0F172A]">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </blockquote>
              <figcaption className="relative z-10 mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0055FF] text-xs font-black text-white">
                  {TESTIMONIALS[0].initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{TESTIMONIALS[0].name}</p>
                  <p className="font-mono text-xs text-[#64748B]">{TESTIMONIALS[0].role}</p>
                </div>
              </figcaption>
            </motion.figure>

            {/* Dark testimonial */}
            <motion.figure
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="group relative overflow-hidden rounded-3xl bg-[#0F172A] p-10 shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/15"
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-linear-to-br from-[#FF3366]/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute left-6 top-4 select-none text-9xl font-black leading-none text-[#FF3366]/12"
                aria-hidden
              >
                &ldquo;
              </span>
              <blockquote className="relative z-10 mt-8 text-xl font-bold leading-snug tracking-tight text-white">
                &ldquo;{TESTIMONIALS[1].quote}&rdquo;
              </blockquote>
              <figcaption className="relative z-10 mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF3366]/25 text-xs font-black text-[#FF3366]">
                  {TESTIMONIALS[1].initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{TESTIMONIALS[1].name}</p>
                  <p className="font-mono text-xs text-[#94A3B8]">{TESTIMONIALS[1].role}</p>
                </div>
              </figcaption>
            </motion.figure>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA — dark full-bleed ───────────────────────────────────── */}
      <section className="relative z-20 overflow-hidden bg-[#0F172A] px-6 py-36 text-center">
        {/* Bg glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/4 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0055FF]/12 blur-[110px]" />
          <div className="absolute right-1/4 top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-[#FF3366]/8 blur-[90px]" />
          <div className="absolute bottom-0 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[#FFB000]/6 blur-[70px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="mb-6 inline-block font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
              Get Started
            </span>
            <h2 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl">
              Ready to{" "}
              <span className="bg-linear-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000] bg-clip-text text-transparent">
                take the stage?
              </span>
            </h2>
            <p className="mb-12 text-lg font-medium leading-relaxed text-[#94A3B8] md:text-xl">
              Hundreds of student musicians and creators.
              One direct line between them. No middleman.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signin"
                className="group relative flex h-14 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 text-sm font-bold tracking-wide text-[#0F172A] transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_-10px_#0055FF] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:w-auto"
              >
                <span className="relative z-10">Sign In / Join</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                <div className="absolute inset-0 bg-linear-to-r from-[#0055FF]/10 to-[#FF3366]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>

              <Link
                href="/musicians"
                className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 text-sm font-bold tracking-wide text-white transition-all hover:border-white/50 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:w-auto"
              >
                Browse Talent
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
