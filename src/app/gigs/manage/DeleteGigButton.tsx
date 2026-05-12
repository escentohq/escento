"use client";

import { useTransition } from "react";

import { deleteGig } from "./actions";

export function DeleteGigButton({ gigId }: { gigId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("Delete this gig? This cannot be undone.")) return;
        startTransition(() => deleteGig(gigId));
      }}
      disabled={isPending}
      className="inline-flex h-10 items-center justify-center rounded-full border border-[#FF3366] bg-white px-4 text-xs font-bold tracking-wide text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
