"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendConnectionRequest } from "@/app/messages/actions";
import { invalidateContactContext } from "@/components/messaging/contact-context";
import type {
  MessagingBlockStatus,
  MessagingRelationship,
} from "@/lib/api/types";

export function ConnectButton({
  recipientId,
  relationship,
  blockStatus,
  signedIn,
  callbackUrl,
  introMessage,
  connectLabel = "Connect",
  disabledReason,
}: {
  recipientId: string;
  relationship: MessagingRelationship | null;
  blockStatus?: MessagingBlockStatus | null;
  signedIn: boolean;
  callbackUrl: string;
  introMessage?: string | null;
  connectLabel?: string;
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // `relationship` is not available on the first render. The contact context is
  // fetched client side, so this component mounts with `null` and receives the
  // real value a moment later. Seeding `useState(relationship)` therefore froze
  // it on `null` forever, and every returning visitor saw a fresh Connect button
  // instead of Pending, Message, or Respond to request.
  //
  // Keep the optimistic value separate from the server value and re-sync when
  // the server value changes, rather than deriving one from the other once.
  const [optimistic, setOptimistic] = useState<MessagingRelationship | null>(null);
  const [lastRelationship, setLastRelationship] = useState(relationship);
  if (relationship !== lastRelationship) {
    setLastRelationship(relationship);
    setOptimistic(null);
  }

  const state = optimistic ?? relationship;

  if (!signedIn) {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        prefetch={false}
        className="mt-5 flex w-full cursor-pointer items-center bg-brand px-5 py-3 text-control text-white transition-colors duration-150 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        Sign in to send a request
      </Link>
    );
  }

  if (state?.status === "self") return null;

  if (disabledReason) {
    return (
      <div className="mt-5 border-y border-[#334155] py-3 text-secondary text-[#CBD5E1]">
        {disabledReason}
      </div>
    );
  }

  if (blockStatus?.blockedByMe) {
    return (
      <div className="mt-5 border-y border-coral py-3 text-secondary text-coral">
        You blocked this user.
      </div>
    );
  }

  if (blockStatus?.blockedMe) {
    return (
      <div className="mt-5 border-y border-[#334155] py-3 text-secondary text-[#CBD5E1]">
        Messaging is unavailable.
      </div>
    );
  }

  if (state?.status === "connected") {
    return (
      <Link
        href={`/messages/${state.conversationId}`}
        className="mt-5 flex w-full cursor-pointer items-center bg-brand px-5 py-3 text-control text-white transition-colors duration-150 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        Message
      </Link>
    );
  }

  if (state?.status === "pending_incoming") {
    return (
      <Link
        href="/messages/requests"
        className="mt-5 flex w-full cursor-pointer items-center border border-white px-5 py-3 text-control text-white transition-colors duration-150 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        Respond to request
      </Link>
    );
  }

  if (state?.status === "pending_outgoing") {
    return (
      <div className="mt-5 border-y border-[#334155] py-3 text-secondary text-[#CBD5E1]">
        Pending
      </div>
    );
  }

  function connect() {
    setError(null);
    const now = new Date().toISOString();
    setOptimistic({
      status: "pending_outgoing",
      request: {
        id: `optimistic-${Date.now()}`,
        requesterId: "",
        recipientId,
        status: "pending",
        introMessage: introMessage ?? null,
        createdAt: now,
        updatedAt: now,
        acceptedAt: null,
        rejectedAt: null,
      },
    });
    startTransition(async () => {
      try {
        const request = await sendConnectionRequest(recipientId, introMessage);
        setOptimistic({ status: "pending_outgoing", request });
        // The context fetch is memoised per recipient for the lifetime of the
        // module, so without this the next mount would replay the pre-request
        // answer and show Connect again.
        invalidateContactContext(recipientId);
        router.refresh();
      } catch {
        setOptimistic(null);
        setError("Could not send this request.");
      }
    });
  }

  return (
    <div className="mt-5 space-y-2">
      <button
        type="button"
        onClick={connect}
        disabled={isPending}
        className="flex w-full cursor-pointer items-center bg-brand px-5 py-3 text-control text-white transition-colors duration-150 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Sending..." : connectLabel}
      </button>
      {error ? <p className="text-sm font-medium text-[#FDA29B]" role="alert">{error}</p> : null}
    </div>
  );
}
