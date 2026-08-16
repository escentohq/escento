import Link from "next/link";
import Image from "next/image";

import { requireUser } from "@/lib/auth-guards";
import {
  listIncomingConnectionRequests,
  listOutgoingConnectionRequests,
} from "@/lib/api/messaging";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import {
  CancelRequestButton,
  IncomingRequestActions,
} from "./_request-actions";
import type { ConnectionRequest } from "@/lib/api/types";

function displayName(name?: string | null, email?: string | null) {
  return name || email || "Escento user";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusTone(status: string) {
  if (status === "accepted") return "blue";
  if (status === "rejected" || status === "cancelled") return "pink";
  return "gold";
}

function roleLabel(role?: string | null) {
  return role ? role.toLowerCase() : "user";
}

export default async function MessageRequestsPage() {
  const session = await requireUser("/messages/requests");
  let incoming: ConnectionRequest[] = [];
  let outgoing: ConnectionRequest[] = [];
  let messagingUnavailable = false;

  try {
    [incoming, outgoing] = await Promise.all([
      listIncomingConnectionRequests(session.user.id),
      listOutgoingConnectionRequests(session.user.id),
    ]);
  } catch (error) {
    messagingUnavailable = true;
    console.error("[message-requests] request list failed:", error);
  }

  const pendingIncoming = incoming.filter((request) => request.status === "pending");

  return (
    <PageShell
      eyebrow="Inbox"
      title="Connection requests"
      body="Accept to open a conversation, or decline without starting a thread."
    >
      {messagingUnavailable ? (
        <EmptyState
          title="Requests are not ready yet."
          body="Apply the messaging database migration, then refresh this page."
        />
      ) : (
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div>
            <h2 className="text-section-heading">Incoming</h2>
          </div>

          {pendingIncoming.length === 0 ? (
            <EmptyState
              title="No incoming requests."
              body="New requests will appear here."
            />
          ) : (
            <div className="divide-y divide-rule border-y border-rule">
            {pendingIncoming.map((request) => {
              const user = request.requester;
              const name = displayName(user?.name, user?.email);

              return (
                  <article key={request.id} className="py-6">
                    <div className="flex gap-4">
                      <div className="media-avatar h-12 w-12 shrink-0 overflow-hidden bg-[#F1F5F9]">
                        {user?.image ? (
                          <Image src={user.image} alt="" width={48} height={48} sizes="48px" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0055FF]/10 text-control text-brand">
                            {initials(name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-item-heading text-ink">{name}</h3>
                          <Chip tone="neutral">{roleLabel(user?.role)}</Chip>
                        </div>
                        {request.introMessage ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#475569]">
                            {request.introMessage}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm font-medium text-[#64748B]">
                            No intro message.
                          </p>
                        )}
                        <div className="mt-5">
                          <IncomingRequestActions requestId={request.id} />
                        </div>
                      </div>
                    </div>
                  </article>
              );
            })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-section-heading">Sent</h2>
          </div>

          {outgoing.length === 0 ? (
            <EmptyState
              title="No sent requests."
              body="Open a profile or gig to send one."
              cta={<Link href="/musicians" className="control-secondary">Browse musicians</Link>}
            />
          ) : (
            <div className="divide-y divide-rule border-y border-rule">
            {outgoing.map((request) => {
              const user = request.recipient;
              const name = displayName(user?.name, user?.email);

              return (
                  <article key={request.id} className="py-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-item-heading text-ink">{name}</h3>
                        <div className="mt-2">
                          <Chip tone={statusTone(request.status)}>
                            {request.status}
                          </Chip>
                        </div>
                      </div>
                      {request.status === "pending" ? (
                        <CancelRequestButton requestId={request.id} />
                      ) : null}
                    </div>
                  </article>
              );
            })}
            </div>
          )}
        </section>
      </div>
      )}
    </PageShell>
  );
}
