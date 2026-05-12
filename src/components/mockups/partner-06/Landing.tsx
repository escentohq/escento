import Link from "next/link";
import type { CSSProperties } from "react";

import { HoverRow, Reveal } from "./Reveal";

const PROFILE = {
  name: "Maya Chen",
  role: "Guitar · Vocals",
  school: "UT Austin · Music '25",
  bio: "Indie, folk, and film scoring. Evenings free for recording sessions and short-form collaborations.",
  email: "hello@maya.example",
  tags: ["guitar", "vocals", "folk"],
  count: 142,
};

const RECENTLY_ACTIVE = [
  {
    name: "Jordan L.",
    summary: "Cello · Classical",
    activity: "joined 2 days ago",
    href: "/musicians",
  },
  {
    name: "Sam P.",
    summary: "Piano · Producer",
    activity: "updated profile",
    href: "/musicians",
  },
  {
    name: "Priya K.",
    summary: "Violin · Orchestral",
    activity: "posted availability",
    href: "/musicians",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Browse the directory",
    body: "No account required. It's open.",
  },
  {
    number: "02",
    title: "Email directly",
    body: "No DMs. No platform. Just email.",
  },
  {
    number: "03",
    title: "That's the product.",
    body: "Simple by design, not by accident.",
  },
];

const OPEN_GIGS = [
  {
    badge: "COMPOSER",
    title: "Thesis Short",
    meta: "UT Austin · Paid",
    timing: "Deadline: Jun 1",
    href: "/gigs",
  },
  {
    badge: "GUITARIST",
    title: "Indie EP",
    meta: "Remote · Unpaid",
    timing: "Flexible",
    href: "/gigs",
  },
  {
    badge: "VOCALIST",
    title: "Podcast Intro",
    meta: "Remote · Negotiable",
    timing: "ASAP",
    href: "/gigs",
  },
];

const theme = {
  "--page-bg": "#FFFFFF",
  "--section-bg": "#F3F2EF",
  "--card-bg": "#FFFFFF",
  "--otw-bg": "#057642",
  "--pill-bg": "#EEF3FB",
  "--card-border": "rgba(0,0,0,0.08)",
  "--divider": "rgba(0,0,0,0.12)",
  "--ink-primary": "#191919",
  "--ink-secondary": "#555555",
  "--ink-muted": "#888888",
  "--accent-blue": "#0A66C2",
} as CSSProperties;

