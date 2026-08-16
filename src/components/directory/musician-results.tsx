import Link from "next/link";
import Image from "next/image";

import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { listProfiles } from "@/lib/api/profiles";
import { clampText, tagLine } from "@/lib/display";
import { displayLocation } from "@/lib/location";

import { MusicianProfileCta } from "./musician-profile-cta";

type ProfileFilters = Parameters<typeof listProfiles>[0];

/**
 * The musician result rows, shared by `/` and `/musicians`. Kept out of the page
 * files so the shell and filter bar stream immediately and only the rows wait on
 * the directory read.
 *
 * `clearHref` differs per host page: clearing filters on `/` must stay on `/`.
 */
export async function MusicianResults({
  filters,
  hasFilters,
  clearHref,
}: {
  filters: ProfileFilters;
  hasFilters: boolean;
  clearHref: string;
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
              <Link href={clearHref} className="control-secondary">
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
