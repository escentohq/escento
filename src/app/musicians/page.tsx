import Link from "next/link";

import { requireUser } from "@/lib/auth-guards";
import { listInstruments, listGenres } from "@/lib/api/tags";
import { listProfiles } from "@/lib/api/profiles";
import { clampText, visibleTags } from "@/lib/display";
import { displayLocation, parseLocationSearch } from "@/lib/location";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { parseSelectedTags } from "@/lib/tag-taxonomy";

export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; instrument?: string | string[]; genre?: string | string[]; locationDisplayName?: string; lat?: string; lng?: string; radius?: string; remote?: string }>;
}) {
  const { q, instrument, genre, locationDisplayName, lat, lng, radius, remote } = await searchParams;
  const locationSearch = parseLocationSearch({ q, lat, lng, radius, remote });
  const selectedInstruments = parseSelectedTags(instrument);
  const selectedGenres = parseSelectedTags(genre);

  const [session, instruments, genres, profiles] = await Promise.all([
    requireUser("/musicians"),
    listInstruments(),
    listGenres(),
    listProfiles({ q: locationSearch.query, instruments: selectedInstruments, genres: selectedGenres, location: locationSearch }),
  ]);

  const hasFilters = Boolean(q || selectedInstruments.length || selectedGenres.length || locationDisplayName || radius || (remote && remote !== "include"));
  const showCreateProfileCta = !session?.user || session.user.role === "MUSICIAN";

  return (
    <PageShell
      eyebrow="Directory"
      title="Musicians"
      body="Filter by instrument, genre, and location. Open a profile when the work fits."
      action={showCreateProfileCta ? <PrimaryCta href="/profile/create">Create Profile</PrimaryCta> : null}
    >
        <div className="border-y border-rule py-5 md:py-6">
          <LocationDirectoryFilters
            action="/musicians"
            clearHref="/musicians"
            keyword={q}
            locationDisplayName={locationDisplayName}
            locationLat={lat}
            locationLng={lng}
            radius={radius}
            remote={locationSearch.remoteFilter}
            instrument={selectedInstruments}
            instruments={instruments}
            genre={selectedGenres}
            genres={genres}
            hasFilters={hasFilters}
          />
        </div>

      <section className="mt-10">
        {profiles.length === 0 ? (
          <EmptyState
            eyebrow={hasFilters ? "No match" : "Soundcheck"}
            title={hasFilters ? "No one matches yet." : "Nobody on stage yet."}
            body={hasFilters ? "Change the filters and run it back." : "Create the first musician profile and start the room."}
            cta={
              hasFilters ? (
                <Link href="/musicians" className="control-secondary">
                  Clear filters
                </Link>
              ) : showCreateProfileCta ? (
                <PrimaryCta href="/profile/create">Create Profile</PrimaryCta>
              ) : null
            }
          />
        ) : (
          <div className="divide-y divide-rule border-y border-rule">
            {profiles.map((profile) => {
              const instrumentTags = visibleTags(profile.instruments ?? []);
              const genreTags = visibleTags(profile.genres ?? []);

              return (
                  <Link
                    key={profile.id}
                    href={`/musicians/${profile.id}`}
                    className="group grid min-w-0 cursor-pointer gap-5 bg-surface px-1 py-6 transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:items-start md:px-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4 md:justify-start">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="media-avatar flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden bg-[#E2E8F0] text-sm font-semibold text-ink">
                          {profile.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            profile.displayName.split(" ").slice(0, 2).map((n) => n[0]).join("")
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="break-words text-item-heading text-ink transition-colors group-hover:text-brand">
                            {profile.displayName}
                          </h2>
                          <p className="mt-1 text-meta uppercase text-muted">
                            {displayLocation(profile)}
                            {profile.distanceMiles !== null && profile.distanceMiles !== undefined
                              ? ` · ${Math.round(profile.distanceMiles)} mi`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5 md:hidden">
                        <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                          {profile.isRemote ? "Remote" : "In person"}
                        </Chip>
                      </div>
                    </div>

                    <div className="min-w-0">
                    <p className="text-secondary text-muted">
                      {profile.bio ? clampText(profile.bio, 150) : "No bio yet."}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => (
                          <Chip key={`${profile.id}-i-${name}`}>{name}</Chip>
                        ))}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => (
                          <Chip key={`${profile.id}-g-${name}`}>{name}</Chip>
                        ))}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>
                    </div>
                    </div>

                    <div className="hidden min-w-24 text-right md:block">
                      <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                        {profile.isRemote ? "Remote" : "In person"}
                      </Chip>
                      <span className="mt-5 block text-control text-brand">View profile</span>
                    </div>
                  </Link>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
