"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, PlayCircle, Sparkles, Users, Music, Star, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PrimaryCta } from "@/components/ui/primary-cta";
import { SecondaryCta } from "@/components/ui/secondary-cta";
import { StageFlip } from "@/components/home/StageFlip";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;

const stepVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const stepItemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const cardVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease } },
};

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

function TrustMarquee() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease }}
      className="relative z-20 overflow-hidden border-t border-[#F1F5F9] bg-white py-10"
    >
      {/* Eyebrow */}
      <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
        Built for students at
      </p>

      {/* Schools marquee */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" />

        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={reduced ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          style={paused ? { animationPlayState: "paused" } : {}}
        >
          {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 text-sm font-bold text-[#94A3B8] transition-colors duration-300 hover:text-[#0F172A]"
            >
              <span className="h-1 w-1 rounded-full bg-[#E2E8F0]" aria-hidden="true" />
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Accolades marquee — reverse direction */}
      <div
        className="relative mt-5 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" />

        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={reduced ? {} : { x: ["-50%", "0%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {[...ACCOLADES, ...ACCOLADES].map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#475569]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: a.accent }}
                aria-hidden="true"
              />
              {a.text}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

type HomeLandingProps = {
  secondaryHref: string;
  secondaryLabel: string;
  signedInLabel?: string | null;
};

export function HomeLanding({
  secondaryHref,
  secondaryLabel,
  signedInLabel,
}: HomeLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Framer scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 260],
  );
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Featured section: horizontal nudge on cards
      gsap.fromTo(
        ".gsap-featured-card",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".gsap-featured-section",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 -mt-6 min-h-screen w-screen -translate-x-1/2 overflow-hidden bg-[#FAFAFA] font-sans text-[#0F172A] selection:bg-[#0055FF] selection:text-white"
    >
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden px-6 py-24"
      >
        {/* Subtle background glow for the hero instead of 3D scene */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-[#0055FF]/10 via-[#FF3366]/5 to-[#FFB000]/10 blur-[100px] pointer-events-none" aria-hidden />

        <motion.div
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0055FF]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF3366] delay-75" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFB000] delay-150" />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
              Live and loud
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="text-6xl font-black leading-[0.95] tracking-tighter md:text-8xl"
          >
            Take the{" "}
            <span className="bg-linear-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000] bg-clip-text text-transparent">
              Stage.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[#475569] md:text-xl"
          >
            The platform for student musicians and creators. Find your next
            collaborator, post a gig, or get discovered on campus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <PrimaryCta href="/musicians" className="w-full sm:w-auto">
              Browse Musicians
            </PrimaryCta>

            <SecondaryCta href={secondaryHref} className="w-full sm:w-auto">
              {secondaryLabel}
            </SecondaryCta>
          </motion.div>

          {signedInLabel ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-5 rounded-full border border-[#E2E8F0] bg-white/80 px-4 py-2 text-xs font-medium text-[#64748B]"
            >
              Signed in as {signedInLabel}
            </motion.p>
          ) : null}
        </motion.div>
      </section>

      <StageFlip />

      {/* ── Trust bar ── */}
      <TrustMarquee />

      {/* ── Stats / Proof ── */}
      <section className="relative z-20 border-t border-[#F1F5F9] bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={stepVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {[
              { label: "Student Musicians", value: "500+", icon: Users, color: "text-[#0055FF]" },
              { label: "Gigs Posted", value: "1,200", icon: Music, color: "text-[#FF3366]" },
              { label: "Campuses", value: "45", icon: Star, color: "text-[#FFB000]" },
              { label: "Collaborations", value: "3k+", icon: Zap, color: "text-[#0F172A]" },
            ].map((stat, i) => (
              <motion.div key={i} variants={stepItemVariants} className="flex flex-col items-center text-center">
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F8FAFC] ${stat.color}`}>
                  <stat.icon className="h-8 w-8" aria-hidden />
                </div>
                <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
                <p className="mt-2 font-medium text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
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
              How it works
            </h2>
          </motion.div>

          <motion.div
            variants={stepVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-12 md:grid-cols-3"
          >
            {[
              {
                num: "01",
                title: "Spotlight",
                desc: "Browse student talent. No account needed to look around.",
                icon: PlayCircle,
                color: "text-[#0055FF]",
              },
              {
                num: "02",
                title: "Connect",
                desc: "Found the right sound? Email and socials stay front and center.",
                icon: Sparkles,
                color: "text-[#FF3366]",
              },
              {
                num: "03",
                title: "Create",
                desc: "Book them for your film, band, podcast, or event. That is the loop.",
                icon: ArrowRight,
                color: "text-[#FFB000]",
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={stepItemVariants}
                className="gsap-step group relative rounded-3xl border border-[#F1F5F9] bg-white p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0055FF]/5"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <span
                      className={`font-mono text-4xl font-black opacity-20 transition-opacity group-hover:opacity-100 ${step.color}`}
                    >
                      {step.num}
                    </span>
                    <step.icon
                      className={`h-8 w-8 opacity-40 transition-opacity group-hover:opacity-100 ${step.color}`}
                      aria-hidden
                    />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold">{step.title}</h2>
                  <p className="font-medium leading-relaxed text-[#64748B]">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Talent ── */}
      <section className="gsap-featured-section relative z-20 border-t border-[#F1F5F9] bg-white px-6 py-28">
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
              Featured Talent
            </h2>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {/* Light card */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease }}
              className="gsap-featured-card group relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-[#F8FAFC] p-8 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-[#0055FF]/10"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#0055FF]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0] font-bold text-[#0F172A]">
                    MC
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Maya Chen</h3>
                    <p className="font-mono text-sm text-[#64748B]">Piano · Film Scoring</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
                  Available
                </span>
              </div>

              <p className="relative z-10 mb-8 font-medium leading-relaxed text-[#475569]">
                UT Austin junior. Film scoring focus. Tracked on four student
                shorts this semester. Strong with jazz and orchestral cues.
              </p>

              <Link
                href="/musicians"
                className="relative z-10 flex w-full items-center justify-between rounded-2xl bg-white p-4 transition-colors group-hover:bg-[#0055FF] group-hover:text-white focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 border border-[#F1F5F9] group-hover:border-transparent"
              >
                <span className="text-sm font-bold">View Musicians</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>

            {/* Dark card */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease }}
              className="gsap-featured-card group relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/20"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E293B]">
                    <PlayCircle className="h-6 w-6 text-[#FF3366]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Short Film Score</h3>
                    <p className="font-mono text-sm text-[#94A3B8]">Film · Unpaid + Credit</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#FF3366]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF3366]">
                  Open
                </span>
              </div>

              <p className="relative z-10 mb-8 font-medium leading-relaxed text-[#CBD5E1]">
                Need someone who can write sparse orchestral cues. Rough cut ready.
                Three-week turnaround. Great for portfolio building.
              </p>

              <Link
                href="/gigs"
                className="relative z-10 flex w-full items-center justify-between rounded-2xl bg-[#1E293B] p-4 transition-colors group-hover:bg-[#FF3366] focus-visible:outline-2 focus-visible:outline-[#FF3366] focus-visible:outline-offset-2"
              >
                <span className="text-sm font-bold">Browse Gigs</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-20 border-t border-[#F1F5F9] bg-[#FAFAFA] px-6 py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="mb-4 inline-block font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
              Get Started
            </span>
            <h2 className="mb-6 text-4xl font-black tracking-tight md:text-6xl">
              Ready to take the stage?
            </h2>
            <p className="mb-10 text-lg font-medium text-[#475569]">
              Join hundreds of student musicians and creators finding their next collaboration today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PrimaryCta href="/signin" className="w-full sm:w-auto">
                Sign In / Join
              </PrimaryCta>
              <SecondaryCta href="/musicians" className="w-full sm:w-auto">
                Browse Talent
              </SecondaryCta>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
