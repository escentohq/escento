"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, PlayCircle, Plus, Sparkles } from "lucide-react";

import { StageLightsScene } from "@/components/home/StageLightsScene";

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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 -mt-6 min-h-screen w-screen -translate-x-1/2 overflow-hidden bg-[#FAFAFA] font-sans text-[#0F172A] selection:bg-[#0055FF] selection:text-white"
    >
      <StageLightsScene />

      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden px-6 pt-24">
        <motion.div
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[#475569] md:text-xl"
          >
            The social network for student musicians and creators. Find your next
            collaborator, book a gig, or see who is making noise on campus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <Link
              href="/musicians"
              className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0F172A] px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF] sm:w-auto"
            >
              <span className="relative z-10">Browse Musicians</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-linear-to-r from-[#0055FF] to-[#FF3366] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            <Link
              href={secondaryHref}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-8 text-sm font-bold tracking-wide text-[#0F172A] transition-colors hover:border-[#0F172A] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {secondaryLabel}
            </Link>
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

      <section className="relative z-20 border-t border-[#F1F5F9] bg-white px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Spotlight",
                desc: "Browse a curated feed of student talent. No account needed to look around.",
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
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-3xl border border-[#F1F5F9] bg-[#F8FAFC] p-8 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-[#0055FF]/5"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span
                    className={`font-mono text-4xl font-black opacity-20 transition-opacity group-hover:opacity-100 ${step.color}`}
                  >
                    {step.num}
                  </span>
                  <step.icon
                    className={`h-8 w-8 opacity-40 transition-opacity group-hover:opacity-100 ${step.color}`}
                  />
                </div>
                <h2 className="mb-3 text-2xl font-bold">{step.title}</h2>
                <p className="font-medium leading-relaxed text-[#64748B]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 border-t border-[#F1F5F9] bg-[#F8FAFC] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <span className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
              Now playing
            </span>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Featured Talent
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/10"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#0055FF]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] font-bold text-[#0F172A]">
                    MC
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">Maya Chen</h3>
                    <p className="text-sm font-mono text-[#64748B]">
                      Piano • Film Scoring
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
                  Available
                </span>
              </div>

              <p className="relative z-10 mb-8 font-medium leading-relaxed text-[#475569]">
                UT Austin junior. Film scoring focus. Has tracked on four student
                shorts this semester. Strong with jazz and orchestral cues.
              </p>

              <Link
                href="/musicians"
                className="relative z-10 flex w-full items-center justify-between rounded-2xl bg-[#F8FAFC] p-4 transition-colors group-hover:bg-[#0055FF] group-hover:text-white"
              >
                <span className="text-sm font-bold">View Musicians</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/20"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E293B]">
                    <PlayCircle className="h-6 w-6 text-[#FF3366]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">
                      Short Film Score
                    </h3>
                    <p className="text-sm font-mono text-[#94A3B8]">
                      Film • Unpaid + Credit
                    </p>
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
                className="relative z-10 flex w-full items-center justify-between rounded-2xl bg-[#1E293B] p-4 transition-colors group-hover:bg-[#FF3366]"
              >
                <span className="text-sm font-bold">Browse Gigs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
