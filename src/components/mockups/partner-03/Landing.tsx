import Link from "next/link";
import type { CSSProperties } from "react";

import { RotatingWord } from "./RotatingWord";

const ROTATING_WORDS = [
  "guitarist",
  "violinist",
  "producer",
  "vocalist",
  "cellist",
  "drummer",
  "composer",
];

const FEATURED_CARDS = [
  {
    category: "GIG / FILM",
    title: "Composer for a 10-minute thesis short",
    description: "Searching for a composer fluent in synth and strings, with room to write quietly.",
    meta: "UT Austin / Paid / Deadline Jun 12",
    href: "/gigs",
  },
  {
    category: "GIG / LIVE",
    title: "House pianist for a student-run supper club",
    description: "Need someone who can move from standards to ambient interludes without stealing the room.",
    meta: "Northwestern / Stipend / Fridays in June",
    href: "/gigs",
  },
  {
    category: "GIG / RECORDING",
    title: "Cellist for a bedroom-pop EP session",
    description: "One afternoon in a campus studio to add warmth, restraint, and a little drama.",
    meta: "USC / Paid / Tracking next week",
    href: "/gigs",
  },
];

const HOW_IT_WORKS = [
  "Browse the directory the way you would read a good campus magazine: slowly, with enough context to tell who is actually worth emailing. Profiles lead with the essentials, not platform noise.",
  "When someone fits the project, you get the direct line. Instruments, genres, and a short body of work are visible up front so creators can move from curiosity to contact without a funnel in the way.",
  "GigForge stays deliberately narrow. No feed. No inbox theater. Just a clean path between a student creator with a deadline and a student musician who can make the work better.",
];

const theme = {
  "--paper-bg": "#F5F1E8",
  "--paper-surface": "#FFFFFF",
  "--rule": "#1A1A1A",
  "--ink-primary": "#0E0E10",
  "--ink-secondary": "#4A4A4F",
  "--ink-muted": "#8A8682",
  "--accent-red": "#C2452F",
  "--accent-red-wash": "#F4DDD6",
} as CSSProperties;

