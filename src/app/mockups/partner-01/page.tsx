import { JetBrains_Mono, Inter } from "next/font/google";
import { Hero } from "@/components/mockups/partner-01/Hero";
import { ActivityMarquee } from "@/components/mockups/partner-01/ActivityMarquee";
import { ProfileCards } from "@/components/mockups/partner-01/ProfileCards";
import { Steps } from "@/components/mockups/partner-01/Steps";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"]
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "600"]
});

export default function Partner01() {
  return (
    <main className={`min-h-screen bg-[#030305] text-[#4A7A5A] ${jetbrainsMono.variable} ${inter.variable} font-sans`}>
      {/* Navigation placeholder */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 max-w-7xl mx-auto font-mono text-[#E8FFE8] text-sm uppercase tracking-wider">
        <div>GIGFORGE</div>
        <div className="flex items-center gap-2 text-[#00FF88]">
          <span className="text-[#2A4A36]">[STATUS: LIVE</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
          </span>
          <span className="text-[#2A4A36]">]</span>
        </div>
      </nav>

      <Hero />
      <ActivityMarquee />
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-32">
        <ProfileCards />
        <Steps />
      </div>
    </main>
  );
}
