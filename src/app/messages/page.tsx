import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { requireUser } from "@/lib/auth-guards";
import { listConversationsForUser } from "@/lib/api/messaging";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Reveal } from "@/components/ui/reveal";
import type { ConversationSummary } from "@/lib/api/types";

function displayName(name?: string | null, email?: string | null) {
  return name || email || "Motivo user";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(value: string | null) {
  if (!value) return "No messages yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function MessagesPage() {
  const session = await requireUser("/messages");
  let conversations: ConversationSummary[] = [];
  let messagingUnavailable = false;

  try {
    conversations = await listConversationsForUser(session.user.id);
  } catch (error) {
    messagingUnavailable = true;
    console.error("[messages] conversation list failed:", error);
  }

  return (
    <PageShell
      eyebrow="Backstage"
      title="Messages"
      body="Your accepted conversations. Requests live one door over."
      action={<PrimaryCta href="/messages/requests" icon={MessageCircle}>View Requests</PrimaryCta>}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/messages/blocked" className="btn-secondary min-h-11 px-5 text-xs">
          Blocked Users
        </Link>
      </div>

      {messagingUnavailable ? (
        <EmptyState
          eyebrow="Setup"
          title="Messaging is not ready yet."
          body="Apply the messaging database migration, then refresh this page."
        />
      ) : conversations.length === 0 ? (
        <EmptyState
          eyebrow="Quiet room"
          title="No conversations yet."
          body="Start by connecting with someone from a profile."
          cta={<PrimaryCta href="/musicians">Browse Musicians</PrimaryCta>}
        />
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation, index) => {
            const other = conversation.otherParticipant?.user;
            const name = displayName(other?.name, other?.email);
            const preview = conversation.lastMessage?.body ?? "No messages yet.";
            const unread = conversation.unreadCount > 0;

            return (
              <Reveal key={conversation.id} delay={Math.min(index, 6) * 0.04}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className={`group flex min-w-0 items-center gap-4 rounded-3xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0055FF]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${
                    unread ? "border-[#0055FF]/30" : "border-[#F1F5F9]"
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F1F5F9]">
                    {other?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={other.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#0055FF]/10 text-sm font-black text-[#0055FF]">
                        {initials(name)}
                      </div>
                    )}
                    {unread ? (
                      <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#FF3366]" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <h2 className="truncate text-base font-black text-[#0F172A]">{name}</h2>
                      <span className="shrink-0 font-mono text-xs text-[#64748B]">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`mt-1 truncate text-sm ${unread ? "font-bold text-[#0F172A]" : "font-medium text-[#64748B]"}`}>
                      {preview}
                    </p>
                  </div>

                  {unread ? (
                    <span className="hidden rounded-full bg-[#FF3366]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF3366] sm:inline-flex">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
