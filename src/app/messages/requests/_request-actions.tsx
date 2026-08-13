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
          className="control-primary min-h-11 px-5 disabled:cursor-wait"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={runReject}
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center border border-coral px-5 text-control text-coral transition-colors hover:bg-coral hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
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
        className="inline-flex min-h-10 items-center justify-center border border-rule px-4 text-control text-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        Cancel
      </button>
      {error ? <p className="text-sm font-medium text-[#B42318]">{error}</p> : null}
    </div>
  );
}
