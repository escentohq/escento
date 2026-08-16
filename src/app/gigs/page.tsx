import { Suspense } from "react";
import type { Metadata } from "next";

import { DirectoryResultsSkeleton } from "@/components/ui/directory-results-skeleton";
import { GigResults } from "@/components/directory/gig-results";

import { listInstruments, listGenres } from "@/lib/api/tags";
import { PROJECT_TYPES, projectTypeLabel } from "@/lib/display";
import { parseLocationSearch } from "@/lib/location";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { parseSelectedTags } from "@/lib/tag-taxonomy";

export const metadata: Metadata = {
  title: "Gigs",
  description: "Find open projects hiring musicians for film, podcasts, games, and live work.",
};

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; projectType?: string; instrument?: string | string[]; genre?: string | string[]; locationDisplayName?: string; lat?: string; lng?: string; radius?: string; remote?: string }>;
}) {
  const { q, projectType, instrument, genre, locationDisplayName, lat, lng, radius, remote } = await searchParams;
  const safeProjectType = PROJECT_TYPES.find((type) => type === projectType);
  const locationSearch = parseLocationSearch({ q, lat, lng, radius, remote });
  const selectedInstruments = parseSelectedTags(instrument);
  const selectedGenres = parseSelectedTags(genre);
  const projectTypeOptions = PROJECT_TYPES.map((type) => ({
    value: type,
    label: projectTypeLabel(type),
  }));

  // Only the taxonomy is awaited here — it drives the filter bar, which should paint
  // straight away. The gig read happens inside the Suspense boundary below.
  const [instruments, genres] = await Promise.all([
    listInstruments(),
    listGenres(),
  ]);

  const filters = { q: locationSearch.query, projectType: safeProjectType, instruments: selectedInstruments, genres: selectedGenres, location: locationSearch };
  // Re-keying on the filters makes a filter change show the skeleton again rather than
  // holding the previous results while the new ones resolve.
  const resultsKey = JSON.stringify(filters);
  const hasFilters = Boolean(q || safeProjectType || selectedInstruments.length || selectedGenres.length || locationDisplayName || radius || (remote && remote !== "include"));

  return (
    <PageShell
      title="Gigs"
      body="Find projects hiring musicians for film, podcasts, games, and live work."
      action={<PrimaryCta href="/gigs/create" prefetch={false}>Post a gig</PrimaryCta>}
    >
        <div className="border-y border-rule py-5 md:py-6">
          <LocationDirectoryFilters
            action="/gigs"
            clearHref="/gigs"
            keyword={q}
            locationDisplayName={locationDisplayName}
            locationLat={lat}
            locationLng={lng}
            radius={radius}
            remote={locationSearch.remoteFilter}
            projectType={safeProjectType}
            projectTypeOptions={projectTypeOptions}
            instrument={selectedInstruments}
            instruments={instruments}
            genre={selectedGenres}
            genres={genres}
            hasFilters={hasFilters}
          />
        </div>

      <Suspense key={resultsKey} fallback={<DirectoryResultsSkeleton />}>
        <GigResults filters={filters} hasFilters={hasFilters} clearHref="/gigs" />
      </Suspense>
    </PageShell>
  );
}
