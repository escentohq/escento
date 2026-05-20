"use client";

import { Music, Video } from "lucide-react";
import { useTransition } from "react";

import { setRole } from "./actions";

function RoleButton({
  role,
  icon: Icon,
  title,
  body,
  cta,
  accentClass,
  hoverShadowClass,
}: {
  role: "MUSICIAN" | "CREATOR";
  icon: typeof Music;
  title: string;
  body: string;
  cta: string;
  accentClass: string;
  hoverShadowClass: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setRole(role))}
      className={`group flex h-full min-h-64 w-full flex-col items-start rounded-3xl border border-[#F1F5F9] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${hoverShadowClass} focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70`}
    >
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accentClass}`}>
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <span className="mt-8 text-2xl font-black tracking-tight text-[#0F172A]">{title}</span>
      <span className="mt-3 text-base font-medium leading-relaxed text-[#475569]">{body}</span>
      <span className="mt-auto pt-8 text-sm font-black text-[#0055FF]">
        {isPending ? "Setting up…" : cta}
      </span>
    </button>
  );
}

export function RoleOnboardingPicker() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <RoleButton
        role="MUSICIAN"
        icon={Music}
        title="I'm a Musician"
        body="Build a profile, list your sound, and get found by creators."
        cta="Take the stage →"
        accentClass="bg-[#0055FF]/10 text-[#0055FF]"
        hoverShadowClass="hover:shadow-[#0055FF]/10"
      />
      <RoleButton
        role="CREATOR"
        icon={Video}
        title="I'm a Creator"
        body="Post a gig, name the brief, and find the right musician."
        cta="Run the set →"
        accentClass="bg-[#FF3366]/10 text-[#FF3366]"
        hoverShadowClass="hover:shadow-[#FF3366]/10"
      />
    </div>
  );
}