export function Landing() {
  return (
    <main style={theme} className="min-h-screen bg-(--page-bg) font-sans text-(--ink-primary)">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <nav className="flex items-center justify-between border-b border-(--divider) py-4">
          <Link href="/mockups" className="text-lg font-bold tracking-[-0.02em] text-(--ink-primary)">
            GIGFORGE
          </Link>
          <Link href="/signin" className="text-sm font-medium text-(--ink-secondary) transition-colors hover:text-(--ink-primary)">
            Sign in -&gt;
          </Link>
        </nav>

        <section className="grid grid-cols-1 gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-18">
          <Reveal className="order-2 lg:order-1" y={18}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--ink-muted)">
              Open network / Student musicians
            </p>
            <h1
              className="mt-4 max-w-[560px] text-[clamp(40px,5.5vw,72px)] font-bold leading-[1.05] tracking-[-0.025em] text-(--ink-primary)"
            >
              The professional network for student musicians.
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-relaxed text-(--ink-secondary)">
              Find a guitarist for your film. Post a gig for a film composer. Direct email
              contact, structured profiles, and a signal that says the people here are ready to
              collaborate.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/musicians"
                className="inline-flex h-12 items-center justify-center rounded-full bg-(--accent-blue) px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#004182]"
              >
                Browse musicians
              </Link>
              <Link
                href="/gigs/create"
                className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-(--accent-blue) px-6 text-[15px] font-semibold text-(--accent-blue) transition-colors hover:bg-[rgba(10,102,194,0.08)]"
              >
                Post a gig
              </Link>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={0.08} y={22}>
            <div className="rounded-[10px] border border-(--card-border) bg-(--card-bg) shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
              <div className="rounded-t-[10px] bg-(--otw-bg) px-5 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white">
                OPEN TO COLLABORATE
              </div>
              <div className="px-5 py-6 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-(--ink-primary)">{PROFILE.name}</h2>
                    <p className="mt-1 text-base text-(--ink-secondary)">{PROFILE.role}</p>
                    <p className="mt-1 text-sm text-(--ink-muted)">{PROFILE.school}</p>
                  </div>
                  <span className="rounded-full bg-(--pill-bg) px-3 py-1 text-xs font-medium text-(--accent-blue)">
                    Available now
                  </span>
                </div>

                <p className="mt-5 max-w-[44ch] text-[15px] leading-7 text-(--ink-secondary)">
                  "{PROFILE.bio}"
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {PROFILE.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-(--pill-bg) px-3 py-1 text-sm font-medium text-(--accent-blue)"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 border-t border-(--divider) pt-4">
                  <Link
                    href="/musicians"
                    className="group flex items-center justify-between text-sm font-medium text-(--ink-primary)"
                  >
                    <span>{PROFILE.email}</span>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      -&gt;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-(--ink-secondary)">
              <span className="font-semibold text-(--ink-primary)">{PROFILE.count}</span> musicians
              currently open
            </p>
          </Reveal>
        </section>
      </div>

      <section className="border-y border-(--divider) bg-(--section-bg)">
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-12">
          <Reveal y={16}>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--ink-muted)">
              Recently active
            </p>
            <div className="mt-4 overflow-hidden rounded-[10px] border border-(--divider) bg-white">
              {RECENTLY_ACTIVE.map((row, index) => (
                <HoverRow
                  key={row.name}
                  className={index === 0 ? "" : "border-t border-(--divider)"}
                >
                  <Link
                    href={row.href}
                    className="group flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-(--ink-primary)">
                        {row.name}
                        <span className="ml-2 font-normal text-(--ink-secondary)">{row.summary}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm text-(--ink-muted) sm:justify-end">
                      <span>{row.activity}</span>
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                        -&gt;
                      </span>
                    </div>
                  </Link>
                </HoverRow>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-(--section-bg)">
        <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16">
          <Reveal y={18}>
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="rounded-[10px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                  <p className="text-lg font-semibold text-(--accent-blue)">{step.number}</p>
                  <h3 className="mt-3 text-xl font-semibold text-(--ink-primary)">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-(--ink-secondary)">{step.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-(--page-bg)">
        <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-(--ink-muted)">
                Open gigs
              </p>
              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-(--ink-primary)">
                Three current openings, framed like the rest of the network.
              </h2>
            </div>
            <Link href="/gigs" className="text-sm font-medium text-(--accent-blue) transition-colors hover:text-[#004182]">
              Browse all gigs -&gt;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {OPEN_GIGS.map((gig, index) => (
              <Reveal key={gig.badge} delay={index * 0.06} y={18}>
                <Link
                  href={gig.href}
                  className="group block rounded-[8px] border border-(--card-border) bg-(--card-bg) p-5 shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span className="inline-flex rounded-full bg-(--pill-bg) px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-(--accent-blue)">
                    {gig.badge}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-(--ink-primary)">
                    {gig.title}
                  </h3>
                  <p className="mt-2 text-sm text-(--ink-secondary)">{gig.meta}</p>
                  <p className="mt-1 text-sm text-(--ink-muted)">{gig.timing}</p>
                  <div className="mt-6 flex items-center justify-between text-sm font-medium text-(--accent-blue)">
                    <span>Apply via email</span>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      -&gt;
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-(--divider) bg-(--page-bg)">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-6 text-xs uppercase tracking-[0.08em] text-(--ink-muted) sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Open to Work / internal landing study</p>
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
    </main>
  );
}
