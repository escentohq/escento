import { ExternalLink, MapPin, Clock, Music } from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { SectionCard } from "@/components/ui/section-card";
import { BlockUserButton } from "@/components/messaging/block-user-button";
import { ConnectButton } from "@/components/messaging/connect-button";
import { ReportButton } from "@/components/reports/report-button";
import { getProfile } from "@/lib/api/profiles";
import { getCurrentSession } from "@/lib/auth-guards";
import {
  getMessagingBlockStatusForUser,
  getMessagingRelationshipForUser,
} from "@/lib/api/messaging";
import type {
  MessagingBlockStatus,
  MessagingRelationship,
} from "@/lib/api/types";
import { displayLocation } from "@/lib/location";

function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function MusicianPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidId(id)) notFound();

  const [profile, session] = await Promise.all([
    getProfile(id),
    getCurrentSession(),
  ]);
  if (!profile) notFound();

  const isOwnProfile = session?.user?.id === profile.userId;
  const canReportProfile = Boolean(session?.user?.role === "CREATOR" && !isOwnProfile);
  let relationship: MessagingRelationship | null = null;
  let blockStatus: MessagingBlockStatus | null = null;
  let messagingUnavailable = false;

  if (session?.user?.id) {
    try {
      [relationship, blockStatus] = await Promise.all([
        getMessagingRelationshipForUser(session.user.id, profile.userId),
        getMessagingBlockStatusForUser(session.user.id, profile.userId),
      ]);
    } catch (error) {
      messagingUnavailable = true;
      console.error("[musician-profile] messaging status failed:", error);
    }
  }

  const links: Array<{ label: string; url: string }> = [
    ...(profile.websiteUrl ? [{ label: "Website", url: profile.websiteUrl }] : []),
    ...(profile.youtubeUrl ? [{ label: "YouTube", url: profile.youtubeUrl }] : []),
    ...(profile.soundcloudUrl ? [{ label: "SoundCloud", url: profile.soundcloudUrl }] : []),
    ...(profile.spotifyUrl ? [{ label: "Spotify", url: profile.spotifyUrl }] : []),
    ...(profile.instagramUrl ? [{ label: "Instagram", url: profile.instagramUrl }] : []),
  ];

  const abbr = initials(profile.displayName);
  const profileLocation = displayLocation(profile, "");

  return (
    <div className="bg-[#FAFAFA] px-4 py-12 sm:px-6 md:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <BackLink href="/musicians">Back to musicians</BackLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Main column ── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Cinematic profile header */}
            <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-bl-full bg-linear-to-br from-[#0055FF]/6 to-transparent"
                aria-hidden
              />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                    On stage
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-5">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#0055FF]/25 via-[#FF3366]/20 to-[#FFB000]/25 text-xl font-black text-[#0F172A] ring-4 ring-[#F1F5F9]">
                    {profile.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      abbr
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
                      {profile.displayName}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#64748B]">
                      {profileLocation && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {profileLocation}
                        </span>
                      )}
                      {profile.school && (
                        <span className="inline-flex items-center gap-1.5">
                          <Music className="h-3.5 w-3.5" aria-hidden />
                          {profile.school}
                        </span>
                      )}
                      {profile.yearsExperience != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {profile.yearsExperience}y exp
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <p className="mt-7 whitespace-pre-wrap text-base font-medium leading-relaxed text-[#475569]">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Instruments
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.instruments?.length
                        ? profile.instruments.map((name) => <Chip key={name} tone="blue">{name}</Chip>)
                        : <Chip>No instruments listed</Chip>}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Genres
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.genres?.length
                        ? profile.genres.map((name) => <Chip key={name} tone="pink">{name}</Chip>)
                        : <Chip>No genres listed</Chip>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Availability
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F172A]">
                      {profile.availabilityText || "Not specified"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Work style
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                        {profile.isRemote ? "Remote-friendly" : "In person"}
                      </Chip>
                      {profile.seekingPaid && <Chip tone="gold">Paid</Chip>}
                      {profile.seekingUnpaid && <Chip tone="pink">Unpaid + Credit</Chip>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio links */}
            {links.length > 0 && (
              <SectionCard eyebrow="Links" title="Portfolio">
                <ul className="grid gap-3 md:grid-cols-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A] transition-all duration-200 hover:border-[#0055FF] hover:text-[#0055FF] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Contact card — dark */}
            {!isOwnProfile ? (
            <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#0055FF]/20 to-transparent"
                aria-hidden
              />
              <div className="relative z-10">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                  Connect
                </span>
                <h2 className="mt-3 text-2xl font-black tracking-tight">Contact</h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#94A3B8]">
                  Interested in working together? Send a connection request to start a conversation.
                </p>

                <ConnectButton
                  recipientId={profile.userId}
                  relationship={relationship}
                  blockStatus={blockStatus}
                  signedIn={Boolean(session?.user?.id)}
                  callbackUrl={`/musicians/${profile.id}`}
                  disabledReason={messagingUnavailable ? "Messaging is unavailable right now." : null}
                />

                {session?.user?.id && relationship?.status !== "self" && !messagingUnavailable ? (
                  <BlockUserButton
                    userId={profile.userId}
                    initiallyBlocked={Boolean(blockStatus?.blockedByMe)}
                  />
                ) : null}
              </div>
            </div>
            ) : null}

            {canReportProfile ? (
              <div className="flex justify-end">
                <ReportButton
                  targetType="musician_profile"
                  targetId={profile.id}
                  targetLabel={profile.displayName}
                />
              </div>
            ) : null}

            {/* Work prefs */}
            <SectionCard eyebrow="Soundcheck" title="Work preferences">
              <div className="flex flex-wrap gap-2">
                <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                  {profile.isRemote ? "Remote-friendly" : "In person"}
                </Chip>
                {profile.seekingPaid && <Chip tone="gold">Paid</Chip>}
                {profile.seekingUnpaid && <Chip tone="pink">Unpaid + Credit</Chip>}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
