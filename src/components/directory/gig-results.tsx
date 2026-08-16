import Link from "next/link";

import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { listOpenGigs } from "@/lib/api/gigs";
import { clampText, compensationLabel, projectTypeLabel, tagLine } from "@/lib/display";
import { displayLocation } from "@/lib/location";

type GigFilters = Parameters<typeof listOpenGigs>[0];

/**
 * The gig result rows, shared by `/` and `/gigs`. Kept out of the page files so
 * the shell and filter bar stream immediately and only the rows wait on the gig
 * read.
 *
 * `clearHref` differs per host page: clearing filters on `/` must stay on `/`.
 */
export async function GigResults({
  filters,
  hasFilters,
  clearHref,
}: {
  filters: GigFilters;
  hasFilters: boolean;
  clearHref: string;
}) {
  const gigs = await listOpenGigs(filters);

  return (
    <section className="mt-10">
      {gigs.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No gigs match." : "No open gigs right now."}
          body={hasFilters ? "Try different filters." : "Post a gig when your project is ready."}
          cta={
            hasFilters ? (
              <Link href={clearHref} className="control-secondary">Clear filters</Link>
            ) : (
              <PrimaryCta href="/gigs/create" prefetch={false}>Post a gig</PrimaryCta>
            )
          }
        />
      ) : (
        <div className="divide-y divide-rule border-y border-rule">
          {gigs.map((gig) => {
            const instruments = tagLine(gig.instruments ?? []);
            const genres = tagLine(gig.genres ?? []);

            return (
              <Link
                key={gig.id}
                href={`/gigs/${gig.id}`}
                className="group grid min-w-0 cursor-pointer gap-5 px-1 py-6 transition-colors duration-150 hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_auto] md:px-4"
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
                  {instruments ? <p className="mt-3 text-secondary text-ink">{instruments}</p> : null}
                  {genres ? <p className="mt-1 text-secondary text-muted">{genres}</p> : null}
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
  );
}
