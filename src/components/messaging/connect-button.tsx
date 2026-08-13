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
        className="group mt-5 flex w-full cursor-pointer items-center justify-between  bg-[#0055FF] px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0044DD] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <span>Sign in to Connect</span>
        <UserPlus className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  if (state?.status === "self") return null;

  if (disabledReason) {
    return (
      <div className="mt-5  border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-sm font-bold text-[#64748B]">
        {disabledReason}
      </div>
    );
  }

  if (blockStatus?.blockedByMe) {
    return (
      <div className="mt-5  border border-[#FF3366]/30 bg-[#FF3366]/10 px-5 py-3.5 text-sm font-bold text-[#FF3366]">
        You blocked this user.
      </div>
    );
  }

  if (blockStatus?.blockedMe) {
    return (
      <div className="mt-5  border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-sm font-bold text-[#64748B]">
        Messaging is unavailable.
      </div>
    );
  }

  if (state?.status === "connected") {
    return (
      <Link
        href={`/messages/${state.conversationId}`}
        className="group mt-5 flex w-full cursor-pointer items-center justify-between  bg-[#0055FF] px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0044DD] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
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
        className="group mt-5 flex w-full cursor-pointer items-center justify-between  bg-[#FFB000] px-5 py-3.5 text-sm font-bold text-[#0F172A] transition-all duration-200 hover:bg-[#E6A000] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <span>Respond to Request</span>
        <MessageCircle className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  if (state?.status === "pending_outgoing") {
    return (
      <div className="mt-5  border border-[#FFB000]/30 bg-[#FFB000]/10 px-5 py-3.5 text-sm font-bold text-[#8A5C00]">
        Pending
      </div>
    );
  }

  function connect() {
    setError(null);
    startTransition(async () => {
      try {
        const request = await sendConnectionRequest(recipientId, introMessage);
        setState({ status: "pending_outgoing", request });
        router.refresh();
      } catch {
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
        className="group flex w-full cursor-pointer items-center justify-between  bg-[#0055FF] px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0044DD] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <span>{isPending ? "Sending..." : connectLabel}</span>
        <UserPlus className="h-4 w-4" aria-hidden />
      </button>
      {error ? <p className="text-sm font-medium text-[#FDA29B]" role="alert">{error}</p> : null}
    </div>
  );
}
