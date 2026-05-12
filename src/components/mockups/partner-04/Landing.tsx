"use client";

import { useEffect, useRef } from "react";

export function Landing() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const targetX = useRef<number | null>(null);
  const targetY = useRef<number | null>(null);
  const currentX = useRef(50);
  const currentY = useRef(45);
  const rafId = useRef<number>(0);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      spotlight.style.setProperty("--mx", "50vw");
      spotlight.style.setProperty("--my", "45vh");
      return;
    }

    let startTime = Date.now();

    const tick = () => {
      if (isTouchDevice.current) {
        const t = (Date.now() - startTime) / 1000;
        const x = 50 + 15 * Math.sin((t * 2 * Math.PI) / 6);
        spotlight.style.setProperty("--mx", `${x}vw`);
        spotlight.style.setProperty("--my", "45vh");
      } else if (targetX.current !== null && targetY.current !== null) {
        currentX.current += (targetX.current - currentX.current) * 0.08;
        currentY.current += (targetY.current - currentY.current) * 0.08;
        spotlight.style.setProperty("--mx", `${currentX.current}px`);
        spotlight.style.setProperty("--my", `${currentY.current}px`);
      } else {
        spotlight.style.setProperty("--mx", `${currentX.current}vw`);
        spotlight.style.setProperty("--my", `${currentY.current}vh`);
      }
      rafId.current = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      isTouchDevice.current = false;
      targetX.current = e.clientX;
      targetY.current = e.clientY;
    };

    const onTouchStart = () => {
      isTouchDevice.current = true;
      startTime = Date.now();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="bg-[#0A0A0C] text-[#FFF8EE] min-h-screen font-sans">
      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col border-b border-[#1A1A1F]">
        {/* Spotlight layer */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            ["--mx" as string]: "50vw",
            ["--my" as string]: "45vh",
            background:
              "radial-gradient(ellipse 600px 800px at var(--mx) var(--my), #FFC880 0%, rgba(232,164,92,0.4) 22%, rgba(232,164,92,0.08) 50%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-8 py-6">
          <span className="font-mono text-sm font-semibold tracking-widest text-[#FFF8EE]">
            GIGFORGE
          </span>
          <a
            href="#"
            className="text-sm text-[#52525B] hover:text-[#FFF8EE] transition-colors"
          >
            Sign in →
          </a>
        </nav>

        {/* Stage content */}
        <div className="relative z-20 flex flex-1 flex-col items-center justify-center text-center px-6 pb-24">
          {/* Rigging */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-8">
              <div className="w-1 h-1 rounded-full bg-[#52525B]" />
              <div className="w-1 h-1 rounded-full bg-[#52525B]" />
              <div className="w-1 h-1 rounded-full bg-[#52525B]" />
            </div>
            <div className="w-px h-6 bg-[#52525B] opacity-24 mt-0" style={{ opacity: 0.24 }} />
          </div>

          {/* Mono stage label */}
          <p className="font-mono text-xs tracking-[0.2em] text-[#52525B] mb-6">
            THE STAGE · ROW B · SEAT 14
          </p>

          {/* Headline */}
          <h1
            className="font-bold tracking-[-0.025em] text-[#FFF8EE] max-w-3xl"
            style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 1.05 }}
          >
            Find the musician your project needs.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base leading-relaxed text-[#FFF8EE] max-w-md opacity-80">
            A directory for student creators.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center h-[50px] px-6 rounded-full bg-[#5E8FFF] text-[#0A0A0C] text-sm font-semibold transition-all hover:bg-[#7BA3FF] hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(94,143,255,0.3)]"
            >
              Browse musicians
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center h-[50px] px-6 rounded-full border border-[rgba(255,200,128,0.4)] text-[#FFF8EE] text-sm font-semibold transition-all hover:border-[rgba(255,200,128,0.8)]"
            >
              Post a gig
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#0A0A0C] px-8 py-20 max-w-2xl mx-auto">
        <div className="flex flex-col gap-8">
          {[
            { n: "01", title: "Browse the directory", body: "A no-account page. Just look." },
            { n: "02", title: "Find a student you like", body: "Email is right there." },
            { n: "03", title: "Hire them, or not", body: "That's it. That's the product." },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex items-start gap-6">
              <span className="font-mono text-sm font-semibold text-[#E8A45C] w-8 shrink-0 pt-0.5">
                [{n}]
              </span>
              <div>
                <p className="text-[#FFF8EE] font-semibold">{title}</p>
                <p className="mt-1 text-sm text-[#52525B]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE CARDS ── */}
      <section className="bg-[#0E0E11] border-t border-[#1A1A1F] px-8 py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-[#52525B] mb-8 text-center">
          SAMPLE LISTINGS
        </p>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Musician card */}
          <div className="rounded-xl border border-[#1A1A1F] bg-[#0A0A0C] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#52525B]">MUSICIAN</span>
              <span className="text-xs bg-[#1A1A1F] text-[#E8A45C] px-2 py-0.5 rounded-full font-mono">
                Available
              </span>
            </div>
            <h3 className="text-[#FFF8EE] font-semibold text-lg">Maya Chen</h3>
            <p className="text-sm text-[#52525B] mt-1">Piano · Jazz · Film Scoring</p>
            <p className="text-sm text-[#52525B] mt-3 leading-relaxed">
              UT Austin junior. Film scoring focus. Has tracked on 4 student shorts this semester.
            </p>
            <a
              href="#"
              className="mt-5 inline-flex items-center text-sm text-[#5E8FFF] hover:text-[#7BA3FF] transition-colors"
            >
              View profile →
            </a>
          </div>

          {/* Gig card */}
          <div className="rounded-xl border border-[#1A1A1F] bg-[#0A0A0C] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#52525B]">GIG</span>
              <span className="text-xs bg-[#1A1A1F] text-[#FFC880] px-2 py-0.5 rounded-full font-mono">
                Open
              </span>
            </div>
            <h3 className="text-[#FFF8EE] font-semibold text-lg">Score for Short Film</h3>
            <p className="text-sm text-[#52525B] mt-1">Film · 12 min · Unpaid + credit</p>
            <p className="text-sm text-[#52525B] mt-3 leading-relaxed">
              Need someone who can write sparse orchestral cues. Rough cut ready. 3-week turnaround.
            </p>
            <a
              href="#"
              className="mt-5 inline-flex items-center text-sm text-[#5E8FFF] hover:text-[#7BA3FF] transition-colors"
            >
              See details →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A0A0C] border-t border-[#1A1A1F] px-8 py-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[#52525B]">PROGRAMME</p>
            <p className="mt-2 text-sm text-[#52525B]">
              GigForge connects student musicians with student creators.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <a
              href="#"
              className="font-mono text-xs tracking-[0.15em] text-[#52525B] hover:text-[#FFF8EE] transition-colors"
            >
              EXIT · STAGE LEFT ↑
            </a>
            <div>
              <p className="font-mono text-xs tracking-[0.15em] text-[#52525B] mb-1">
                INTERMISSION
              </p>
              <a
                href="#"
                className="font-mono text-xs tracking-[0.15em] text-[#52525B] hover:text-[#FFF8EE] transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
