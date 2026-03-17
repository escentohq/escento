import Link from "next/link";

import { db } from "@/lib/db";
import { Chip, PrimaryLink } from "./_ui";

function clampText(text: string, max = 140) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<{ instrument?: string; genre?: string }>;
}) {
  const { instrument, genre } = await searchParams;

  const [instruments, genres, profiles] = await Promise.all([
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.musicianProfile.findMany({
      where: {
        ...(instrument
          ? {
              instruments: {
                some: { instrument: { name: instrument } },
              },
            }
          : {}),
        ...(genre
          ? {
              genres: {
                some: { genre: { name: genre } },
              },
            }
          : {}),
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const hasFilters = Boolean(instrument || genre);

  return (
    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Browse Musicians
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Discover collaborators by instrument and genre.
            </p>
          </div>
          <PrimaryLink href="/profile/create">Create Profile</PrimaryLink>
        </header>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <form className="grid gap-3 sm:grid-cols-3" action="/musicians">
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
                Apply filters
              </button>
              {hasFilters ? (
                <Link
                  href="/musicians"
                  className="whitespace-nowrap text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <section className="mt-6">
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-8 text-center">
              <p className="text-sm text-zinc-300">
                No musicians match these filters yet.
              </p>
              {hasFilters ? (
                <div className="mt-4">
                  <Link
                    href="/musicians"
                    className="text-sm font-semibold text-violet-300 hover:text-violet-200"
                  >
                    Clear filters
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => {
                const instruments = p.instruments
                  .map((x) => x.instrument.name)
                  .slice(0, 3);
                const genres = p.genres.map((x) => x.genre.name).slice(0, 3);

                return (
                  <Link
                    key={p.id}
                    href={`/musicians/${p.id}`}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.35)] transition hover:border-zinc-700 hover:bg-zinc-950/55"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white">
                          {p.displayName}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {p.location ? p.location : "Location not specified"}
                        </p>
                      </div>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/30 px-2.5 py-1 text-xs text-zinc-200">
                        {p.isRemote ? "Remote" : "In-person"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {instruments.map((name) => (
                          <Chip key={`i-${p.id}-${name}`}>{name}</Chip>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((name) => (
                          <Chip key={`g-${p.id}-${name}`}>{name}</Chip>
                        ))}
                      </div>
                      <p className="text-sm text-zinc-300">
                        {p.bio ? clampText(p.bio, 160) : "No bio yet."}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-semibold text-violet-300 group-hover:text-violet-200">
                        View Profile →
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

