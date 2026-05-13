import Link from "next/link";

import { getCurrentSession } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clampText, visibleTags } from "@/lib/display";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Reveal } from "@/components/ui/reveal";

export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<{ instrument?: string; genre?: string }>;
}) {
  const { instrument, genre } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const session = await getCurrentSession();
  const { data: instrumentsData } = await supabase
    .from("instrument")
    .select("name")
    .order("name", { ascending: true });
  const { data: genresData } = await supabase
    .from("genre")
    .select("name")
    .order("name", { ascending: true });

  const { data: allProfiles } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .order("updated_at", { ascending: false });

  const instruments = instrumentsData || [];
  const genres = genresData || [];

  const profiles = (allProfiles || [])
    .filter((p: any) => !instrument || p.musician_instrument?.some((mi: any) => mi.instrument?.name === instrument))
    .filter((p: any) => !genre || p.musician_genre?.some((mg: any) => mg.genre?.name === genre))
    .slice(0, 50);

  const hasFilters = Boolean(instrument || genre);
  const showCreateProfileCta = !session?.user || session.user.role === "MUSICIAN";

  return (
    <PageShell
      eyebrow="Now playing"
      title="Browse Musicians"
      body="Find student musicians by sound, instrument, and availability. Browse first. Email when the fit is right."
      action={showCreateProfileCta ? <PrimaryCta href="/profile/create">Create Profile</PrimaryCta> : null}
    >
      <Reveal>
        <div className="rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm md:p-6">
          <form method="GET" className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]" action="/musicians">
            <label htmlFor="instrument" className="text-sm font-bold text-[#0F172A]">
              Instrument
              <select id="instrument" name="instrument" defaultValue={instrument ?? ""} className="select-base">
                <option value="">All instruments</option>
                {instruments.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="genre" className="text-sm font-bold text-[#0F172A]">
              Genre
              <select id="genre" name="genre" defaultValue={genre ?? ""} className="select-base">
                <option value="">All genres</option>
                {genres.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-end lg:col-span-1">
              <button
                type="submit"
                className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full bg-[#0F172A] px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
              >
                Apply
              </button>
              {hasFilters ? (
                <Link
                  href="/musicians"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF] md:justify-start md:pb-1"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
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
              const instrumentTags = visibleTags(profile.instruments.map((x) => x.instrument.name));
              const genreTags = visibleTags(profile.genres.map((x) => x.genre.name));

              return (
                <Reveal key={profile.id} delay={Math.min(index, 6) * 0.04}>
                  <Link
                    href={`/musicians/${profile.id}`}
                    className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-[#0055FF]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                  >
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-[#0055FF]/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />

                    <div className="relative z-10 flex min-w-0 items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0055FF]/15 via-[#FF3366]/10 to-[#FFB000]/15 text-sm font-black text-[#0F172A]">
                          {profile.displayName.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <h2 className="break-words text-lg font-black tracking-tight text-[#0F172A] transition-colors group-hover:text-[#0055FF]">
                            {profile.displayName}
                          </h2>
                          <p className="mt-0.5 font-mono text-xs text-[#64748B]">
                            {profile.location || "Location not specified"}
                          </p>
                        </div>
                      </div>
                      <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                        {profile.isRemote ? "Remote" : "In person"}
                      </Chip>
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
