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
    listInstruments(),
    listGenres(),
    listOpenGigs({ projectType: safeProjectType, instrument, genre }),
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
          <form method="GET" className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]" action="/gigs">
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

            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-end lg:col-span-1">
              <button
                type="submit"
                className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full bg-[#0F172A] px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
              >
                Apply
              </button>
              {hasFilters ? (
                <Link
                  href="/gigs"
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
                        </div>
                        <h2 className="mt-1 break-words text-lg font-black tracking-tight text-[#0F172A] transition-colors group-hover:text-[#FF3366]">
                          {gig.title}
                        </h2>
                      </div>
                      <Chip tone="gold">{compensationLabel(gig.compensationType)}</Chip>
                    </div>

                    <p className="relative z-10 mt-1 font-mono text-xs text-[#94A3B8]">
                      {gig.isRemote ? "Remote option" : gig.location || "Location TBD"}
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
