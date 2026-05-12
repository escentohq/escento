"use client";

import dynamic from "next/dynamic";

const NetworkScene = dynamic(() => import("./NetworkScene"), { ssr: false });

export function Hero() {
  return (
    <section className="relative h-[70vh] min-h-[600px] w-full overflow-hidden bg-[#030305] flex items-center">
      {/* Three.js Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <NetworkScene />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pointer-events-none">
        <div className="space-y-6 max-w-2xl">
          <div className="font-mono text-[12px] uppercase text-[#2A4A36] tracking-widest">
            {"// 142 musicians · 12 universities · RIGHT NOW"}
          </div>
          
          <div className="font-mono text-[#E8FFE8] text-[clamp(32px,4.5vw,64px)] font-bold leading-tight tracking-tight">
            <span className="text-[#00FF88]">$</span> find_musician<br />
            <span className="pl-6 block">--campus=any</span>
            <span className="pl-6 block">--available=now</span>
          </div>
          
          <p className="font-sans text-lg text-[#4A7A5A] max-w-md">
            The directory for student musicians.<br />
            Real people. Direct email. No feed.
          </p>

          <div className="pt-4 flex items-center gap-6 pointer-events-auto">
            <button className="h-[50px] px-[28px] bg-[#00FF88] hover:bg-[#00B860] text-[#030305] font-sans font-semibold text-[15px] rounded-[4px] shadow-[0_0_32px_rgba(0,255,136,0.25)] hover:shadow-[0_0_48px_rgba(0,255,136,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Browse musicians
            </button>
            <button className="h-[50px] px-[28px] bg-transparent border border-[rgba(0,255,136,0.3)] hover:border-[rgba(0,255,136,0.8)] hover:bg-[rgba(0,255,136,0.06)] text-[#00FF88] font-sans font-medium text-[15px] rounded-[4px] transition-all duration-300">
              Post a gig &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
