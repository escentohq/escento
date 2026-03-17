import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { Chip } from "../_ui";
import { closeGig } from "./actions";
import { DeleteGigButton } from "./DeleteGigButton";

function clampText(text: string, max = 120) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export default async function ManageGigsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  const gigs = await db.gig.findMany({
    where: { creatorId: session.user.id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Manage your gigs
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Edit, close, or delete your posted gigs.
            </p>
          </div>
          <Link href="/gigs/create" className="btn-primary">
            Post a new gig
          </Link>
        </header>

        <section className="mt-6 space-y-4">
          {gigs.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-4 p-10 text-center">
              <p className="text-sm text-zinc-300">You haven’t posted any gigs yet.</p>
              <Link href="/gigs/create" className="btn-primary">
                Post a gig
              </Link>
            </div>
          ) : (
            gigs.map((g) => {
              const inst = g.instruments.map((x) => x.instrument.name).slice(0, 3);
              const gen = g.genres.map((x) => x.genre.name).slice(0, 3);
              const isClosed = g.status === "CLOSED";

              return (
                <div
                  key={g.id}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-zinc-100">
                        {g.title}
                      </h2>
                      <span
                        className={
                          isClosed
                            ? "rounded-full border border-amber-900/50 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-200"
                            : "rounded-full border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
                        }
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {g.projectType.replace("_", " ")}
                      {" · "}
                      {g.isRemote ? "Remote" : g.location || "Location TBD"}
                      {" · "}
                      {g.compensationType}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {inst.map((n) => (
                        <Chip key={n}>{n}</Chip>
                      ))}
                      {gen.map((n) => (
                        <Chip key={n}>{n}</Chip>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                      {clampText(g.description)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Link
                      href={`/gigs/${g.id}/edit`}
                      className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900/50"
                    >
                      Edit
                    </Link>
                    {!isClosed && (
                      <form action={closeGig.bind(null, g.id)} className="inline">
                        <button
                          type="submit"
                          className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900/50"
                        >
                          Mark filled
                        </button>
                      </form>
                    )}
                    <DeleteGigButton gigId={g.id} />
                    <Link
                      href={`/gigs/${g.id}`}
                      className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
