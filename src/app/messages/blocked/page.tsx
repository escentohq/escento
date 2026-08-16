import Link from "next/link";

import { BlockUserButton } from "@/components/messaging/block-user-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { requireUser } from "@/lib/auth-guards";
import { listBlockedUsersForUser } from "@/lib/api/messaging";
import type { BlockedUser } from "@/lib/api/types";

function displayName(name?: string | null, email?: string | null) {
  return name || email || "Escento user";
}

export default async function BlockedUsersPage() {
  const session = await requireUser("/messages/blocked");
  let blockedUsers: BlockedUser[] = [];
  let messagingUnavailable = false;

  try {
    blockedUsers = await listBlockedUsersForUser(session.user.id);
  } catch (error) {
    messagingUnavailable = true;
    console.error("[blocked-users] list failed:", error);
  }

  return (
    <PageShell
      eyebrow="Inbox"
      title="Blocked users"
      body="Manage people who cannot send you requests or messages."
      size="medium"
    >
      {messagingUnavailable ? (
        <EmptyState
          title="Blocking is not ready yet."
          body="Apply the messaging database migration, then refresh this page."
        />
      ) : blockedUsers.length === 0 ? (
        <EmptyState
          title="No blocked users."
          body="People you block will appear here."
          cta={<Link href="/messages" className="control-secondary">Back to messages</Link>}
        />
      ) : (
        <div className="space-y-4">
          {blockedUsers.map((block, index) => {
            const user = block.blockedUser;
            const name = displayName(user?.name, user?.email);
            return (
              <Reveal key={block.id} delay={Math.min(index, 6) * 0.04}>
                <div className="flex items-center justify-between gap-4 border-y border-rule py-5">
                  <div className="min-w-0">
                    <h2 className="truncate text-body font-semibold text-ink">{name}</h2>
                    {user?.role ? (
                      <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-[#64748B]">
                        {user.role.toLowerCase()}
                      </p>
                    ) : null}
                  </div>
                  <BlockUserButton userId={block.blockedId} initiallyBlocked compact />
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
