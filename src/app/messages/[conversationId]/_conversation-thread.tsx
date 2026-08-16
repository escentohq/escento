"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { markConversationAsRead, sendMessage } from "@/app/messages/actions";
import type { MessageRecord } from "@/lib/api/types";
import { refreshNavigationState } from "@/lib/navigation-state";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ConversationThread({
  conversationId,
  currentUserId,
  initialMessages,
  messagingUnavailable,
  initialUnreadCount = 0,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageRecord[];
  messagingUnavailable?: boolean;
  initialUnreadCount?: number;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (initialUnreadCount <= 0) return;
    let cancelled = false;
    async function markRead() {
      await markConversationAsRead(conversationId).catch(() => {});
      if (!cancelled) {
        refreshNavigationState();
        router.refresh();
      }
    }
    void markRead();
    return () => {
      cancelled = true;
    };
  }, [conversationId, initialUnreadCount, router]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendCurrentMessage();
  }

  function sendCurrentMessage() {
    if (isPending || messagingUnavailable) return;
    const nextBody = body.trim();
    if (!nextBody) {
      setError("Add a message.");
      return;
    }

    setError(null);
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: MessageRecord = {
      id: optimisticId,
      conversationId,
      senderId: currentUserId,
      body: nextBody,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    setMessages((current) => [...current, optimisticMessage]);
    setBody("");
    startTransition(async () => {
      try {
        const message = await sendMessage(conversationId, nextBody);
        setMessages((current) => current.map((item) => item.id === optimisticId ? message : item));
      } catch {
        setMessages((current) => current.filter((item) => item.id !== optimisticId));
        setBody(nextBody);
        setError("Message could not be sent.");
      }
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a new line. Ignore Enter while an IME
    // composition is active so it only confirms the candidate text.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendCurrentMessage();
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col border-y border-rule">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="py-8">
            <p className="text-secondary text-muted">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] px-4 py-3 ${
                    mine
                      ? "bg-ink text-white"
                      : "border border-rule bg-[#F8FAFC] text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">{message.body}</p>
                  <p className={`mt-2 font-mono text-[10px] ${mine ? "text-[#CBD5E1]" : "text-[#64748B]"}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-[#F1F5F9] p-4 sm:p-5">
        {messagingUnavailable ? (
          <div className="mb-4 border-l-4 border-coral px-4 py-3 text-secondary font-semibold text-[#B42318]">
            Messaging is unavailable because one of you has blocked the other.
          </div>
        ) : null}
        {error ? (
          <p className="mb-3 text-sm font-medium text-[#B42318]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="message-body" className="sr-only">Message</label>
          <textarea
            id="message-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={2000}
            placeholder="Write a message"
            disabled={messagingUnavailable}
            className="min-h-14 flex-1 resize-none border border-rule bg-surface px-3 py-3 text-body text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          <button
            type="submit"
            disabled={isPending || messagingUnavailable}
            className="control-primary min-h-14 gap-2 px-6 disabled:cursor-wait"
          >
            <Send className="h-4 w-4" aria-hidden />
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
