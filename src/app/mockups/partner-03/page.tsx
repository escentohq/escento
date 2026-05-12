import { Playfair_Display, Inter } from "next/font/google";
import { PaperHero } from "@/components/mockups/partner-03/PaperHero";
import { LiveActivityFeed } from "@/components/mockups/partner-03/LiveActivityFeed";
import { SocialRoster } from "@/components/mockups/partner-03/SocialRoster";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function Partner03() {
  return (
    <main className={`min-h-screen bg-[#F9F8F4] text-[#1A1A1A] ${playfair.variable} ${inter.variable} font-sans selection:bg-[#FF5A36]/20 selection:text-[#FF5A36] overflow-hidden`}>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 max-w-7xl mx-auto text-[#1A1A1A] text-sm uppercase tracking-wider font-semibold">
        <div className="font-serif italic text-lg lowercase tracking-tight">gigforge.</div>
        <div className="flex gap-8">
          <button className="hover:text-[#FF5A36] transition-colors font-medium">Directory</button>
          <button className="hover:text-[#FF5A36] transition-colors font-medium">Post Gig</button>
        </div>
      </nav>

      <PaperHero />
      
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        <div className="lg:col-span-8">
          <SocialRoster />
        </div>
        <div className="lg:col-span-4">
          <LiveActivityFeed />
        </div>
      </div>
    </main>
  );
}
