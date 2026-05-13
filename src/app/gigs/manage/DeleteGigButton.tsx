"use client";

import { useTransition } from "react";

import { deleteGigAction } from "./actions";

export function DeleteGigButton({ gigId, className = "" }: { gigId: string; className?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("Delete this gig? This cannot be undone.")) return;
        startTransition(() => deleteGigAction(gigId));
      }}
      disabled={isPending}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-[#FF3366] bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50 ${className}`}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
