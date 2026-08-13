import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { BlockUserButton } from "@/components/messaging/block-user-button";
import { requireUser } from "@/lib/auth-guards";
import {
  getConversationForUser,
  getMessagingBlockStatusForUser,
  markConversationReadForUser,
} from "@/lib/api/messaging";
import { getMessagingDisplayName, isEscentoSupportSummary } from "@/lib/support-identity";
import { HideConversationButton } from "./_conversation-actions";
import { ConversationThread } from "./_conversation-thread";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isValidId(id: string) {
  return id.length > 0 && id.length < 128;
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await requireUser("/messages");
  const { conversationId } = await params;
  if (!isValidId(conversationId)) notFound();

  const conversation = await getConversationForUser(session.user.id, conversationId);
  if (!conversation) notFound();

  await markConversationReadForUser(session.user.id, conversationId);

  const other = conversation.otherParticipant?.user;
  const name = getMessagingDisplayName(other);
  const officialSupport = isEscentoSupportSummary(other);
  const blockStatus = other
    ? await getMessagingBlockStatusForUser(session.user.id, other.id)
    : { blockedByMe: false, blockedMe: false };
  const messagingUnavailable = blockStatus.blockedByMe || blockStatus.blockedMe;

  return (
    <div className="bg-[#FAFAFA] px-4 py-8 sm:px-6 md:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <BackLink href="/messages">Back to messages</BackLink>
        </div>

        <header className="mb-6 border-y border-rule py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="media-avatar h-12 w-12 shrink-0 overflow-hidden bg-[#F1F5F9]">
                {other?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={other.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0055FF]/10 text-control text-brand">
                    {initials(name)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-meta uppercase text-muted">
                  Conversation
                </span>
                <h1 className="mt-1 truncate text-section-heading text-ink">
                  {name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip tone="blue">{officialSupport ? "Official support" : "Direct"}</Chip>
                  {messagingUnavailable ? <Chip tone="pink">Blocked</Chip> : null}
                </div>
              </div>
            </div>
            {other && !officialSupport ? (
              <div className="flex flex-wrap gap-2">
                <BlockUserButton
                  userId={other.id}
                  initiallyBlocked={blockStatus.blockedByMe}
                  compact
                />
                <HideConversationButton conversationId={conversation.id} />
              </div>
            ) : null}
          </div>
        </header>

        <ConversationThread
          conversationId={conversation.id}
          currentUserId={session.user.id}
          initialMessages={conversation.messages}
          messagingUnavailable={messagingUnavailable}
          initialUnreadCount={conversation.unreadCount}
        />
      </div>
    </div>
  );
}
