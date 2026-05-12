import { CTAButton } from "@/components/mockups/_shared/CTAButton";

export function Hero() {
  return (
    <header className="border-b-2 border-neutral-900 px-6 py-24 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Issue No. 01 — Spring</p>
        <h1 className="mt-6 text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
          Book the band.
          <br />
          <span className="italic text-neutral-500">Skip the bullshit.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-700">
          Gig Forge connects musicians with venues directly — no agents, no markup, no email tag.
        </p>
        <div className="mt-10 flex gap-3">
          <CTAButton href="/signin">Sign in</CTAButton>
          <CTAButton href="/musicians" variant="ghost">
            Browse musicians →
          </CTAButton>
        </div>
      </div>
    </header>
  );
}
