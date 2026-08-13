"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteConversationForMe } from "@/app/messages/actions";

export function HideConversationButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function hideConversation() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteConversationForMe(conversationId);
        router.push("/messages");
        router.refresh();
      } catch {
        setError("Could not hide this conversation.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={hideConversation}
        disabled={isPending}
        className="inline-flex min-h-10 items-center justify-center gap-2 border border-rule px-4 text-control text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {isPending ? "Hiding..." : "Hide"}
      </button>
      {error ? <p className="text-sm font-medium text-[#B42318]" role="alert">{error}</p> : null}
    </div>
  );
}
