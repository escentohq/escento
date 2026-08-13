import Link from "next/link";

import { requireUser } from "@/lib/auth-guards";
import { listInstruments, listGenres } from "@/lib/api/tags";
import { listOpenGigs } from "@/lib/api/gigs";
import {
  PROJECT_TYPES,
  clampText,
  compensationLabel,
  projectTypeLabel,
  visibleTags,
} from "@/lib/display";
import { displayLocation, parseLocationSearch } from "@/lib/location";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";
import { parseSelectedTags } from "@/lib/tag-taxonomy";

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

  const [session, instruments, genres, gigs] = await Promise.all([
    requireUser("/gigs"),
    listInstruments(),
    listGenres(),
    listOpenGigs({ q: locationSearch.query, projectType: safeProjectType, instruments: selectedInstruments, genres: selectedGenres, location: locationSearch }),
  ]);

  const hasFilters = Boolean(q || safeProjectType || selectedInstruments.length || selectedGenres.length || locationDisplayName || radius || (remote && remote !== "include"));
  const showPostGigCta = !session?.user || session.user.role === "CREATOR";

  return (
    <PageShell
      eyebrow="Open calls"
      title="Gigs"
      body="Find projects hiring musicians for film, podcasts, games, and live work."
      action={showPostGigCta ? <PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta> : null}
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

      <section className="mt-10">
        {gigs.length === 0 ? (
          <EmptyState
            eyebrow={hasFilters ? "No match" : "Soundcheck"}
            title={hasFilters ? "No gigs match yet." : "No open gigs right now."}
            body={hasFilters ? "Change the filters and run it back." : "Post one when the project is ready."}
            cta={
              hasFilters ? (
                <Link href="/gigs" className="control-secondary">Clear filters</Link>
              ) : showPostGigCta ? (
                <PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta>
              ) : null
            }
          />
        ) : (
          <div className="divide-y divide-rule border-y border-rule">
            {gigs.map((gig) => {
              const instrumentTags = visibleTags(gig.instruments ?? []);
              const genreTags = visibleTags(gig.genres ?? []);

              return (
                  <Link
                    key={gig.id}
                    href={`/gigs/${gig.id}`}
                    className="group grid min-w-0 cursor-pointer gap-5 bg-surface px-1 py-6 transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_auto] md:px-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-meta uppercase text-muted">
                            {projectTypeLabel(gig.projectType)}
                          </span>
                        </div>
                        <h2 className="mt-2 break-words text-item-heading text-ink transition-colors group-hover:text-brand">
                          {gig.title}
                        </h2>
                      </div>
                      <div className="md:hidden"><Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip></div>
                    </div>

                    <div className="min-w-0">
                    <p className="text-meta uppercase text-muted">
                      {displayLocation(gig, "Location TBD")}
                      {gig.distanceMiles !== null && gig.distanceMiles !== undefined
                        ? ` · ${Math.round(gig.distanceMiles)} mi`
                        : ""}
                    </p>

                    <p className="mt-3 text-secondary text-muted">
                      {clampText(gig.description, 160)}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => <Chip key={`${gig.id}-i-${name}`}>{name}</Chip>)}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => <Chip key={`${gig.id}-g-${name}`}>{name}</Chip>)}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>
                    </div>
                    </div>

                    <div className="hidden min-w-28 text-right md:block">
                      <Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip>
                      <span className="mt-5 block text-control text-brand">View gig</span>
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
