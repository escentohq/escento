import Link from "next/link";

import { PrimaryCta } from "@/components/ui/primary-cta";
import { SecondaryCta } from "@/components/ui/secondary-cta";

type HomeLandingProps = {
  secondaryHref: string;
  secondaryLabel: string;
  signedInLabel?: string | null;
};

const directoryRows = [
  {
    type: "Musician",
    title: "Maya Reyes",
    meta: "Piano · Film scoring · Austin, TX",
    detail: "Available for student films and recording sessions.",
  },
  {
    type: "Open gig",
    title: "Composer for a thesis short",
    meta: "Film · Paid · Remote-friendly",
    detail: "Sparse string score. Three-week turnaround.",
  },
  {
    type: "Musician",
    title: "Jordan Lee",
    meta: "Guitar · Jazz · Boston, MA",
    detail: "Session work, live sets, and podcast scoring.",
  },
];

export function HomeLanding({
  secondaryHref,
  secondaryLabel,
  signedInLabel,
}: HomeLandingProps) {
  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto grid min-h-[76vh] max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:px-8">
        <div>
          <p className="text-meta uppercase text-brand">Music work, made legible</p>
          <h1 className="mt-6 max-w-5xl text-display">
            Find the musician.<br />Book the work.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            Escento is a directory for musicians and the people hiring them.
            Search by instrument, genre, location, and project—not by feed rank.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryCta href="/musicians" className="w-full sm:w-auto">
              Browse musicians
            </PrimaryCta>
            <SecondaryCta href={secondaryHref} className="w-full sm:w-auto">
              {secondaryLabel}
            </SecondaryCta>
          </div>
          {signedInLabel ? (
            <p className="mt-5 text-secondary text-muted">Signed in as {signedInLabel}</p>
          ) : null}
        </div>

        <aside className="border-t-4 border-ink pt-6 lg:self-end lg:pb-8">
          <p className="text-meta uppercase text-muted">Start with the work</p>
          <p className="mt-4 text-section-heading">
            No follower counts. No endless feed. Just profiles, open calls, and direct requests.
          </p>
          <Link href="/gigs" className="mt-8 inline-block text-control text-brand hover:underline">
            Browse open gigs
          </Link>
        </aside>
      </section>

      <section className="border-y border-rule bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 border-b border-rule py-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-meta uppercase text-brand">Directory preview</p>
              <h2 className="mt-3 text-section-heading">People and projects, in one place</h2>
            </div>
            <p className="max-w-md text-secondary text-muted">
              Results are organized around the information needed to decide whether to open the listing.
            </p>
          </div>
          <div className="divide-y divide-rule">
            {directoryRows.map((row) => (
              <div
                key={`${row.type}-${row.title}`}
                className="grid gap-3 py-6 md:grid-cols-[9rem_minmax(0,1fr)_minmax(16rem,0.8fr)] md:items-baseline"
              >
                <p className="text-meta uppercase text-muted">{row.type}</p>
                <div>
                  <h3 className="text-item-heading">{row.title}</h3>
                  <p className="mt-2 text-secondary text-muted">{row.meta}</p>
                </div>
                <p className="text-secondary text-muted md:text-right">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid border-y border-rule lg:grid-cols-2 lg:divide-x lg:divide-rule">
          <div className="py-10 lg:pr-12">
            <p className="text-meta uppercase text-brand">For musicians</p>
            <h2 className="mt-4 text-section-heading">Make your work searchable</h2>
            <p className="mt-5 max-w-xl text-body text-muted">
              Publish your instruments, genres, location, availability, and portfolio links once. Creators can then find the profile when a matching project opens.
            </p>
            <Link href="/profile/create" className="mt-7 inline-block text-control text-brand hover:underline">
              Create a musician profile
            </Link>
          </div>
          <div className="border-t border-rule py-10 lg:border-t-0 lg:pl-12">
            <p className="text-meta uppercase text-brand">For creators</p>
            <h2 className="mt-4 text-section-heading">Post a brief musicians can assess</h2>
            <p className="mt-5 max-w-xl text-body text-muted">
              Name the project, compensation, timing, location, and sound. Musicians can understand the job before deciding whether to respond.
            </p>
            <Link href="/gigs/create" className="mt-7 inline-block text-control text-brand hover:underline">
              Post a gig
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <p className="text-meta uppercase text-[#94A3B8]">How it works</p>
          <ol className="mt-8 grid border-y border-[#334155] md:grid-cols-3 md:divide-x md:divide-[#334155]">
            <li className="py-8 md:pr-8">
              <span className="text-meta text-[#94A3B8]">01</span>
              <h3 className="mt-4 text-item-heading">Search the directory</h3>
              <p className="mt-3 text-secondary text-[#CBD5E1]">Filter people or open calls using the details that matter to the project.</p>
            </li>
            <li className="border-t border-[#334155] py-8 md:border-t-0 md:px-8">
              <span className="text-meta text-[#94A3B8]">02</span>
              <h3 className="mt-4 text-item-heading">Send a request</h3>
              <p className="mt-3 text-secondary text-[#CBD5E1]">Introduce the work and ask to connect. The recipient decides whether to open a thread.</p>
            </li>
            <li className="border-t border-[#334155] py-8 md:border-t-0 md:pl-8">
              <span className="text-meta text-[#94A3B8]">03</span>
              <h3 className="mt-4 text-item-heading">Continue in messages</h3>
              <p className="mt-3 text-secondary text-[#CBD5E1]">Once accepted, keep project questions and replies in one conversation.</p>
            </li>
          </ol>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-page-title">The next project starts with a useful listing.</h2>
            <Link
              href="/signup"
              className="inline-flex min-h-12 shrink-0 items-center justify-center border border-white bg-white px-6 py-3 text-control text-ink hover:border-brand hover:bg-brand hover:text-white"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
