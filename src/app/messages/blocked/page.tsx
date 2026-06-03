import Link from "next/link";

import { BlockUserButton } from "@/components/messaging/block-user-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { requireUser } from "@/lib/auth-guards";
import { listBlockedUsersForUser } from "@/lib/api/messaging";

function displayName(name?: string | null, email?: string | null) {
  return name || email || "Motivo user";
}

export default async function BlockedUsersPage() {
  const session = await requireUser("/messages/blocked");
  const blockedUsers = await listBlockedUsersForUser(session.user.id);

  return (
    <PageShell
      eyebrow="Backstage"
      title="Blocked Users"
      body="Manage people who cannot send you requests or messages."
      size="medium"
    >
      {blockedUsers.length === 0 ? (
        <EmptyState
          eyebrow="Clear"
          title="No blocked users."
          body="Blocked people will show up here."
          cta={<Link href="/messages" className="btn-secondary">Back to Messages</Link>}
        />
      ) : (
        <div className="space-y-4">
          {blockedUsers.map((block, index) => {
            const user = block.blockedUser;
            const name = displayName(user?.name, user?.email);
            return (
              <Reveal key={block.id} delay={Math.min(index, 6) * 0.04}>
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-[#0F172A]">{name}</h2>
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
