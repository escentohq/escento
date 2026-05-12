import Link from "next/link";
import { ProfileStack } from "@/components/mockups/partner-05/ProfileStack";
import { ArrowRight, Search, PlayCircle, Star, Music } from "lucide-react";

export default function ProfileStackPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#FF6B6B] selection:text-white relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#FF6B6B]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#4ECDC4]/10 to-transparent blur-3xl pointer-events-none" />
      
      {/* Top Nav */}
      <nav className="relative z-20 w-full flex items-center justify-between px-6 py-6 md:px-12 bg-transparent">
        <div className="font-black tracking-tighter text-xl text-[#0F172A]">
          GIG<span className="text-[#FF6B6B]">FORGE</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="hidden sm:block text-[#64748B] font-bold text-sm hover:text-[#0F172A] transition-colors">
            How it works
          </Link>
          <Link href="#" className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-[#0F172A]/10">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center gap-16 py-12 relative z-10">
        
        {/* Left: Copy & CTAs */}
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFE66D]/30 text-[#D4AF37] font-bold text-xs uppercase tracking-wider mb-8">
            <Star className="w-3.5 h-3.5" />
            Join the Network
          </div>
          
          <h1 className="font-black tracking-tight text-[#0F172A] mb-6 leading-[1.05]" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
            Find the right <span className="relative inline-block">
              <span className="relative z-10">sound.</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#4ECDC4]/30 -rotate-2 z-0"></span>
            </span>
          </h1>
          
          <p className="text-[#64748B] text-lg md:text-xl mb-10 font-medium leading-relaxed max-w-xl">
            A social-first directory for student creators. Flip through profiles, hear their work, and book them for your next project.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="#" className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#FF6B6B] text-white font-bold text-[15px] hover:bg-[#FF5252] hover:shadow-[0_10px_30px_rgba(255,107,107,0.3)] transition-all hover:-translate-y-1">
              <Search className="w-5 h-5" />
              Browse Network
            </Link>
            <Link href="#" className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-[15px] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all">
              Post a Gig
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?u=1" className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" alt="" />
              <img src="https://i.pravatar.cc/100?u=2" className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" alt="" />
              <img src="https://i.pravatar.cc/100?u=3" className="w-10 h-10 rounded-full border-2 border-[#F8FAFC]" alt="" />
              <div className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] bg-[#E2E8F0] flex items-center justify-center text-[#64748B] font-bold text-xs">
                +2k
              </div>
            </div>
            <div className="text-sm font-semibold text-[#64748B]">
              <span className="text-[#0F172A] font-bold">2,400+</span> students already joined
            </div>
          </div>
        </div>

        {/* Right: The Stack */}
        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] opacity-[0.08] blur-2xl rounded-[3rem] pointer-events-none" />
          <ProfileStack />
        </div>

      </div>

      {/* Footer / Info Strip */}
      <footer className="relative z-20 mt-auto border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[#64748B] font-semibold text-sm">
              <Music className="w-4 h-4 text-[#4ECDC4]" />
              Audio Portfolios
            </div>
            <div className="flex items-center gap-2 text-[#64748B] font-semibold text-sm">
              <Star className="w-4 h-4 text-[#FFE66D]" />
              Curated Talent
            </div>
            <div className="flex items-center gap-2 text-[#64748B] font-semibold text-sm">
              <PlayCircle className="w-4 h-4 text-[#FF6B6B]" />
              Direct Booking
            </div>
          </div>
          <div className="text-sm font-semibold text-[#94A3B8]">
            Built by students, for students.
          </div>
        </div>
      </footer>
    </main>
  );
}
