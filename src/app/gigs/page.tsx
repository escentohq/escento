import Link from "next/link";

import { getCurrentSession } from "@/lib/auth-guards";
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
import { Reveal } from "@/components/ui/reveal";
import { LocationDirectoryFilters } from "@/components/location/location-directory-filters";

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; projectType?: string; instrument?: string; genre?: string; locationDisplayName?: string; lat?: string; lng?: string; radius?: string; remote?: string }>;
}) {
  const { q, projectType, instrument, genre, locationDisplayName, lat, lng, radius, remote } = await searchParams;
  const safeProjectType = PROJECT_TYPES.find((type) => type === projectType);
  const locationSearch = parseLocationSearch({ q, lat, lng, radius, remote });

  const [session, instruments, genres, gigs] = await Promise.all([
    getCurrentSession(),
    listInstruments(),
    listGenres(),
    listOpenGigs({ q: locationSearch.query, projectType: safeProjectType, instrument, genre, location: locationSearch }),
  ]);

  const hasFilters = Boolean(q || safeProjectType || instrument || genre || locationDisplayName || radius || (remote && remote !== "include"));
  const showPostGigCta = !session?.user || session.user.role === "CREATOR";

  return (
    <PageShell
      eyebrow="Open calls"
      title="Browse Gigs"
      body="Find student projects looking for sound. Film, podcasts, games, live shows, and everything between."
      action={showPostGigCta ? <PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta> : null}
    >
      <Reveal>
        <div className="rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm md:p-6">
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
            projectTypes={PROJECT_TYPES}
            projectTypeLabel={projectTypeLabel}
            instrument={instrument}
            instruments={instruments}
            genre={genre}
            genres={genres}
            hasFilters={hasFilters}
          />
        </div>
      </Reveal>

      <section className="mt-10">
        {gigs.length === 0 ? (
          <EmptyState
            eyebrow={hasFilters ? "No match" : "Soundcheck"}
            title={hasFilters ? "No gigs match yet." : "No open gigs right now."}
            body={hasFilters ? "Change the filters and run it back." : "Post one when the project is ready."}
            cta={
              hasFilters ? (
                <Link href="/gigs" className="btn-secondary">Clear filters</Link>
              ) : showPostGigCta ? (
                <PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig, index) => {
              const instrumentTags = visibleTags(gig.instruments ?? []);
              const genreTags = visibleTags(gig.genres ?? []);

              return (
                <Reveal key={gig.id} delay={Math.min(index, 6) * 0.04}>
                  <Link
                    href={`/gigs/${gig.id}`}
                    className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-[#FF3366]/8 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                  >
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-[#FF3366]/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />

                    <div className="relative z-10 flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                            {projectTypeLabel(gig.projectType)}
                          </span>
                          {gig.creator?.name ? <Chip tone="blue">Verified Creator</Chip> : null}
                        </div>
                        <h2 className="mt-1 break-words text-lg font-black tracking-tight text-[#0F172A] transition-colors group-hover:text-[#FF3366]">
                          {gig.title}
                        </h2>
                      </div>
                      <Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip>
                    </div>

                    <p className="relative z-10 mt-1 font-mono text-xs text-[#94A3B8]">
                      {displayLocation(gig, "Location TBD")}
                      {gig.distanceMiles !== null && gig.distanceMiles !== undefined
                        ? ` · ${Math.round(gig.distanceMiles)} mi`
                        : ""}
                    </p>

                    <p className="relative z-10 mt-4 text-sm font-medium leading-relaxed text-[#475569]">
                      {clampText(gig.description, 160)}
                    </p>

                    <div className="relative z-10 mt-5 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => <Chip key={`${gig.id}-i-${name}`} tone="blue">{name}</Chip>)}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => <Chip key={`${gig.id}-g-${name}`} tone="pink">{name}</Chip>)}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-6 text-sm font-black text-[#0055FF] transition-colors group-hover:text-[#FF3366]">
                      View Gig →
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
