"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  rejectConnectionRequest,
} from "@/app/messages/actions";

export function IncomingRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runAccept() {
    setError(null);
    startTransition(async () => {
      try {
        const conversation = await acceptConnectionRequest(requestId);
        router.push(`/messages/${conversation.id}`);
        router.refresh();
      } catch {
        setError("Could not accept this request.");
      }
    });
  }

  function runReject() {
    setError(null);
    startTransition(async () => {
      try {
        await rejectConnectionRequest(requestId);
        router.refresh();
      } catch {
        setError("Could not reject this request.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={runAccept}
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0F172A] px-5 text-sm font-bold text-white transition-all hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={runReject}
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#FF3366] px-5 text-sm font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {error ? <p className="text-sm font-medium text-[#B42318]">{error}</p> : null}
    </div>
  );
}

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runCancel() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelConnectionRequest(requestId);
        router.refresh();
      } catch {
        setError("Could not cancel this request.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={runCancel}
        disabled={isPending}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#E2E8F0] px-4 text-xs font-bold text-[#475569] transition-colors hover:border-[#0F172A] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        Cancel
      </button>
      {error ? <p className="text-sm font-medium text-[#B42318]">{error}</p> : null}
    </div>
  );
}
