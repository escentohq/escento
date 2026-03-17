import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  const isMusician = session?.user?.role === "MUSICIAN";
  const isCreator = session?.user?.role === "CREATOR";

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (isMusician && session.user?.id) {
    const existing = await db.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 pt-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)] md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Find the right student musician for your next project.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300">
            GigForge connects student creators with musicians for films, campus
            performances, podcasts, games, YouTube videos, and more.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/musicians"
              className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
            >
              Browse Musicians
            </Link>
            <Link
              href="/gigs"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
            >
              Browse Gigs
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                For musicians
              </h2>
              <p className="mt-2 text-xs text-zinc-400">
                Showcase your instruments, genres, and links so creators can find
                you quickly.
              </p>
              <div className="mt-3">
                {isMusician && musicianProfilePath ? (
                  <Link
                    href={musicianProfilePath}
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                  >
                    {musicianProfilePath === "/profile/create"
                      ? "Create your profile →"
                      : "Edit your profile →"}
                  </Link>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                  >
                    Sign in to create a profile →
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                For creators
              </h2>
              <p className="mt-2 text-xs text-zinc-400">
                Post structured gig listings so the right musicians can raise
                their hand.
              </p>
              <div className="mt-3">
                {isCreator ? (
                  <Link
                    href="/gigs/create"
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                  >
                    Post a gig →
                  </Link>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                  >
                    Sign in to post a gig →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-violet-500/15 via-zinc-900 to-zinc-950 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_rgba(0,0,0,0.6)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              Example musician
            </p>
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-50">
                    Maya Singh
                  </p>
                  <p className="text-xs text-zinc-400">
                    Guitar • Vocals • Songwriting
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  Remote
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-zinc-900 px-2 py-1 text-zinc-200">
                  Indie
                </span>
                <span className="rounded-full bg-zinc-900 px-2 py-1 text-zinc-200">
                  Bedroom pop
                </span>
                <span className="rounded-full bg-zinc-900 px-2 py-1 text-zinc-200">
                  Soundtrack
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-300">
                Guitarist + vocalist looking for short films, campus events, and
                indie games that need warm, melodic scores.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Example gig
            </p>
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-50">
                    Composer for 10-minute short film
                  </p>
                  <p className="text-xs text-zinc-400">Film • Remote or Boston</p>
                </div>
                <span className="rounded-full bg-violet-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                  Paid
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-300">
                Looking for an original score with warm strings and subtle
                electronic textures. Rough cut ready in three weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-zinc-900/80 pt-6 text-sm text-zinc-300 md:grid-cols-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            How it works
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            Create a profile, post a gig, and connect via email or your own
            links. No feeds, no algorithms—just clear listings.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Built for campuses
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            Designed for film students, event organizers, podcasters, game devs,
            and musicians who want more chances to collaborate.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            MVP, not a social network
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            No messaging, payments, or ratings yet—just the fastest path from
            &ldquo;I need someone&rdquo; to &ldquo;I found them.&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}

