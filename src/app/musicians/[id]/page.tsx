import { ExternalLink, MapPin, Clock, Music } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { SectionCard } from "@/components/ui/section-card";
import { MusicianContactActions } from "@/components/messaging/public-contact-actions";
import { getProfile } from "@/lib/api/profiles";
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

  const profile = await getProfile(id);
  if (!profile) notFound();

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
    <div className="bg-paper px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-8">
          <BackLink href="/musicians">Back to musicians</BackLink>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          {/* ── Main column ── */}
          <div className="min-w-0 space-y-8">

            <section className="bg-brand px-6 py-8 text-white md:px-8 md:py-10">
                <span className="text-meta uppercase text-on-brand-muted">
                  Musician profile
                </span>

                <div className="mt-6 grid gap-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-end">
                  <div className="flex h-36 w-36 flex-shrink-0 items-center justify-center overflow-hidden bg-brand-subtle text-3xl font-semibold text-brand">
                    {profile.image ? (
                      <Image
                        src={profile.image}
                        alt={`${profile.displayName}, musician on Escento`}
                        width={144}
                        height={144}
                        sizes="144px"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      abbr
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-page-title text-white">
                      {profile.displayName}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-secondary text-on-brand-muted">
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
                  <p className="mt-8 max-w-3xl whitespace-pre-wrap text-body text-on-brand-muted">
                    {profile.bio}
                  </p>
                )}
            </section>

            <section className="border-y border-rule py-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h2 className="text-meta uppercase text-muted">
                      Instruments
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.instruments?.length
                        ? profile.instruments.map((name) => <Chip key={name}>{name}</Chip>)
                        : <Chip>No instruments listed</Chip>}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-meta uppercase text-muted">
                      Genres
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.genres?.length
                        ? profile.genres.map((name) => <Chip key={name}>{name}</Chip>)
                        : <Chip>No genres listed</Chip>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid border-t border-rule md:grid-cols-2 md:divide-x md:divide-rule">
                  <div className="py-5 md:pr-6">
                    <p className="text-meta uppercase text-muted">
                      Availability
                    </p>
                    <p className="mt-2 text-body font-semibold text-ink">
                      {profile.availabilityText || "Not specified"}
                    </p>
                  </div>
                  <div className="border-t border-rule py-5 md:border-t-0 md:pl-6">
                    <p className="text-meta uppercase text-muted">
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
            </section>

            {/* Portfolio links */}
            {links.length > 0 && (
              <SectionCard eyebrow="Links" title="Portfolio">
                <ul className="divide-y divide-rule border-y border-rule">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-1 text-control text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
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
            <MusicianContactActions
              recipientId={profile.userId}
              profileId={profile.id}
              profileName={profile.displayName}
            />

          </aside>
        </div>
      </div>
    </div>
  );
}
