"use client";

import { useTransition } from "react";

import { reopenGigAction } from "./actions";

export function ReopenGigButton({ gigId }: { gigId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => reopenGigAction(gigId))}
      className="w-full bg-brand px-4 py-2.5 text-control text-white transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? "Reopening..." : "Reopen Gig"}
    </button>
  );
}
