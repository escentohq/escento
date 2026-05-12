import { Section } from "@/components/mockups/_shared/Section";
import { CTAButton } from "@/components/mockups/_shared/CTAButton";

export function Hero() {
  return (
    <Section className="text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
        Your headline here.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
        One-line value prop. Keep it tight. Show, don&apos;t tell.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <CTAButton href="#">Get started</CTAButton>
        <CTAButton href="#" variant="secondary">
          See how it works
        </CTAButton>
      </div>
    </Section>
  );
}
