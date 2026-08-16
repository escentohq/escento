"use client";

import { useTransition } from "react";

import { type AppRole } from "@/lib/onboarding-role";
import { grantCapability, setRole } from "./actions";

function RoleButton({
  role,
  title,
  body,
  cta,
}: {
  role: AppRole;
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

/**
 * The confirm step for adding a second capability. Explicit rather than a silent
 * grant on first use: the change cannot be undone from the product, so it should
 * not happen as a side effect of clicking a link.
 */
export function AddCapabilityCard({
  role,
  cta,
  next,
}: {
  role: AppRole;
  cta: string;
  next?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border-t-4 border-ink bg-surface py-6 md:px-6">
      <p className="max-w-xl text-body text-muted">
        Adding this is permanent. You can hold both, but you cannot remove one later.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => grantCapability(role, next))}
        className="control-primary mt-6 min-h-12 cursor-pointer px-6 disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Setting up…" : cta}
      </button>
    </div>
  );
}
