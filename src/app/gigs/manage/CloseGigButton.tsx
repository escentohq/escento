"use client";

import { useTransition } from "react";

import { closeGigAction } from "./actions";

export function CloseGigButton({ gigId }: { gigId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => closeGigAction(gigId))}
      className="w-full border border-rule bg-surface px-4 py-2.5 text-control text-muted transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? "Marking filled…" : "Mark Filled"}
    </button>
  );
}
