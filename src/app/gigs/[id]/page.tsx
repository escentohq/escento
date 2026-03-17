import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Chip, SectionCard } from "../_ui";

function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidId(id)) notFound();

  const gig = await db.gig.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } },
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!gig) notFound();

  const instruments = gig.instruments.map((x) => x.instrument.name);
  const genres = gig.genres.map((x) => x.genre.name);

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Link
            href="/gigs"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← Back to gigs
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Gig details">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span
                    className={
                      gig.status === "CLOSED"
                        ? "rounded-full border border-amber-900/50 bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold uppercase text-amber-200"
                        : "rounded-full border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-200"
                    }
                  >
                    {gig.status}
                  </span>
                  <span>{gig.projectType.replace("_", " ")}</span>
                  <span className="text-zinc-700">•</span>
                  <span>
                    {gig.isRemote ? "Remote option" : gig.location ? gig.location : "Location TBD"}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span>{gig.compensationType}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Description</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {gig.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Instruments needed
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {instruments.length ? (
                        instruments.map((name) => (
                          <Chip key={`inst-${gig.id}-${name}`}>{name}</Chip>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-400">Not specified</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Genres preferred
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {genres.length ? (
                        genres.map((name) => (
                          <Chip key={`gen-${gig.id}-${name}`}>{name}</Chip>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-400">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Compensation</h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {gig.compensationType}
                      {gig.compensationDetails ? ` — ${gig.compensationDetails}` : ""}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Deadline</h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {gig.deadline ? gig.deadline.toLocaleDateString() : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="Contact creator">
              <p className="text-sm text-zinc-300">
                Interested? Reach out directly (MVP has no in-app messaging).
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2">
                  <div className="text-xs text-zinc-500">Creator</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100">
                    {gig.creator?.name ?? "Student creator"}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2">
                  <div className="text-xs text-zinc-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100 break-all">
                    {gig.creator?.email ?? "Not provided"}
                  </div>
                </div>

                {gig.creator?.email ? (
                  <a
                    href={`mailto:${gig.creator.email}?subject=${encodeURIComponent(
                      `GigForge: ${gig.title}`,
                    )}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
                  >
                    Contact Creator
                  </a>
                ) : null}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

