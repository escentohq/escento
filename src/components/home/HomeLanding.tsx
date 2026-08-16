import Link from "next/link";
import Image from "next/image";

import { PrimaryCta } from "@/components/ui/primary-cta";
import type { Gig, MusicianProfile } from "@/lib/api/types";
import { compensationLabel, projectTypeLabel } from "@/lib/display";
import { displayLocation } from "@/lib/location";
import type { MusicianProfileNavigation } from "@/lib/profile-progress";

type HomeLandingProps = {
  featuredProfiles: MusicianProfile[];
  featuredGigs: Gig[];
  musicianProfileNavigation?: MusicianProfileNavigation;
};

type PreviewRow = {
  href: string;
  type: string;
  title: string;
  meta: string;
  detail: string;
  image: string | null;
  mark: string;
  action: string;
};

function firstSentence(value: string) {
  return value.trim().match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || value.trim();
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
    mark: initials(profile.displayName) || "M",
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
    mark: projectTypeLabel(gig.projectType).slice(0, 2).toUpperCase() || "G",
    action: "View gig",
  };
}

function buildPreviewRows(profiles: MusicianProfile[], gigs: Gig[]): PreviewRow[] {
  const profileRows = profiles.map(profileRow);
  const gigRows = gigs.map(gigRow);
  const rows: PreviewRow[] = [];
  const longestList = Math.max(profileRows.length, gigRows.length);

  for (let index = 0; index < longestList && rows.length < 3; index += 1) {
    if (profileRows[index]) rows.push(profileRows[index]);
    if (rows.length < 3 && gigRows[index]) rows.push(gigRows[index]);
  }

  return rows;
}

export function HomeLanding({
  featuredProfiles,
  featuredGigs,
  musicianProfileNavigation,
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
  const previewRows = buildPreviewRows(featuredProfiles, featuredGigs);

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 md:py-16 lg:px-8">
        <div className="grid border-y border-border-strong lg:min-h-[680px] lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]">
          <div className="flex flex-col justify-center py-8 md:py-12 lg:pr-14">
            <h1 className="max-w-4xl text-display">
              Find a musician.<br />Post a gig.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted md:mt-8 md:text-xl">
              Browse musicians by instrument, genre, and location. Or find an open gig that fits.
            </p>
            <div className="mt-7 md:mt-10">
              <PrimaryCta href="/musicians" className="w-full sm:w-auto">
                Browse musicians
              </PrimaryCta>
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
                  ) : leadProfile ? (
                    <span className="block">{leadProfile.displayName}</span>
                  ) : (
                    <>
                      <span className="block">Musicians</span>
                      <span className="block">Gigs</span>
                    </>
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
                  <div className="flex items-end justify-between gap-6">
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
                  <h2 className="text-3xl font-semibold tracking-tight">Add your profile to the directory.</h2>
                </div>
              )}
            </div>

            {leadGig ? (
              <Link
                href={`/gigs/${leadGig.id}`}
                className="border-t-4 border-amber bg-ink px-6 py-5 text-white transition-colors duration-150 hover:bg-brand-pressed focus-visible:outline-white md:px-8"
              >
                <span className="text-meta uppercase text-on-brand-muted">
                  Open call · {compensationLabel(leadGig.compensationType)}
                </span>
                <span className="mt-2 block text-lg font-semibold leading-snug">{leadGig.title}</span>
              </Link>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="border-y border-rule">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 border-b border-rule py-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] md:items-end">
            <h2 className="text-section-heading">Musicians and open gigs</h2>
            <p className="text-secondary text-muted md:text-right">
              Open a listing for the full details.
            </p>
          </div>

          {previewRows.length ? (
            <div className="divide-y divide-rule">
              {previewRows.map((row) => (
                <Link
                  key={row.href}
                  href={row.href}
                  className="group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 gap-y-4 py-8 transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 md:grid-cols-[6rem_minmax(0,1.1fr)_minmax(18rem,0.8fr)] md:items-center md:px-4"
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden bg-ink text-control text-white">
                    {row.image ? (
                      <Image src={row.image} alt="" width={96} height={96} sizes="96px" className="h-full w-full object-cover" />
                    ) : (
                      <span>{row.mark}</span>
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
        <div className="grid border-y border-rule lg:grid-cols-2 lg:divide-x lg:divide-rule">
          <div className="py-10 lg:pr-12">
            <h2 className="max-w-md text-section-heading">Musicians list what they play.</h2>
            <p className="mt-4 max-w-xl text-body text-muted">
              Add instruments, genres, location, availability, and work links.
            </p>
            <Link
              href={musicianProfileNavigation?.href ?? "/profile/create"}
              className="mt-7 inline-block text-control text-brand underline-offset-4 hover:underline"
            >
              {musicianProfileNavigation?.label ?? "Create a musician profile"}
            </Link>
          </div>
          <div className="border-t border-rule py-10 lg:border-t-0 lg:pl-14">
            <h2 className="text-section-heading">Creators post the project.</h2>
            <p className="mt-4 max-w-xl text-body text-muted">
              Describe the work, pay, and deadline. Send a request from a profile or gig.
            </p>
            <Link href="/gigs/create" className="mt-7 inline-block text-control text-brand underline-offset-4 hover:underline">
              Post a gig
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <h2 className="text-page-title">Find a listing. Send a request. Talk in messages.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-ink-body">
            Filter the directory, add a short note, and continue in one conversation if the other person accepts.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex min-h-12 items-center justify-center border border-white bg-white px-6 py-3 text-control text-ink transition-colors duration-150 hover:border-brand hover:bg-brand hover:text-white"
          >
            Create an account
          </Link>
        </div>
      </section>
    </div>
  );
}
