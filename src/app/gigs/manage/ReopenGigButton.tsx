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
      className="w-full  bg-[#0055FF] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0044DD] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? "Reopening..." : "Reopen Gig"}
    </button>
  );
}