export function Landing() {
  return (
    <main
      style={theme}
      className="min-h-screen bg-(--paper-bg) font-sans text-(--ink-primary)"
    >
      <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-5 sm:px-8 sm:pb-20 md:px-10">
        <header className="border-b-2 border-(--rule) pb-12 sm:pb-16">
          <nav className="flex items-center justify-between gap-4 border-b border-[rgba(26,26,26,0.18)] pb-4 text-[13px]">
            <Link href="/mockups" className="font-semibold uppercase tracking-[0.18em] text-(--ink-primary)">
              GigForge
            </Link>
            <div className="flex items-center gap-5 text-(--ink-secondary)">
              <Link className="transition-colors hover:text-(--ink-primary)" href="/signin">
                Sign in
              </Link>
              <Link
                className="group inline-flex items-center gap-2 text-(--accent-red) transition-colors hover:text-(--ink-primary)"
                href="/gigs/create"
              >
                Post
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  -&gt;
                </span>
              </Link>
            </div>
          </nav>

          <div className="pt-12 sm:pt-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(26,26,26,0.12)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-(--ink-muted)">
              <span>Issue No. 24 / Week of May 11</span>
              <span className="flex items-center gap-2 text-(--accent-red)">
                <span className="h-2 w-2 rounded-full bg-(--accent-red)" />
                Open directory
              </span>
            </div>

            <div className="mt-8 max-w-[820px]">
              <h1
                className="font-serif text-[clamp(44px,7vw,104px)] font-normal leading-[0.98] tracking-[-0.015em] text-(--ink-primary)"
              >
                Find the right
                <br />
                student <RotatingWord words={ROTATING_WORDS} />
                <br />
                for your next project.
              </h1>

              <p className="mt-8 max-w-[620px] text-[17px] leading-[1.55] text-(--ink-secondary)">
                A directory of student musicians at universities across the country. No feed.
                No DMs. Just contact.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/musicians"
                  className="inline-flex h-[52px] items-center justify-center rounded-[2px] bg-(--ink-primary) px-7 text-[15px] font-medium text-(--paper-bg) transition-colors duration-200 hover:bg-(--accent-red)"
                >
                  Browse the directory
                </Link>
                <Link
                  href="/gigs/create"
                  className="group inline-flex items-center gap-2 border-b border-(--accent-red) pb-0.5 text-[15px] font-medium text-(--accent-red) transition-colors hover:text-(--ink-primary)"
                >
                  Post a gig
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    -&gt;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="border-b border-[rgba(26,26,26,0.18)] py-12 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-(--ink-muted)">
                This week on GigForge
              </p>
              <h2 className="mt-3 font-serif text-[32px] font-normal leading-tight text-(--ink-primary)">
                Three listings that feel more like clippings than cards.
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-6 text-(--ink-secondary)">
              A printed-paper layout, with just enough motion and contrast to make the live
              directory feel human rather than automated.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURED_CARDS.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-(--ink-muted)">
                How it works
              </p>
              <h2 className="font-serif text-[32px] font-normal leading-tight text-(--ink-primary)">
                Short paragraphs, not a feature grid.
              </h2>
              <p className="text-sm leading-6 text-(--ink-secondary)">
                The page keeps the tone editorial: fewer boxes, more reading rhythm, and one warm
                accent color doing all the heavy lifting.
              </p>
            </div>

            <div className="space-y-8">
              {HOW_IT_WORKS.map((paragraph, index) => (
                <HowItWorksParagraph key={index} index={index + 1} paragraph={paragraph} />
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-[rgba(26,26,26,0.18)] pt-6 text-[12px] uppercase tracking-[0.14em] text-(--ink-muted)">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Paper and ink / internal landing study</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link className="transition-colors hover:text-(--ink-primary)" href="/musicians">
                Directory
              </Link>
              <Link className="transition-colors hover:text-(--ink-primary)" href="/gigs">
                Gigs
              </Link>
              <Link className="transition-colors hover:text-(--ink-primary)" href="/mockups">
                All mockups
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

type FeatureCardProps = (typeof FEATURED_CARDS)[number];

function FeatureCard({ category, title, description, meta, href }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block border border-[rgba(26,26,26,0.12)] bg-(--paper-surface) p-6 transition duration-200 hover:-translate-y-px hover:border-[rgba(26,26,26,0.4)]"
    >
      <div className="h-px w-full bg-(--accent-red)" />
      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-(--ink-muted)">
        {category}
      </p>
      <div className="mt-4 inline-block">
        <h3 className="font-serif text-[22px] font-normal leading-[1.15] text-(--ink-primary)">
          {title}
        </h3>
        <span className="mt-1 block h-px origin-left scale-x-0 bg-(--accent-red) transition-transform duration-200 group-hover:scale-x-100" />
      </div>
      <p className="mt-4 text-[14px] leading-6 text-(--ink-secondary)">{description}</p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[12px] uppercase tracking-[0.12em] text-(--ink-muted)">{meta}</p>
        <span
          aria-hidden="true"
          className="text-(--accent-red) transition-transform duration-200 group-hover:translate-x-1"
        >
          -&gt;
        </span>
      </div>
    </Link>
  );
}

function HowItWorksParagraph({
  index,
  paragraph,
}: {
  index: number;
  paragraph: string;
}) {
  return (
    <article className="border-t border-[rgba(26,26,26,0.16)] pt-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-(--ink-muted)">
        Chapter 0{index}
      </p>
      <p className="mt-4 max-w-[720px] text-[17px] leading-[1.72] text-(--ink-primary) first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[58px] first-letter:leading-[0.8]">
        {paragraph}
      </p>
    </article>
  );
}
