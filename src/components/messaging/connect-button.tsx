"use client";

import Link from "next/link";
import { MessageCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendConnectionRequest } from "@/app/messages/actions";
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
  const [state, setState] = useState<MessagingRelationship | null>(relationship);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        prefetch={false}
        className="mt-5 flex w-full cursor-pointer items-center justify-between bg-brand px-5 py-3 text-control text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <span>Sign in to send a request</span>
        <UserPlus className="h-4 w-4" aria-hidden />
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
        className="mt-5 flex w-full cursor-pointer items-center justify-between bg-brand px-5 py-3 text-control text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <span>Message</span>
        <MessageCircle className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  if (state?.status === "pending_incoming") {
    return (
      <Link
        href="/messages/requests"
        className="mt-5 flex w-full cursor-pointer items-center justify-between border border-white px-5 py-3 text-control text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <span>Respond to Request</span>
        <MessageCircle className="h-4 w-4" aria-hidden />
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
    const previous = state;
    const now = new Date().toISOString();
    setState({
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
        setState({ status: "pending_outgoing", request });
        router.refresh();
      } catch {
        setState(previous);
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
        className="flex w-full cursor-pointer items-center justify-between bg-brand px-5 py-3 text-control text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <span>{isPending ? "Sending..." : connectLabel}</span>
        <UserPlus className="h-4 w-4" aria-hidden />
      </button>
      {error ? <p className="text-sm font-medium text-[#FDA29B]" role="alert">{error}</p> : null}
    </div>
  );
}
