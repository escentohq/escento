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
import { Reveal } from "@/components/ui/reveal";
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
      eyebrow="Now playing"
      title="Browse Musicians"
      body="Find student musicians by sound, instrument, and availability. Browse first. Send a request when the fit is right."
      action={showCreateProfileCta ? <PrimaryCta href="/profile/create">Create Profile</PrimaryCta> : null}
    >
      <Reveal>
        <div className=" border border-[#F1F5F9] bg-white p-5 shadow-sm md:p-6">
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
      </Reveal>

      <section className="mt-10">
        {profiles.length === 0 ? (
          <EmptyState
            eyebrow={hasFilters ? "No match" : "Soundcheck"}
            title={hasFilters ? "No one matches yet." : "Nobody on stage yet."}
            body={hasFilters ? "Change the filters and run it back." : "Create the first musician profile and start the room."}
            cta={
              hasFilters ? (
                <Link href="/musicians" className="btn-secondary">
                  Clear filters
                </Link>
              ) : showCreateProfileCta ? (
                <PrimaryCta href="/profile/create">Create Profile</PrimaryCta>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, index) => {
              const instrumentTags = visibleTags(profile.instruments ?? []);
              const genreTags = visibleTags(profile.genres ?? []);

              return (
                <Reveal key={profile.id} delay={Math.min(index, 6) * 0.04}>
                  <Link
                    href={`/musicians/${profile.id}`}
                    className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden  border border-[#F1F5F9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-[#0055FF]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                  >
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-24 w-24     opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />

                    <div className="relative z-10 flex min-w-0 items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="media-avatar flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden bg-[#E2E8F0] text-sm font-bold text-[#0F172A]">
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
                          <h2 className="break-words text-lg font-black tracking-tight text-[#0F172A] transition-colors group-hover:text-[#0055FF]">
                            {profile.displayName}
                          </h2>
                          <p className="mt-0.5 font-mono text-xs text-[#64748B]">
                            {displayLocation(profile)}
                            {profile.distanceMiles !== null && profile.distanceMiles !== undefined
                              ? ` · ${Math.round(profile.distanceMiles)} mi`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                          {profile.isRemote ? "Remote" : "In person"}
                        </Chip>
                      </div>
                    </div>

                    <p className="relative z-10 mt-5 text-sm font-medium leading-relaxed text-[#475569]">
                      {profile.bio ? clampText(profile.bio, 150) : "No bio yet."}
                    </p>

                    <div className="relative z-10 mt-5 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => (
                          <Chip key={`${profile.id}-i-${name}`} tone="blue">{name}</Chip>
                        ))}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => (
                          <Chip key={`${profile.id}-g-${name}`} tone="pink">{name}</Chip>
                        ))}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-6 text-sm font-black text-[#0055FF] transition-colors group-hover:text-[#0044DD]">
                      View Profile →
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
