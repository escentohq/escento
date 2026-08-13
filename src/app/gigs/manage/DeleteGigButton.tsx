"use client";

import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteGigAction } from "./actions";

export function DeleteGigButton({ gigId, className = "" }: { gigId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => {
      void deleteGigAction(gigId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={`inline-flex min-h-11 items-center justify-center  border border-[#FF3366] bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50 ${className}`}
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>

      {open ? (
        <ConfirmDialog
          open
          title="Delete this gig?"
          description="This gig and its details will be permanently removed. This cannot be undone."
          confirmLabel="Delete gig"
          pending={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
