import { Section } from "@/components/mockups/_shared/Section";
import { CTAButton } from "@/components/mockups/_shared/CTAButton";

export function CTA() {
  return (
    <Section className="bg-neutral-900 text-white">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold sm:text-5xl">Ready?</h2>
        <p className="mt-4 max-w-xl text-neutral-300">Closing pitch.</p>
        <CTAButton href="#" variant="secondary" className="mt-8">
          Start now
        </CTAButton>
      </div>
    </Section>
  );
}
