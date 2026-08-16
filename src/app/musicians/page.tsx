import { Suspense } from "react";
import type { Metadata } from "next";

import { DirectoryResultsSkeleton } from "@/components/ui/directory-results-skeleton";
import { FinishProfileNudge } from "@/components/profile/finish-profile-nudge";
import { MusicianProfileCta } from "@/components/directory/musician-profile-cta";
import { MusicianResults } from "@/components/directory/musician-results";
import { listInstruments, listGenres } from "@/lib/api/tags";
import { parseLocationSearch } from "@/lib/location";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { parseSelectedTags } from "@/lib/tag-taxonomy";

export const metadata: Metadata = {
  title: "Musicians",
  description: "Browse musician profiles by instrument, genre, and location.",
};

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
        <MusicianResults filters={filters} hasFilters={hasFilters} clearHref="/musicians" />
      </Suspense>
    </PageShell>
  );
}
