"use client";

import { useTransition } from "react";

import { setRole } from "./actions";

function RoleButton({
  role,
  title,
  body,
  cta,
}: {
  role: "MUSICIAN" | "CREATOR";
  title: string;
  body: string;
  cta: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setRole(role))}
      className="group flex h-full min-h-56 w-full flex-col items-start border-t-4 border-ink bg-surface py-6 text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70 md:px-6"
    >
      <span className="text-section-heading text-ink">{title}</span>
      <span className="mt-3 max-w-sm text-body text-muted">{body}</span>
      <span className="mt-auto pt-8 text-control text-brand">
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
        title="I play music"
        body="Create a profile, browse gigs, and message creators."
        cta="Choose musician"
      />
      <RoleButton
        role="CREATOR"
        title="I need musicians"
        body="Post gigs, browse musicians, and send requests."
        cta="Choose creator"
      />
    </div>
  );
}
