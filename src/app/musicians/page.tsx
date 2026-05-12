import Link from "next/link";

import { getCurrentSession } from "@/lib/auth-guards";
import { clampText, visibleTags } from "@/lib/display";
import { db } from "@/lib/db";
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

  const [session, instruments, genres, profiles] = await Promise.all([
    getCurrentSession(),
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.musicianProfile.findMany({
      where: {
        ...(instrument
          ? { instruments: { some: { instrument: { name: instrument } } } }
          : {}),
        ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

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
          <form method="GET" className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" action="/musicians">
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

            <div className="flex items-end gap-3">
              <button type="submit" className="btn-primary w-full md:w-auto">
                Apply
              </button>
              {hasFilters ? (
                <Link href="/musicians" className="pb-4 text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF]">
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
                  <Link href={`/musicians/${profile.id}`} className="card-hover group flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-[#0F172A] group-hover:text-[#0055FF]">
                          {profile.displayName}
                        </h2>
                        <p className="mt-1 font-mono text-xs text-[#64748B]">
                          {profile.location || "Location not specified"}
                        </p>
                      </div>
                      <Chip tone={profile.isRemote ? "blue" : "neutral"}>
                        {profile.isRemote ? "Remote" : "In person"}
                      </Chip>
                    </div>

                    <p className="mt-5 text-sm font-medium leading-relaxed text-[#475569]">
                      {profile.bio ? clampText(profile.bio, 150) : "No bio yet."}
                    </p>

                    <div className="mt-6 space-y-3">
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

                    <div className="mt-auto pt-6 text-sm font-black text-[#0055FF]">
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

