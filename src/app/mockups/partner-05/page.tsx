import Link from "next/link";
import { StackCards } from "@/components/mockups/partner-05/StackCards";
import { Background3D } from "@/components/mockups/partner-05/Background3D";

export default function ProfileStack() {
  return (
    <main className="min-h-screen bg-[#030303] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      <Background3D />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col min-h-screen pointer-events-none">
        
        {/* Top Nav */}
        <nav className="h-16 w-full flex items-center justify-between px-6 md:px-12 bg-black/20 backdrop-blur-md border-b border-white/5 pointer-events-auto">
          <div className="font-bold tracking-tight text-lg uppercase bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">GigForge</div>
          <div className="flex items-center">
            <Link href="#" className="text-white/50 font-medium text-sm hover:text-white transition-colors">
              Sign in &rarr;
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto pt-16 pb-20 lg:pt-24 lg:pb-32 flex flex-col items-center text-center pointer-events-auto w-full">
          <h1 className="font-bold tracking-[-0.02em] text-white mb-6 max-w-2xl drop-shadow-lg" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.1" }}>
            The professional network<br />for student musicians.
          </h1>
          <p className="text-white/70 text-[16px] md:text-[18px] mb-10 max-w-xl leading-relaxed">
            Browse free. No account needed to find someone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link href="#" className="flex items-center justify-center h-12 px-8 rounded-full bg-cyan-500 text-black font-semibold text-[15px] hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
              Browse musicians
            </Link>
            <Link href="#" className="flex items-center justify-center h-12 px-8 rounded-full border border-white/20 text-white font-semibold text-[15px] hover:bg-white/5 transition-all bg-black/20 backdrop-blur-sm">
              Post a gig
            </Link>
          </div>

          {/* Stack Cards */}
          <div className="w-full relative z-20">
            <StackCards />
          </div>
        </section>

        {/* Network Strip */}
        <section className="w-full bg-black/40 backdrop-blur-lg py-16 border-t border-white/10 pointer-events-auto">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-8 pb-8">
            
            <Link href="#" className="group flex flex-col md:px-12">
              <span className="font-bold text-[40px] text-white leading-none mb-2 drop-shadow-md">142</span>
              <span className="text-white/60 text-[14px] mb-4 uppercase tracking-wider font-medium">musicians</span>
              <span className="text-cyan-400 text-[14px] font-medium group-hover:text-cyan-300 transition-colors">Browse the network &rarr;</span>
            </Link>

            <Link href="#" className="group flex flex-col md:px-12">
              <span className="font-bold text-[40px] text-white leading-none mb-2 drop-shadow-md">24</span>
              <span className="text-white/60 text-[14px] mb-4 uppercase tracking-wider font-medium">open gigs</span>
              <span className="text-cyan-400 text-[14px] font-medium group-hover:text-cyan-300 transition-colors">See what's posted &rarr;</span>
            </Link>

            <Link href="#" className="group flex flex-col md:px-12">
              <span className="font-bold text-[40px] text-white leading-none mb-2 drop-shadow-md">12</span>
              <span className="text-white/60 text-[14px] mb-4 uppercase tracking-wider font-medium">universities</span>
              <span className="text-cyan-400 text-[14px] font-medium group-hover:text-cyan-300 transition-colors">Your campus here &rarr;</span>
            </Link>

          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 md:px-12 max-w-[600px] mx-auto py-24 pointer-events-auto">
          <div className="flex flex-col gap-12">
            
            <div className="flex gap-8 items-start group">
              <div className="font-mono text-[28px] text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity">01</div>
              <div>
                <h3 className="font-semibold text-[22px] text-white mb-2">Browse the directory</h3>
                <p className="text-white/60 text-[16px]">No account. Just search.</p>
              </div>
            </div>

            <div className="flex gap-8 items-start group">
              <div className="font-mono text-[28px] text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity">02</div>
              <div>
                <h3 className="font-semibold text-[22px] text-white mb-2">Find someone you like</h3>
                <p className="text-white/60 text-[16px]">Their email is right there.</p>
              </div>
            </div>

            <div className="flex gap-8 items-start group">
              <div className="font-mono text-[28px] text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity">03</div>
              <div>
                <h3 className="font-semibold text-[22px] text-white mb-2">Reach out directly</h3>
                <p className="text-white/60 text-[16px]">No DMs. No platform middleman.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-black/60 backdrop-blur-md border-t border-white/5 py-8 px-6 md:px-12 pointer-events-auto mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-bold uppercase text-[14px] text-white/30 tracking-widest">GigForge</div>
            <div className="flex items-center gap-6 text-[14px] text-white/50">
              <Link href="#" className="hover:text-white transition-colors">About</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Post a gig</Link>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
