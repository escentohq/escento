import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { createGig } from "./actions";

const inputBase =
  "mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 shadow-sm focus:border-violet-500/60";

export default async function CreateGigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

  return (
    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Post a Gig</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Keep it clear and structured so musicians can respond fast.
            </p>
          </div>

          <form action={createGig} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Basic project info
              </h2>

              <div>
                <label className="text-sm text-zinc-300">
                  Title <span className="text-violet-300">*</span>
                </label>
                <input
                  name="title"
                  className={inputBase}
                  placeholder="e.g. Composer needed for 8-minute short film"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Description <span className="text-violet-300">*</span>
                </label>
                <textarea
                  name="description"
                  className={`${inputBase} min-h-[140px]`}
                  placeholder="What are you making, what do you need, and what’s the timeline?"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Project type <span className="text-violet-300">*</span>
                </label>
                <select name="projectType" className={inputBase} required>
                  <option value="">Select…</option>
                  <option value="FILM">Film</option>
                  <option value="LIVE_EVENT">Live event</option>
                  <option value="PODCAST">Podcast</option>
                  <option value="GAME">Game</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Requirements
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">
                    Instruments needed
                  </label>
                  <input
                    name="instrumentsCsv"
                    className={inputBase}
                    placeholder="Comma-separated (e.g. Violin, Piano)"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300">Genres preferred</label>
                  <input
                    name="genresCsv"
                    className={inputBase}
                    placeholder="Comma-separated (e.g. Ambient, Jazz)"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">Logistics</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">Location</label>
                  <input
                    name="location"
                    className={inputBase}
                    placeholder="Optional"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200 sm:self-end">
                  <input
                    type="checkbox"
                    name="isRemote"
                    defaultChecked
                    className="accent-violet-500"
                  />
                  Remote option
                </label>
              </div>

              <div>
                <label className="text-sm text-zinc-300">Deadline</label>
                <input type="date" name="deadline" className={inputBase} />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Compensation
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">
                    Compensation type <span className="text-violet-300">*</span>
                  </label>
                  <select name="compensationType" className={inputBase} required>
                    <option value="">Select…</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="NEGOTIABLE">Negotiable</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-300">
                    Compensation details
                  </label>
                  <input
                    name="compensationDetails"
                    className={inputBase}
                    placeholder="Optional (e.g. $150, credit + meals)"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
                Cancel
              </a>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
              >
                Publish Gig
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

