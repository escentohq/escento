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
      className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:border-red-800 hover:bg-red-950/50 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
