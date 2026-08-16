import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { DirectoryResultsSkeleton } from "@/components/ui/directory-results-skeleton";
import { FinishProfileNudge } from "@/components/profile/finish-profile-nudge";
import { listInstruments, listGenres } from "@/lib/api/tags";
import { getProfileByUserId, listProfiles } from "@/lib/api/profiles";
import { clampText, tagLine } from "@/lib/display";
import { displayLocation, parseLocationSearch } from "@/lib/location";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { parseSelectedTags } from "@/lib/tag-taxonomy";
import { getCurrentSession } from "@/lib/auth-guards";
import { resolveMusicianProfileNavigation } from "@/lib/profile-progress";

export const metadata: Metadata = {
  title: "Musicians",
  description: "Browse musician profiles by instrument, genre, and location.",
};

type ProfileFilters = Parameters<typeof listProfiles>[0];

async function MusicianProfileCta() {
  const session = await getCurrentSession();
  const profile =
    session?.user.role === "MUSICIAN" ? await getProfileByUserId(session.user.id) : null;
  const navigation = resolveMusicianProfileNavigation(profile);

  return (
    <PrimaryCta href={navigation.href} prefetch={false}>
      {navigation.label}
    </PrimaryCta>
  );
}

/**
 * Split out so the page shell and filter bar stream immediately; only the result rows
 * wait on the directory read.
 */
async function MusicianResults({
  filters,
  hasFilters,
}: {
  filters: ProfileFilters;
  hasFilters: boolean;
}) {
  const profiles = await listProfiles(filters);

  return (
      <section className="mt-10">
        {profiles.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No musicians match." : "No musician profiles yet."}
            body={hasFilters ? "Try different filters." : "Create a profile to be the first listing."}
            cta={
              hasFilters ? (
                <Link href="/musicians" className="control-secondary">
                  Clear filters
                </Link>
              ) : (
                <MusicianProfileCta />
              )
            }
          />
        ) : (
          <div className="divide-y divide-rule border-y border-rule">
            {profiles.map((profile) => {
              const instruments = tagLine(profile.instruments ?? []);
              const genres = tagLine(profile.genres ?? []);

              return (
                  <Link
                    key={profile.id}
                    href={`/musicians/${profile.id}`}
                    className="group grid min-w-0 cursor-pointer gap-5 px-1 py-6 transition-colors duration-150 hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:items-start md:px-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4 md:justify-start">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="media-avatar flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden bg-[#E2E8F0] text-sm font-semibold text-ink">
                          {profile.image ? (
                            <Image
                              src={profile.image}
                              alt=""
                              width={44}
                              height={44}
                              sizes="44px"
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
                    {instruments ? <p className="mt-3 text-secondary text-ink">{instruments}</p> : null}
                    {genres ? <p className="mt-1 text-secondary text-muted">{genres}</p> : null}
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
  );
}

export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; instrument?: string | string[]; genre?: string | string[]; locationDisplayName?: string; lat?: string; lng?: string; radius?: string; remote?: string }>;
}) {
  const { q, instrument, genre, locationDisplayName, lat, lng, radius, remote } = await searchParams;
  const locationSearch = parseLocationSearch({ q, lat, lng, radius, remote });
  const selectedInstruments = parseSelectedTags(instrument);
  const selectedGenres = parseSelectedTags(genre);

  // Only the taxonomy is awaited here — it drives the filter bar, which should paint
  // straight away. The directory read happens inside the Suspense boundary below.
  const [instruments, genres] = await Promise.all([
    listInstruments(),
    listGenres(),
  ]);

  const filters = { q: locationSearch.query, instruments: selectedInstruments, genres: selectedGenres, location: locationSearch };
  // Re-keying on the filters makes a filter change show the skeleton again rather than
  // holding the previous results while the new ones resolve.
  const resultsKey = JSON.stringify(filters);
  const hasFilters = Boolean(q || selectedInstruments.length || selectedGenres.length || locationDisplayName || radius || (remote && remote !== "include"));

  return (
    <PageShell
      title="Musicians"
        body="Filter by instrument, genre, and location. Open a profile for full details."
      action={
        <Suspense fallback={<PrimaryCta href="/profile/create" prefetch={false}>Create profile</PrimaryCta>}>
          <MusicianProfileCta />
        </Suspense>
      }
    >
        {/* Reads the session, so it streams separately and never blocks the shell. */}
        <Suspense fallback={null}>
          <FinishProfileNudge />
        </Suspense>

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

      <Suspense key={resultsKey} fallback={<DirectoryResultsSkeleton />}>
        <MusicianResults filters={filters} hasFilters={hasFilters} />
      </Suspense>
    </PageShell>
  );
}
