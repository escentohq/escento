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
    <div className="bg-[#FAFAFA] px-4 py-12 sm:px-6 md:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <BackLink href="/gigs">Back to gigs</BackLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-bl-full bg-linear-to-br from-[#FF3366]/6 to-transparent"
                aria-hidden
              />

              <div className="relative z-10">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
                  Open call
                </span>

                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                      {projectTypeLabel(gig.projectType)}
                    </span>
                    <Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip>
                    {gig.creator?.name ? <Chip tone="blue">Verified Creator</Chip> : null}
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
                    {gig.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#64748B]">
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

                <p className="mt-7 whitespace-pre-wrap text-base font-medium leading-relaxed text-[#475569]">
                  {gig.description}
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Instruments
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gig.instruments?.length
                        ? gig.instruments.map((name) => <Chip key={name} tone="blue">{name}</Chip>)
                        : <Chip>No instruments specified</Chip>}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Genres
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gig.genres?.length
                        ? gig.genres.map((name) => <Chip key={name} tone="pink">{name}</Chip>)
                        : <Chip>No genres specified</Chip>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                    Compensation
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#0F172A]">
                    {gig.compensationDetails || "See project details above"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent"
                aria-hidden
              />
              <div className="relative z-10">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
                  Details
                </span>
                <h2 className="mt-3 text-2xl font-black tracking-tight">About</h2>
                {!isOwnGig ? (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-[#94A3B8]">
                    Interested in this project? Reach out to the creator directly.
                  </p>
                ) : null}

                <div className="mt-6 rounded-2xl bg-[#1E293B] p-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
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
