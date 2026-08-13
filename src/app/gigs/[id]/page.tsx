import { ExternalLink, MapPin, Clock, Music } from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { BlockUserButton } from "@/components/messaging/block-user-button";
import { ConnectButton } from "@/components/messaging/connect-button";
import { ReportButton } from "@/components/reports/report-button";
import { getGig } from "@/lib/api/gigs";
import { getCurrentSession } from "@/lib/auth-guards";
import {
  getMessagingBlockStatusForUser,
  getMessagingRelationshipForUser,
} from "@/lib/api/messaging";
import type {
  MessagingBlockStatus,
  MessagingRelationship,
} from "@/lib/api/types";
import { compensationLabel, projectTypeLabel } from "@/lib/display";
import { displayLocation } from "@/lib/location";

function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

export default async function GigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidId(id)) notFound();

  const [gig, session] = await Promise.all([
    getGig(id),
    getCurrentSession(),
  ]);
  if (!gig) notFound();

  const isOwnGig = session?.user?.id === gig.creatorId;
  const canReportGig = Boolean(session?.user?.role === "MUSICIAN" && !isOwnGig);
  const gigLocation = displayLocation(gig, "");
  let relationship: MessagingRelationship | null = null;
  let blockStatus: MessagingBlockStatus | null = null;
  let messagingUnavailable = false;

  if (session?.user?.id && !isOwnGig) {
    try {
      [relationship, blockStatus] = await Promise.all([
        getMessagingRelationshipForUser(session.user.id, gig.creatorId),
        getMessagingBlockStatusForUser(session.user.id, gig.creatorId),
      ]);
    } catch (error) {
      messagingUnavailable = true;
      console.error("[gig-detail] messaging status failed:", error);
    }
  }

  return (
    <div className="bg-paper px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-8">
          <BackLink href="/gigs">Back to gigs</BackLink>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <div className="min-w-0 space-y-8">
            <section>
              <div className="bg-brand px-6 py-8 text-white md:px-8 md:py-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-meta uppercase text-on-brand-muted">
                    {gig.status === "OPEN" ? "Open call" : "Call filled"}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-meta uppercase text-on-brand-muted">
                    {projectTypeLabel(gig.projectType)} · {compensationLabel(gig.compensationType)}
                  </p>
                  <h1 className="text-page-title text-white">
                    {gig.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-secondary text-on-brand-muted">
                    {gigLocation && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {gigLocation}
                      </span>
                    )}
                    {gig.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        Deadline: {new Date(gig.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-8 max-w-3xl whitespace-pre-wrap text-body text-on-brand-muted">
                  {gig.description}
                </p>
              </div>

              <div className="border-y border-rule py-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h2 className="text-meta uppercase text-muted">
                      Instruments
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gig.instruments?.length
                        ? gig.instruments.map((name) => <Chip key={name}>{name}</Chip>)
                        : <Chip>No instruments specified</Chip>}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-meta uppercase text-muted">
                      Genres
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gig.genres?.length
                        ? gig.genres.map((name) => <Chip key={name}>{name}</Chip>)
                        : <Chip>No genres specified</Chip>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-l-4 border-amber bg-amber-subtle px-5 py-5">
                  <p className="text-meta uppercase text-ink">
                    Compensation · {compensationLabel(gig.compensationType)}
                  </p>
                  <p className="mt-2 text-body font-semibold text-ink">
                    {gig.compensationDetails || "See project details above"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border-t-4 border-brand bg-ink p-6 text-white">
              <div className="relative z-10">
                <span className="text-meta uppercase text-on-ink-muted">
                  Contact
                </span>
                <h2 className="mt-3 text-section-heading">Contact the creator</h2>
                {!isOwnGig ? (
                  <p className="mt-3 text-secondary text-on-ink-body">
                    Send a request about this gig. If accepted, a message thread opens.
                  </p>
                ) : null}

                <div className="mt-6 border-y border-ink-muted py-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-on-ink-muted">
                    Posted by
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {gig.creator?.name || gig.creator?.email || "Unknown creator"}
                  </p>
                </div>

                {gig.isRemote && (
                  <div className="mt-4">
                    <Chip tone="blue">Remote-friendly</Chip>
                  </div>
                )}

                {!isOwnGig ? (
                  <ConnectButton
                    recipientId={gig.creatorId}
                    relationship={relationship}
                    blockStatus={blockStatus}
                    signedIn={Boolean(session?.user?.id)}
                    callbackUrl={`/gigs/${gig.id}`}
                    connectLabel="Contact Creator"
                    introMessage={`Reached out about your gig: ${gig.title}`}
                    disabledReason={messagingUnavailable ? "Messaging is unavailable right now." : null}
                  />
                ) : null}

                {session?.user?.id && !isOwnGig && relationship?.status !== "self" && !messagingUnavailable ? (
                  <BlockUserButton
                    userId={gig.creatorId}
                    initiallyBlocked={Boolean(blockStatus?.blockedByMe)}
                  />
                ) : null}
              </div>
            </div>

            {canReportGig ? (
              <div className="flex justify-end">
                <ReportButton
                  targetType="gig"
                  targetId={gig.id}
                  targetLabel={gig.title}
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
