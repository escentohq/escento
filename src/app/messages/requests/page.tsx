import Link from "next/link";

import { requireUser } from "@/lib/auth-guards";
import {
  listIncomingConnectionRequests,
  listOutgoingConnectionRequests,
} from "@/lib/api/messaging";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import {
  CancelRequestButton,
  IncomingRequestActions,
} from "./_request-actions";

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
  const [incoming, outgoing] = await Promise.all([
    listIncomingConnectionRequests(session.user.id),
    listOutgoingConnectionRequests(session.user.id),
  ]);

  const pendingIncoming = incoming.filter((request) => request.status === "pending");

  return (
    <PageShell
      eyebrow="Soundcheck"
      title="Connection Requests"
      body="Accept a request to open a conversation. Pending outgoing requests stay here until they move."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
              Incoming
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Waiting on you</h2>
          </div>

          {pendingIncoming.length === 0 ? (
            <EmptyState
              eyebrow="Clear"
              title="No incoming requests."
              body="New connection requests will land here."
            />
          ) : (
            pendingIncoming.map((request, index) => {
              const user = request.requester;
              const name = displayName(user?.name, user?.email);

              return (
                <Reveal key={request.id} delay={Math.min(index, 6) * 0.04}>
                  <article className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F1F5F9]">
                        {user?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0055FF]/10 text-sm font-black text-[#0055FF]">
                            {initials(name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-black text-[#0F172A]">{name}</h3>
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
                </Reveal>
              );
            })
          )}
        </section>

        <section className="space-y-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
              Outgoing
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Sent requests</h2>
          </div>

          {outgoing.length === 0 ? (
            <EmptyState
              eyebrow="No sends"
              title="You have not reached out yet."
              body="Open a profile and send a connection request."
              cta={<Link href="/musicians" className="btn-secondary">Browse Musicians</Link>}
            />
          ) : (
            outgoing.map((request, index) => {
              const user = request.recipient;
              const name = displayName(user?.name, user?.email);

              return (
                <Reveal key={request.id} delay={Math.min(index, 6) * 0.04}>
                  <article className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-black text-[#0F172A]">{name}</h3>
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
                </Reveal>
              );
            })
          )}
        </section>
      </div>
    </PageShell>
  );
}
