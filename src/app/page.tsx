import { Suspense } from "react";
import type { Metadata } from "next";

import { DirectoryViewSwitch, type DirectoryView } from "@/components/directory/directory-view-switch";
import { GigResults } from "@/components/directory/gig-results";
import { MusicianProfileCta } from "@/components/directory/musician-profile-cta";
import { MusicianResults } from "@/components/directory/musician-results";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { DirectoryResultsSkeleton } from "@/components/ui/directory-results-skeleton";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { getActiveView, surfaceForView } from "@/lib/active-view";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { PROJECT_TYPES, projectTypeLabel } from "@/lib/display";
import { parseLocationSearch } from "@/lib/location";
import { parseSelectedTags } from "@/lib/tag-taxonomy";

export const metadata: Metadata = {
  description: "Browse musicians and open gigs. Filter by instrument, genre, and location.",
};

type HomeSearchParams = {
  view?: string;
  q?: string;
  projectType?: string;
  instrument?: string | string[];
  genre?: string | string[];
  locationDisplayName?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  remote?: string;
};

/**
 * The marketplace, not a landing page (issue #5). A visitor's first screen is
 * inventory, signed in or signed out; the editorial pitch lives at `/about`.
 *
 * `?view=` picks the directory and defaults to musicians, so a signed-out
 * visitor always lands on something populated rather than a dead toggle.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const { view: rawView, q, projectType, instrument, genre, locationDisplayName, lat, lng, radius, remote } = params;
  // An explicit ?view= always wins: it has to, or a shared link would render
  // differently for each visitor. The saved view only supplies the default, and
  // it resolves to null (so, musicians) for anyone signed out.
  const view: DirectoryView =
    rawView === "gigs" || rawView === "musicians"
      ? rawView
      : surfaceForView(await getActiveView());

  const locationSearch = parseLocationSearch({ q, lat, lng, radius, remote });
  const selectedInstruments = parseSelectedTags(instrument);
  const selectedGenres = parseSelectedTags(genre);
  const safeProjectType = PROJECT_TYPES.find((type) => type === projectType);

  // Only the taxonomy is awaited here — it drives the filter bar, which should paint
  // straight away. The directory read happens inside the Suspense boundary below.
  const [instruments, genres] = await Promise.all([listInstruments(), listGenres()]);

  const sharedFilters = {
    q: locationSearch.query,
    instruments: selectedInstruments,
    genres: selectedGenres,
    location: locationSearch,
  };
  const filters = view === "gigs" ? { ...sharedFilters, projectType: safeProjectType } : sharedFilters;
  // Re-keying on the filters makes a filter change show the skeleton again rather than
  // holding the previous results while the new ones resolve.
  const resultsKey = `${view}:${JSON.stringify(filters)}`;
  const hasFilters = Boolean(
    q ||
      (view === "gigs" && safeProjectType) ||
      selectedInstruments.length ||
      selectedGenres.length ||
      locationDisplayName ||
      radius ||
      (remote && remote !== "include"),
  );
  const clearHref = view === "gigs" ? "/?view=gigs" : "/";

  return (
    <PageShell
      title="Musicians and gigs"
      body={
        view === "gigs"
          ? "Open projects hiring musicians for film, podcasts, games, and live work."
          : "Browse musicians by instrument, genre, and location. Open a profile for full details."
      }
      action={
        view === "gigs" ? (
          <PrimaryCta href="/gigs/create" prefetch={false}>Post a gig</PrimaryCta>
        ) : (
          <Suspense fallback={<PrimaryCta href="/profile/create" prefetch={false}>Create profile</PrimaryCta>}>
            <MusicianProfileCta />
          </Suspense>
        )
      }
    >
      <DirectoryViewSwitch view={view} params={params} />

      <div className="mt-6 border-y border-rule py-5 md:py-6">
        <LocationDirectoryFilters
          action="/"
          clearHref={clearHref}
          hiddenFields={{ view }}
          keyword={q}
          locationDisplayName={locationDisplayName}
          locationLat={lat}
          locationLng={lng}
          radius={radius}
          remote={locationSearch.remoteFilter}
          projectType={view === "gigs" ? safeProjectType : undefined}
          projectTypeOptions={
            view === "gigs"
              ? PROJECT_TYPES.map((type) => ({ value: type, label: projectTypeLabel(type) }))
              : undefined
          }
          instrument={selectedInstruments}
          instruments={instruments}
          genre={selectedGenres}
          genres={genres}
          hasFilters={hasFilters}
        />
      </div>

      <Suspense key={resultsKey} fallback={<DirectoryResultsSkeleton />}>
        {view === "gigs" ? (
          <GigResults filters={filters} hasFilters={hasFilters} clearHref={clearHref} />
        ) : (
          <MusicianResults filters={sharedFilters} hasFilters={hasFilters} clearHref={clearHref} />
        )}
      </Suspense>
    </PageShell>
  );
}
