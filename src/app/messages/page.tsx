import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth-guards";
import {
  listConversationsForUser,
  listIncomingConnectionRequests,
} from "@/lib/api/messaging";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import type { ConnectionRequest, ConversationSummary } from "@/lib/api/types";
import { getMessagingDisplayName, isEscentoSupportSummary } from "@/lib/support-identity";

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
  let incomingRequests: ConnectionRequest[] = [];
  let messagingUnavailable = false;

  try {
    [conversations, incomingRequests] = await Promise.all([
      listConversationsForUser(session.user.id),
      listIncomingConnectionRequests(session.user.id),
    ]);
  } catch (error) {
    messagingUnavailable = true;
    console.error("[messages] conversation list failed:", error);
  }

  const pendingIncomingRequestCount = incomingRequests.filter(
    (request) => request.status === "pending",
  ).length;

  return (
    <PageShell
      eyebrow="Inbox"
      title="Messages"
      body="Accepted requests appear here. New requests stay in your inbox until you respond."
      action={
        <PrimaryCta
          href="/messages/requests"
          badgeCount={pendingIncomingRequestCount}
        >
          View requests
        </PrimaryCta>
      }
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/messages/blocked" className="control-secondary min-h-11 px-5 text-xs">
          Blocked users
        </Link>
      </div>

      {messagingUnavailable ? (
        <EmptyState
          title="Messaging is not ready yet."
          body="Apply the messaging database migration, then refresh this page."
        />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet."
          body="Send a request from a musician profile or gig."
          cta={<PrimaryCta href="/musicians">Browse musicians</PrimaryCta>}
        />
      ) : (
        <div className="divide-y divide-rule border-y border-rule">
          {conversations.map((conversation) => {
            const other = conversation.otherParticipant?.user;
            const name = getMessagingDisplayName(other);
            const officialSupport = isEscentoSupportSummary(other);
            const preview = conversation.lastMessage?.body ?? "No messages yet.";
            const unread = conversation.unreadCount > 0;

            return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`group flex min-w-0 items-center gap-4 px-1 py-5 transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${unread ? "border-l-4 border-brand pl-3" : "md:px-4"}`}
                >
                  <div className="media-avatar relative h-12 w-12 shrink-0 overflow-hidden bg-[#F1F5F9]">
                    {other?.image ? (
                      <Image src={other.image} alt="" width={48} height={48} sizes="48px" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#0055FF]/10 text-control text-brand">
                        {initials(name)}
                      </div>
                    )}
                    {unread ? (
                      <span className="status-dot absolute right-0 top-0 h-3 w-3 border-2 border-white bg-coral" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="truncate text-body font-semibold text-ink">{name}</h2>
                        {officialSupport ? (
                          <span className="shrink-0 border border-brand px-2 py-0.5 text-meta uppercase text-brand">
                            Official support
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-mono text-xs text-[#64748B]">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`mt-1 truncate text-sm ${unread ? "font-bold text-[#0F172A]" : "font-medium text-[#64748B]"}`}>
                      {preview}
                    </p>
                  </div>

                  {unread ? (
                    <span className="hidden border border-coral px-2 py-1 text-meta text-coral sm:inline-flex">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
