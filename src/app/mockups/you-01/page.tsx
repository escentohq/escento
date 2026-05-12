import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/playfair-display/900.css";

import { Hero } from "@/components/mockups/you-01/Hero";
import { Marquee } from "@/components/mockups/you-01/Marquee";
import { Pitch } from "@/components/mockups/you-01/Pitch";

export default function You01() {
  return (
    <main className="min-h-screen bg-[#F2EFE8] text-[#0E0D0B]">
      <Hero />
      <Marquee />
      <Pitch />
    </main>
  );
}
