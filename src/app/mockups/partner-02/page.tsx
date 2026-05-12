import Link from "next/link";

import { Waveform } from "@/components/mockups/partner-02/Waveform";

const STATS = [
  { value: "142", label: "AVAILABLE MUSICIANS" },
  { value: "24", label: "OPEN PROJECTS" },
  { value: "12", label: "ACTIVE CAMPUSES" },
];

const CHANNELS = [
  {
    id: "CH-01",
    title: "Maya Chen",
    subtitle: "Guitar / Vocals / UT Austin",
    note: "Warm indie tone, fast turnaround, nights open for sessions.",
    status: "LIVE",
  },
  {
    id: "CH-02",
    title: "Scoring lead needed",
    subtitle: "Film / Paid / Deadline Jun 12",
    note: "Looking for a moody, synth-forward composer for a short thriller.",
    status: "OPEN",
  },
  {
    id: "CH-03",
    title: "Jordan Lee",
    subtitle: "Cello / USC / Remote okay",
    note: "Classical technique, modern production instincts, clean communication.",
    status: "READY",
  },
  {
    id: "CH-04",
    title: "Podcast intro package",
    subtitle: "Brand audio / Negotiable",
    note: "Need someone who can shape a tight sonic identity in one week.",
    status: "OPEN",
  },
];

const SIGNAL_PATH = [
  "Browse the active directory.",
  "Lock onto the right sound.",
  "Reach out before the moment passes.",
];

export default function StudioConsole() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#06070B] font-sans text-[#F5F7FB] selection:bg-[#8B6FFF]/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,111,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,111,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(139,111,255,0.14), transparent 34%), radial-gradient(circle at 82% 14%, rgba(232,194,117,0.1), transparent 28%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-5 sm:px-8">
        <nav className="flex items-center justify-between border-b border-[#1B1D27] pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#71717F]">
              Studio Console / Build 02
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#F5F7FB]">GigForge</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-[#2A2C3A] bg-[#10121A] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#D9C18A] sm:inline-flex">
              Signal stable
            </span>
            <Link
              href="/signin"
              className="text-sm font-medium text-[#A4A7B5] transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#1B1D27] bg-[rgba(10,11,16,0.9)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8D90A0]">
                Dark / Technical / Signal-driven
              </p>
              <h1
                className="mt-5 max-w-[10ch] text-[clamp(52px,8vw,112px)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#F7F8FC]"
              >
                Serious tools for serious collaborators.
              </h1>
              <p className="mt-5 max-w-136 text-[16px] leading-8 text-[#A7AAB8] sm:text-[17px]">
                A darker, more disciplined landing page for finding musicians fast. Less feed,
                less noise, more signal. Built to feel closer to studio equipment than startup
                marketing.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/musicians"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#8B6FFF] px-5 text-sm font-semibold tracking-[0.01em] text-[#05060A] transition-all hover:-translate-y-px hover:bg-[#9F89FF]"
                  style={{ boxShadow: "0 12px 28px rgba(139,111,255,0.28)" }}
                >
                  Browse musicians -&gt;
                </Link>
                <Link
                  href="/gigs/create"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#2A2D39] bg-[#0E1016] px-5 text-sm font-medium text-[#F5F7FB] transition-all hover:border-[#8B6FFF]/60 hover:bg-[#131621]"
                >
                  Post a gig
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#1B1D27] bg-[#0B0D13] px-5 py-5"
                >
                  <p className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#8B6FFF]">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7C7F8E]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-[#1B1D27] bg-[#0B0D13] p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#1B1D27] pb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C7F8E]">
                  Signal path
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D9C18A]">
                  low latency
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {SIGNAL_PATH.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-2xl border border-[#171922] bg-[#0E1016] px-4 py-4"
                  >
                    <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#8B6FFF]">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-7 text-[#B2B5C2]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-[#1D2030] bg-[#090A10] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7C7F8E]">
                    Oscilloscope / Channel Focus
                  </p>
                  <p className="mt-2 text-sm text-[#A7AAB8]">
                    Cursor-reactive signal display with studio-style readouts.
                  </p>
                </div>
                <span className="rounded-full border border-[#2A2D39] bg-[#11131B] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5EE2A0]">
                  input armed
                </span>
              </div>

              <Waveform variant="hero" />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Readout label="FREQ" value="448 Hz" />
                <Readout label="AMP" value="0.74" />
                <Readout label="LOCK" value="Channel 02" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ConsoleCard
                eyebrow="Channel monitor"
                title="Open projects are visible at a glance."
                copy="Make the whole page feel like a working desk inside a studio, not a polished app store tile."
              />
              <ConsoleCard
                eyebrow="Design note"
                title="Restraint matters as much as energy."
                copy="One or two accent signals, dense blacks, crisp borders, and typography that feels engineered."
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[28px] border border-[#1B1D27] bg-[rgba(10,11,16,0.92)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#1B1D27] pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C7F8E]">
                  Live directory
                </p>
                <p className="mt-2 text-sm text-[#A7AAB8]">Profiles and gigs rendered like active console channels.</p>
              </div>
              <Link
                href="/musicians"
                className="text-sm font-medium text-[#D9C18A] transition-colors hover:text-[#F5F7FB]"
              >
                View all -&gt;
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="group rounded-[22px] border border-[#191C27] bg-[#0D0F16] px-4 py-4 transition-all hover:border-[#2A2E3C] hover:bg-[#121522]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8B6FFF]">
                          {channel.id}
                        </span>
                        <span className="rounded-full border border-[#263122] bg-[#0E1711] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5EE2A0]">
                          {channel.status}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#F5F7FB]">
                        {channel.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#A7AAB8]">{channel.subtitle}</p>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6D7080]">
                      direct line
                    </span>
                  </div>
                  <p className="mt-4 max-w-[58ch] text-sm leading-7 text-[#9A9EAE]">{channel.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-[#1B1D27] bg-[#0B0D13] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C7F8E]">
                Ambient bus
              </p>
              <p className="mt-3 text-sm leading-7 text-[#A7AAB8]">
                The page should feel alive even at rest: subtle motion, clean signal language, and
                enough structure that every panel feels deliberately routed.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#1A1D28] bg-[#090A10]">
                <Waveform variant="strip" />
              </div>
            </div>

            <div className="rounded-[24px] border border-[#1B1D27] bg-[#0B0D13] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C7F8E]">
                Routing notes
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#A7AAB8]">
                <li>Keep the signal strong and the chrome minimal.</li>
                <li>Let the page feel built for creators who know their tools.</li>
                <li>Favor clarity, contrast, and intentional motion over decoration.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1B1D27] bg-[#0D0F16] px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7C7F8E]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#F5F7FB]">{value}</p>
    </div>
  );
}

function ConsoleCard({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#1B1D27] bg-[#0D0F16] p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C7F8E]">{eyebrow}</p>
      <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[#F5F7FB]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#A7AAB8]">{copy}</p>
    </div>
  );
}
