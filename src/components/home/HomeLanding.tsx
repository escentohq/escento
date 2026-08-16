import Link from "next/link";
import Image from "next/image";

import { PrimaryCta } from "@/components/ui/primary-cta";
import { HomeSecondaryAction } from "./home-secondary-action";
import type { Gig, MusicianProfile } from "@/lib/api/types";
import { compensationLabel, projectTypeLabel } from "@/lib/display";
import { displayLocation } from "@/lib/location";

type HomeLandingProps = {
  featuredProfiles: MusicianProfile[];
  featuredGigs: Gig[];
};

type PreviewRow = {
  href: string;
  type: string;
  title: string;
  meta: string;
  detail: string;
  image: string | null;
  action: string;
};

function firstSentence(value: string) {
  return value.trim().match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || value.trim();
}

function profileRow(profile: MusicianProfile): PreviewRow {
  const taxonomy = [...(profile.instruments ?? []), ...(profile.genres ?? [])]
    .slice(0, 3)
    .join(" · ");

  return {
    href: `/musicians/${profile.id}`,
    type: "Musician",
    title: profile.displayName,
    meta: [taxonomy, displayLocation(profile, "Location open")].filter(Boolean).join(" · "),
    detail: [
      profile.availabilityText,
      profile.school,
      profile.isRemote ? "Remote-friendly" : "In-person work",
    ].filter(Boolean).join(" · "),
    image: profile.image,
    action: "View profile",
  };
}

function gigRow(gig: Gig): PreviewRow {
  return {
    href: `/gigs/${gig.id}`,
    type: "Open gig",
    title: gig.title,
    meta: [
      projectTypeLabel(gig.projectType),
      compensationLabel(gig.compensationType),
      displayLocation(gig, gig.isRemote ? "Remote" : "Location open"),
    ].join(" · "),
    detail: firstSentence(gig.description),
    image: null,
    action: "View gig",
  };
}

