import { Hero } from "@/components/mockups/you-01/Hero";
import { Marquee } from "@/components/mockups/you-01/Marquee";
import { Pitch } from "@/components/mockups/you-01/Pitch";

export default function You01() {
  return (
    <main className="bg-neutral-50 font-serif">
      <Hero />
      <Marquee />
      <Pitch />
    </main>
  );
}
