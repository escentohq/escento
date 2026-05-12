import Link from "next/link";

import { getCurrentSession } from "@/lib/auth-guards";
import {
  PROJECT_TYPES,
  clampText,
  compensationLabel,
  projectTypeLabel,
  visibleTags,
} from "@/lib/display";
import { db } from "@/lib/db";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Reveal } from "@/components/ui/reveal";

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectType?: string; instrument?: string; genre?: string }>;
}) {
  const { projectType, instrument, genre } = await searchParams;
  const safeProjectType = PROJECT_TYPES.find((type) => type === projectType);

  const [session, instruments, genres, gigs] = await Promise.all([
    getCurrentSession(),
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.gig.findMany({
      where: {
        ...(safeProjectType ? { projectType: safeProjectType } : {}),
        ...(instrument ? { instruments: { some: { instrument: { name: instrument } } } } : {}),
        ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
        status: "OPEN",
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const hasFilters = Boolean(safeProjectType || instrument || genre);
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
          <form method="GET" className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]" action="/gigs">
            <label htmlFor="projectType" className="text-sm font-bold text-[#0F172A]">
              Project type
              <select id="projectType" name="projectType" defaultValue={safeProjectType ?? ""} className="select-base">
                <option value="">All types</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {projectTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="instrument" className="text-sm font-bold text-[#0F172A]">
              Instrument
              <select id="instrument" name="instrument" defaultValue={instrument ?? ""} className="select-base">
                <option value="">All instruments</option>
                {instruments.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
              </select>
            </label>

            <label htmlFor="genre" className="text-sm font-bold text-[#0F172A]">
              Genre
              <select id="genre" name="genre" defaultValue={genre ?? ""} className="select-base">
                <option value="">All genres</option>
                {genres.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button type="submit" className="btn-primary w-full lg:w-auto">
                Apply
              </button>
              {hasFilters ? (
                <Link href="/gigs" className="pb-4 text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF]">
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
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
              const instrumentTags = visibleTags(gig.instruments.map((x) => x.instrument.name));
              const genreTags = visibleTags(gig.genres.map((x) => x.genre.name));

              return (
                <Reveal key={gig.id} delay={Math.min(index, 6) * 0.04}>
                  <Link href={`/gigs/${gig.id}`} className="card-hover group flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-[#0F172A] group-hover:text-[#0055FF]">
                          {gig.title}
                        </h2>
                        <p className="mt-1 font-mono text-xs text-[#64748B]">
                          {projectTypeLabel(gig.projectType)}
                        </p>
                      </div>
                      <Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip>
                    </div>

                    <p className="mt-4 text-sm font-bold text-[#64748B]">
                      {gig.isRemote ? "Remote option" : gig.location || "Location TBD"}
                    </p>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-[#475569]">
                      {clampText(gig.description, 160)}
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => <Chip key={`${gig.id}-i-${name}`} tone="blue">{name}</Chip>)}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => <Chip key={`${gig.id}-g-${name}`} tone="pink">{name}</Chip>)}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 text-sm font-black text-[#0055FF]">
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