export function HomeLanding({
  featuredProfiles,
  featuredGigs,
}: HomeLandingProps) {
  const leadProfile =
    featuredProfiles.find(
      (profile) =>
        profile.image &&
        ((profile.instruments?.length ?? 0) > 0 || (profile.genres?.length ?? 0) > 0),
    ) ?? featuredProfiles.find((profile) => profile.image) ?? featuredProfiles[0];
  const leadGig = featuredGigs[0];
  const leadTaxonomy = [
    ...(leadProfile?.instruments ?? []),
    ...(leadProfile?.genres ?? []),
  ].slice(0, 3);
  const supportingProfile = featuredProfiles.find((profile) => profile.id !== leadProfile?.id);
  const previewRows = [
    leadProfile ? profileRow(leadProfile) : null,
    featuredGigs[0] ? gigRow(featuredGigs[0]) : null,
    supportingProfile
      ? profileRow(supportingProfile)
      : featuredGigs[1]
        ? gigRow(featuredGigs[1])
        : null,
  ].filter((row): row is PreviewRow => Boolean(row));

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 md:py-16 lg:px-8">
        <div className="grid border-y border-border-strong lg:min-h-[680px] lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]">
          <div className="flex flex-col justify-center py-8 md:py-12 lg:pr-14">
            <p className="text-meta uppercase text-brand">Musicians and gigs</p>
            <h1 className="mt-4 max-w-4xl text-display md:mt-6">
              Find a musician.<br />Post a gig.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted md:mt-8 md:text-xl">
              Browse musicians by instrument, genre, and location. Or find an open gig that fits.
            </p>
            <div className="mt-7 flex flex-col gap-3 md:mt-10 sm:flex-row">
              <PrimaryCta href="/musicians" className="w-full sm:w-auto">
                Browse musicians
              </PrimaryCta>
              <HomeSecondaryAction />
            </div>
          </div>

          <aside className="flex min-h-[540px] flex-col bg-brand text-white lg:min-h-0">
            <div className="flex items-center justify-between border-b border-white/30 px-6 py-5 md:px-8">
              <p className="text-sm font-semibold text-white">Live directory</p>
              <Link
                href="/musicians"
                className="text-control text-white underline-offset-4 transition-colors duration-150 hover:text-on-brand-muted hover:underline"
              >
                Browse all
              </Link>
            </div>

            <div className={`grid flex-1 items-center ${leadProfile?.image ? "md:grid-cols-[minmax(0,1fr)_8rem]" : ""}`}>
              <div className="flex items-center px-6 py-10 md:px-8">
                <p className="text-[clamp(2.75rem,5vw,4.75rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em] text-white">
                  {leadTaxonomy.length ? (
                    leadTaxonomy.map((name) => <span key={name} className="block">{name}</span>)
                  ) : (
                    <><span className="block">Play</span><span className="block">Score</span><span className="block">Record</span></>
                  )}
                </p>
              </div>
              {leadProfile?.image ? (
                <div className="relative mb-8 mr-6 h-28 w-28 justify-self-end overflow-hidden border-4 border-white bg-brand md:mb-0 md:mr-8 md:h-32 md:w-32">
                  <Image src={leadProfile.image} alt="" fill sizes="128px" priority className="object-cover" />
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/30 px-6 py-6 md:px-8">
              {leadProfile ? (
                <Link
                  href={`/musicians/${leadProfile.id}`}
                  className="group block focus-visible:outline-white"
                >
                  <p className="text-sm font-medium text-on-brand-muted">
                    {leadProfile.instruments?.slice(0, 2).join(" · ") || "Musician profile"}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-6">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                      {leadProfile.displayName}
                    </h2>
                    <span className="shrink-0 text-control text-white underline-offset-4 transition-colors duration-150 group-hover:text-on-brand-muted group-hover:underline">
                      View profile
                    </span>
                  </div>
                </Link>
              ) : (
                <div>
                  <p className="text-meta uppercase text-on-brand-muted">Musician profiles</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Add your profile to the directory.</h2>
                </div>
              )}
            </div>

            {leadGig ? (
              <Link
                href={`/gigs/${leadGig.id}`}
                className="border-t-4 border-amber bg-ink px-6 py-5 text-white transition-colors duration-150 hover:bg-brand-pressed focus-visible:outline-white md:px-8"
              >
                <span className="text-meta uppercase text-on-brand-muted">Open call · {compensationLabel(leadGig.compensationType)}</span>
                <span className="mt-2 block text-lg font-semibold leading-snug">{leadGig.title}</span>
              </Link>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="border-y border-rule bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 border-b border-rule py-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] md:items-end">
            <div>
              <h2 className="text-section-heading">Musicians and open gigs</h2>
            </div>
            <p className="text-secondary text-muted md:text-right">
              Scan the basics, then open a profile or gig for the full details.
            </p>
          </div>

          {previewRows.length ? (
            <div className="divide-y divide-rule">
              {previewRows.map((row, index) => (
                <Link
                  key={`${row.type}-${row.title}`}
                  href={row.href}
                  className={`group grid gap-x-5 gap-y-4 py-8 transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[7.5rem_minmax(0,1.1fr)_minmax(18rem,0.8fr)] md:items-center md:px-4 ${row.image ? "grid-cols-[6.5rem_minmax(0,1fr)]" : "grid-cols-[2.5rem_minmax(0,1fr)]"}`}
                >
                  <div className={`flex items-center justify-center overflow-hidden ${row.image ? "h-24 w-24" : "h-full min-h-24 w-10 md:w-24"}`}>
                    {row.image ? (
                      <Image src={row.image} alt="" width={96} height={96} sizes="96px" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-end border-l-4 border-amber pb-1 pl-2 md:pl-4">
                        <span className="text-xl font-semibold tracking-tight text-ink md:text-3xl">0{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-meta uppercase text-muted">{row.type}</p>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight transition-colors duration-150 group-hover:text-brand">
                      {row.title}
                    </h3>
                    <p className="mt-2 text-secondary text-muted">{row.meta}</p>
                  </div>
                  <div className="col-start-2 md:col-start-auto">
                    {row.detail ? <p className="text-secondary text-muted">{row.detail}</p> : null}
                    <span className="mt-4 inline-block text-control text-brand underline-offset-4 group-hover:underline">
                      {row.action}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-b border-rule py-12">
              <p className="text-item-heading">Nothing listed yet.</p>
              <p className="mt-2 text-secondary text-muted">New profiles and gigs will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid border-y border-rule lg:grid-cols-[0.85fr_1.15fr] lg:divide-x lg:divide-rule">
          <div className="py-10 lg:pr-12">
            <p className="text-meta uppercase text-brand">For musicians</p>
            <h2 className="mt-4 max-w-md text-section-heading">List what you play and the work you want.</h2>
            <Link href="/profile/create" className="mt-7 inline-block text-control text-brand underline-offset-4 hover:underline">
              Create a musician profile
            </Link>
          </div>
          <div className="border-t border-rule py-10 lg:border-t-0 lg:pl-14">
            <p className="max-w-xl text-2xl font-normal leading-snug text-muted md:text-3xl">
              Add your instruments, genres, location, availability, and work links.
            </p>
            <div className="mt-10 border-l-4 border-coral pl-5">
              <p className="text-meta uppercase text-muted">For creators</p>
              <h3 className="mt-2 text-item-heading">Describe the project, pay, and deadline.</h3>
              <Link href="/gigs/create" className="mt-5 inline-block text-control text-brand underline-offset-4 hover:underline">
                Post a gig
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <h2 className="text-page-title">How it works</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-on-ink-body lg:justify-self-end">
              Find the right listing, send a request, and discuss the project directly.
            </p>
          </div>

          <ol className="mt-12 grid border-y border-ink-muted md:grid-cols-[0.8fr_1.2fr_1fr] md:divide-x md:divide-ink-muted">
            <li className="py-8 md:pr-8">
              <span className="text-5xl font-semibold tracking-tight text-white">01</span>
              <h3 className="mt-8 text-item-heading">Search the directory</h3>
              <p className="mt-3 text-secondary text-on-ink-body">Filter musicians or gigs by the details you care about.</p>
            </li>
            <li className="border-t border-ink-muted py-8 md:border-l md:border-t-0 md:px-10">
              <span className="text-5xl font-semibold tracking-tight text-white">02</span>
              <h3 className="mt-8 text-item-heading">Send a request</h3>
              <p className="mt-3 max-w-sm text-secondary text-on-ink-body">Add a short note. The other person can accept or decline.</p>
            </li>
            <li className="border-t border-ink-muted py-8 md:border-t-0 md:pl-8">
              <span className="text-5xl font-semibold tracking-tight text-white">03</span>
              <h3 className="mt-8 text-item-heading">Continue in messages</h3>
              <p className="mt-3 text-secondary text-on-ink-body">Discuss dates, scope, and questions in one conversation.</p>
            </li>
          </ol>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 border-l-4 border-brand pl-6 md:flex-row md:items-end">
            <p className="max-w-3xl text-section-heading">Create a profile or post what you need.</p>
            <Link
              href="/signup"
              className="inline-flex min-h-12 shrink-0 items-center justify-center border border-white bg-white px-6 py-3 text-control text-ink transition-colors duration-150 hover:border-brand hover:bg-brand hover:text-white"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
