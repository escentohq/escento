import Link from "next/link";

import { db } from "@/lib/db";
import { Chip, PrimaryLink } from "./_ui";

function clampText(text: string, max = 160) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

const PROJECT_TYPES = [
  "FILM",
  "LIVE_EVENT",
  "PODCAST",
  "GAME",
  "YOUTUBE",
  "OTHER",
] as const;

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectType?: string; instrument?: string; genre?: string }>;
}) {
  const { projectType, instrument, genre } = await searchParams;

  const [instruments, genres, gigs] = await Promise.all([
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.gig.findMany({
      where: {
        ...(projectType ? { projectType: projectType as never } : {}),
        ...(instrument
          ? { instruments: { some: { instrument: { name: instrument } } } }
          : {}),
        ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
        status: "OPEN",
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasFilters = Boolean(projectType || instrument || genre);

  return (
    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse Gigs</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Discover creative opportunities posted by student creators.
            </p>
          </div>
          <PrimaryLink href="/gigs/create">Post a Gig</PrimaryLink>
        </header>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <form className="grid gap-3 sm:grid-cols-4" action="/gigs">
            <label className="text-sm text-zinc-300">
              Project type
              <select
                name="projectType"
                defaultValue={projectType ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-zinc-100 shadow-sm focus:border-violet-500/60"
              >
                <option value="">All types</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Instrument
              <select
                name="instrument"
                defaultValue={instrument ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-zinc-100 shadow-sm focus:border-violet-500/60"
              >
                <option value="">All instruments</option>
                {instruments.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Genre
              <select
                name="genre"
                defaultValue={genre ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-zinc-100 shadow-sm focus:border-violet-500/60"
              >
                <option value="">All genres</option>
                {genres.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
              >
                Apply
              </button>
              {hasFilters ? (
                <Link
                  href="/gigs"
                  className="whitespace-nowrap text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <section className="mt-6">
          {gigs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-8 text-center">
              <p className="text-sm text-zinc-300">No gigs match your filters yet.</p>
              {hasFilters ? (
                <div className="mt-4">
                  <Link
                    href="/gigs"
                    className="text-sm font-semibold text-violet-300 hover:text-violet-200"
                  >
                    Clear filters
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gigs.map((g) => {
                const inst = g.instruments.map((x) => x.instrument.name).slice(0, 3);
                const gen = g.genres.map((x) => x.genre.name).slice(0, 3);

                return (
                  <Link
                    key={g.id}
                    href={`/gigs/${g.id}`}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-zinc-700 hover:bg-zinc-950/55"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white">
                          {g.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {g.projectType.replace("_", " ")}
                        </p>
                      </div>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/30 px-2.5 py-1 text-xs text-zinc-200">
                        {g.compensationType}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-zinc-500">
                      {g.isRemote ? "Remote" : g.location ? g.location : "Location TBD"}
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {inst.map((name) => (
                          <Chip key={`i-${g.id}-${name}`}>{name}</Chip>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gen.map((name) => (
                          <Chip key={`g-${g.id}-${name}`}>{name}</Chip>
                        ))}
                      </div>
                      <p className="text-sm text-zinc-300">
                        {clampText(g.description, 170)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-semibold text-violet-300 group-hover:text-violet-200">
                        View Gig →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

