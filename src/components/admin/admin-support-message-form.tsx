"use client";

import { Send } from "lucide-react";
import { useState, useTransition } from "react";

import { adminSendSupportMessageAction } from "@/app/admin/actions";
import { Textarea } from "@/components/ui/textarea";

export function AdminSupportMessageForm({ targetUserId }: { targetUserId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextBody = body.trim();
    if (!nextBody) {
      setError("Add a message.");
      return;
    }

    const formData = new FormData();
    formData.set("targetUserId", targetUserId);
    formData.set("body", nextBody);

    setError(null);
    startTransition(async () => {
      try {
        await adminSendSupportMessageAction(formData);
        setBody("");
      } catch {
        setError("Message could not be sent as Escento. Confirm the support migration is applied.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="border-t border-[#F1F5F9] p-4">
      {error ? (
        <p className="mb-3 text-sm font-bold text-[#B42318]" role="alert">
          {error}
        </p>
      ) : null}
      <label htmlFor="support-message-body" className="text-sm font-bold text-[#0F172A]">
        Send as Escento
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Textarea
          id="support-message-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Write a support message"
          className="min-h-24 flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2  bg-[#0F172A] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden />
          {isPending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
