"use client";

import {
  motion,
  useReducedMotion,
  useInView,
} from "framer-motion";
import Link from "next/link";
import { Music, Video, MapPin, BadgeDollarSign, ArrowRight, Radio } from "lucide-react";
import { useRef } from "react";

// Sample data

const CARDS = [
  {
    id: "m1",
    type: "musician" as const,
    initials: "MR",
    name: "Maya Reyes",
    sub: "Guitar · Piano · Vocals",
    tags: ["Indie", "Film scoring"],
    meta: "Austin, TX",
    metaIcon: MapPin,
    rotate: -2.4,
    href: "/musicians",
  },
  {
    id: "g1",
    type: "gig" as const,
    title: "Composer for thesis short",
    sub: "Alex Park · RTF",
    tags: ["Strings", "Piano"],
    meta: "Paid · $200",
    metaIcon: BadgeDollarSign,
    rotate: 1.7,
    href: "/gigs",
  },
  {
    id: "m2",
    type: "musician" as const,
    initials: "JC",
    name: "Jordan Chen",
    sub: "Drums · Bass · Production",
    tags: ["Jazz", "Hip-hop"],
    meta: "Remote",
    metaIcon: MapPin,
    rotate: -1.1,
    href: "/musicians",
  },
  {
    id: "g2",
    type: "gig" as const,
    title: "Sound design for podcast",
    sub: "Sam Rivera · Media",
    tags: ["Ambient", "Sound design"],
    meta: "Revenue share",
    metaIcon: BadgeDollarSign,
    rotate: 2.2,
    href: "/gigs",
  },
  {
    id: "m3",
    type: "musician" as const,
    initials: "PN",
    name: "Priya Nair",
    sub: "Violin · Cello",
    tags: ["Classical", "Crossover"],
    meta: "Austin, TX",
    metaIcon: MapPin,
    rotate: -0.7,
    href: "/musicians",
  },
  {
    id: "g3",
    type: "gig" as const,
    title: "Score for 6-episode web series",
    sub: "Taylor Brooks · Film",
    tags: ["Orchestral", "Electronic"],
    meta: "Paid · $500",
    metaIcon: BadgeDollarSign,
    rotate: 1.3,
    href: "/gigs",
  },
] as const;

// Card

type CardData = (typeof CARDS)[number];

function CallCard({ card, index, reduced }: { card: CardData; index: number; reduced: boolean }) {
  const isMusician = card.type === "musician";
  const MetaIcon = card.metaIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotate: reduced ? 0 : card.rotate }}
      whileInView={{ opacity: 1, y: 0, rotate: reduced ? 0 : card.rotate }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        reduced
          ? {}
          : { rotate: 0, y: -10, scale: 1.03, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
      }
      className="group relative"
      style={{ transformOrigin: "center bottom" }}
    >
      <Link
        href={card.href}
        className={[
          "relative flex flex-col gap-4 rounded-2xl p-6 shadow-md transition-shadow duration-300",
          "focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2",
          isMusician
            ? "border border-[#F1F5F9] bg-white group-hover:shadow-[0_16px_48px_-12px_rgba(0,85,255,0.18)]"
            : "border border-white/5 bg-[#1E293B] group-hover:shadow-[0_16px_48px_-12px_rgba(255,51,102,0.2)]",
        ].join(" ")}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          {isMusician ? (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#E2E8F0]">
              <span className="text-base font-black text-[#0F172A]">
                {"initials" in card ? card.initials : ""}
              </span>
            </div>
          ) : (
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FF3366]/10">
              <Video className="h-5 w-5 text-[#FF3366]" aria-hidden />
            </span>
          )}
          <span
            className={[
              "rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em]",
              isMusician
                ? "bg-[#0055FF]/10 text-[#0055FF]"
                : "bg-[#FF3366]/20 text-[#FF3366]",
            ].join(" ")}
          >
            {isMusician ? "Available" : "Open"}
          </span>
        </div>

        {/* Title / name */}
        <div>
          <p
            className={[
              "text-lg font-black leading-tight tracking-tight",
              isMusician ? "text-[#0F172A]" : "text-white",
            ].join(" ")}
          >
            {"name" in card ? card.name : card.title}
          </p>
          <p
            className={[
              "mt-0.5 font-mono text-xs",
              isMusician ? "text-[#64748B]" : "text-[#94A3B8]",
            ].join(" ")}
          >
            {"sub" in card ? card.sub : ""}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className={[
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                isMusician
                  ? "bg-[#F1F5F9] text-[#475569]"
                  : "bg-white/5 text-[#CBD5E1]",
              ].join(" ")}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Meta row + CTA */}
        <div className="mt-auto flex items-center justify-between border-t pt-4"
          style={{ borderColor: isMusician ? "#F1F5F9" : "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5">
            <MetaIcon
              className={["h-3.5 w-3.5", isMusician ? "text-[#94A3B8]" : "text-[#64748B]"].join(" ")}
              aria-hidden
            />
            <span className={["text-xs font-medium", isMusician ? "text-[#64748B]" : "text-[#94A3B8]"].join(" ")}>
              {card.meta}
            </span>
          </div>
          <span
            className={[
              "flex items-center gap-1 text-xs font-black opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              isMusician ? "text-[#0055FF]" : "text-[#FF3366]",
            ].join(" ")}
          >
            {isMusician ? "View profile" : "See gig"}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </span>
        </div>

      </Link>
    </motion.div>
  );
}

// Main

export function TheCallsheet() {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      aria-label="Active musicians and open gigs"
      className="relative overflow-hidden bg-[#0F172A] px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="relative mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-3">
            {/* Live badge */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3366] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF3366]" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
                The Callsheet
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Who&apos;s on tonight.
            </h2>
            <p className="max-w-md text-base font-medium leading-relaxed text-[#94A3B8]">
              Profiles ready to collaborate. Gigs waiting for the right musician.
              No middleman. Just the work.
            </p>
          </div>

          {/* Legend pills */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#94A3B8]">
              <Music className="h-3 w-3 text-[#0055FF]" aria-hidden />
              Musicians
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#94A3B8]">
              <Video className="h-3 w-3 text-[#FF3366]" aria-hidden />
              Gigs
            </span>
          </div>
        </motion.div>

        {/* Card grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <CallCard key={card.id} card={card} index={i} reduced={reduced} />
          ))}
        </div>

        {/* Footer CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/musicians"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#0F172A] transition-all duration-200 hover:bg-[#0055FF] hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Music className="h-4 w-4" aria-hidden />
            Browse all musicians
          </Link>
          <Link
            href="/gigs"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-black text-white transition-all duration-200 hover:border-[#FF3366] hover:text-[#FF3366] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Video className="h-4 w-4" aria-hidden />
            Browse all gigs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
