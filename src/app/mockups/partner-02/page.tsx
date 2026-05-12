import Link from "next/link";
import { Waveform } from "@/components/mockups/partner-02/Waveform";

export default function StudioConsole() {
  return (
    <main className="min-h-screen bg-[#08080B] text-[#F4F4F7] font-sans selection:bg-[#7C5CFF]/30">
      {/* Nav */}
      <nav className="h-16 w-full flex items-center justify-between px-6 md:px-12 max-w-6xl mx-auto border-b border-[#1F1F27]">
        <div className="font-semibold tracking-tight text-lg">GigForge</div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="#" className="text-[#A1A1AA] hover:text-[#F4F4F7] transition-colors">Sign in</Link>
          <Link href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1F1F27] hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/5 transition-all text-[#A1A1AA] hover:text-[#7C5CFF]">
            &rarr;
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 max-w-6xl mx-auto pt-20 pb-12 lg:pt-28 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Copy */}
          <div className="flex-1 w-full z-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[13px] text-[#A1A1AA] tracking-wider uppercase">
                OPEN &middot; 24 GIGS &middot; UPDATED 2 MIN AGO
              </span>
            </div>

            <h1 className="text-[#F4F4F7] font-semibold tracking-[-0.02em] mb-6" style={{ fontSize: "clamp(44px, 6vw, 88px)", lineHeight: "1.02" }}>
              Find the right student musician.<br />
              Email them directly.
            </h1>

            <p className="text-[#A1A1AA] text-base md:text-lg max-w-xl mb-10" style={{ lineHeight: "1.55" }}>
              A directory, not a feed. Built for student creators who need a composer, a guitarist, a vocalist — now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#" className="flex items-center justify-center h-12 px-5 rounded-xl bg-[#8B6FFF] text-[#08080B] font-semibold text-[15px] tracking-[-0.005em] hover:bg-[#9D85FF] hover:-translate-y-[1px] transition-all duration-150" style={{ boxShadow: "0 8px 24px rgba(139,111,255,0.25)" }}>
                Browse musicians &rarr;
              </Link>
              <Link href="#" className="flex items-center justify-center h-12 px-5 rounded-xl border border-[#2C2C36] text-[#F4F4F7] bg-transparent hover:border-[#7C5CFF] hover:bg-[rgba(124,92,255,0.05)] font-medium text-[15px] transition-all duration-150">
                Post a gig
              </Link>
            </div>
          </div>

          {/* Right: Cards */}
          <div className="w-full lg:w-[440px] flex flex-col gap-5 z-10">
            {/* Musician Card */}
            <div className="group bg-[#101015] border border-[#1F1F27] rounded-xl p-5 hover:-translate-y-[2px] hover:border-[#2C2C36] hover:bg-[#16161D] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                 style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1F1F27] flex items-center justify-center text-[#F4F4F7] text-sm font-medium">
                  MC
                </div>
                <div>
                  <h3 className="text-[#F4F4F7] font-medium text-base">Maya Chen</h3>
                  <p className="text-[#A1A1AA] text-sm">Guitar &middot; Vocals &middot; UT Austin</p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 rounded bg-[#1F1F27] text-[#A1A1AA] text-xs font-medium border border-[#2C2C36]/50">Indie Rock</span>
                <span className="px-2 py-1 rounded bg-[#1F1F27] text-[#A1A1AA] text-xs font-medium border border-[#2C2C36]/50">Acoustic</span>
              </div>
              <p className="text-[#A1A1AA] text-sm line-clamp-2">
                Classically trained but mostly writing bedroom pop right now. Looking to collaborate with producers or singers.
              </p>
            </div>

            {/* Gig Card */}
            <div className="group bg-[#101015] border border-[#1F1F27] rounded-xl p-5 hover:-translate-y-[2px] hover:border-[#2C2C36] hover:bg-[#16161D] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ml-0 lg:ml-8"
                 style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#D1A05B] text-xs font-mono border border-[#D1A05B]/20 bg-[#D1A05B]/10 px-2 py-0.5 rounded">FILM</span>
                <span className="text-[#52525B] text-xs font-mono">2 DAYS LEFT</span>
              </div>
              <h3 className="text-[#F4F4F7] font-medium text-base mb-2">Composer for 10-min thesis short</h3>
              <p className="text-[#A1A1AA] text-sm line-clamp-2 mb-4">
                Sci-fi thriller looking for a synth-heavy, brooding score. Need someone who understands tension.
              </p>
              <div className="text-[#5EE2A0] text-xs font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EE2A0]"></span>
                PAID &middot; $500
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Waveform full bleed */}
      <div className="w-full border-t border-[#1F1F27] bg-[#08080B] relative">
        <Waveform />
      </div>

      {/* How it works */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          <div className="flex flex-col gap-4 border-t border-[#1F1F27] pt-6">
            <div className="text-[#52525B] font-mono text-[32px] mb-2 leading-none">01</div>
            <h3 className="text-[#F4F4F7] font-medium text-lg">Search the directory</h3>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed">
              Filter by instrument, genre, and location to find exactly who you need for your project.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#1F1F27] pt-6">
            <div className="text-[#52525B] font-mono text-[32px] mb-2 leading-none">02</div>
            <h3 className="text-[#F4F4F7] font-medium text-lg">Review their work</h3>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed">
              Listen to their portfolio tracks, see past gigs, and verify they fit your sound.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#1F1F27] pt-6">
            <div className="text-[#52525B] font-mono text-[32px] mb-2 leading-none">03</div>
            <h3 className="text-[#F4F4F7] font-medium text-lg">Reach out directly</h3>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed">
              No middleman, no booking fees. Get their email and start collaborating immediately.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}
