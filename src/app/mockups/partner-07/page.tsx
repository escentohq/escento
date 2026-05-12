import { Fraunces, Manrope } from "next/font/google";
import { CampusHero } from "@/components/mockups/partner-07/CampusHero";
import { SchoolHubs } from "@/components/mockups/partner-07/SchoolHubs";
import { CampusActivity } from "@/components/mockups/partner-07/CampusActivity";

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-fraunces",
});

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope",
});

export default function Partner07() {
  return (
    <main className={`min-h-screen bg-[#F4F7F5] text-[#0F172A] ${fraunces.variable} ${manrope.variable} font-sans selection:bg-[#FF5A5F]/20 selection:text-[#FF5A5F] overflow-x-hidden`}>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:px-12 max-w-[1400px] mx-auto text-[#0F172A]">
        <div className="font-serif font-bold text-2xl tracking-tight text-[#166534]">GigForge.</div>
        <div className="flex gap-8 items-center text-sm font-semibold">
          <button className="hover:text-[#FF5A5F] transition-colors">Campuses</button>
          <button className="hover:text-[#FF5A5F] transition-colors">Directory</button>
          <button className="px-6 py-2.5 bg-[#FF5A5F] text-white rounded-full hover:bg-[#E0484D] transition-colors shadow-sm">
            Join the Network
          </button>
        </div>
      </nav>

      <CampusHero />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 space-y-32 relative z-10">
        <SchoolHubs />
        <CampusActivity />
      </div>
    </main>
  );
}
