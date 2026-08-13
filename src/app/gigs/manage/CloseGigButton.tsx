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
      className="w-full  bg-[#F8FAFC] px-4 py-2.5 text-sm font-bold text-[#475569] transition-all duration-200 hover:bg-[#E2E8F0] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? "Marking filled…" : "Mark Filled"}
    </button>
  );
}
