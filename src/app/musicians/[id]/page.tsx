import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Chip, SectionCard } from "../_ui";

function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

export default async function MusicianPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidId(id)) notFound();

  const profile = await db.musicianProfile.findUnique({
    where: { id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!profile) notFound();

  const instruments = profile.instruments.map((x) => x.instrument.name);
  const genres = profile.genres.map((x) => x.genre.name);

  const links: Array<{ label: string; url: string }> = [
    ...(profile.websiteUrl ? [{ label: "Website", url: profile.websiteUrl }] : []),
    ...(profile.youtubeUrl ? [{ label: "YouTube", url: profile.youtubeUrl }] : []),
    ...(profile.soundcloudUrl
      ? [{ label: "SoundCloud", url: profile.soundcloudUrl }]
      : []),
    ...(profile.spotifyUrl ? [{ label: "Spotify", url: profile.spotifyUrl }] : []),
    ...(profile.instagramUrl
      ? [{ label: "Instagram", url: profile.instagramUrl }]
      : []),
  ];

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Link
            href="/musicians"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← Back to musicians
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Profile">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  {profile.displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span>{profile.location ? profile.location : "Location not specified"}</span>
                  <span className="text-zinc-700">•</span>
                  <span>{profile.isRemote ? "Remote-friendly" : "In-person only"}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Bio</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {profile.bio ? profile.bio : "No bio yet."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Instruments
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {instruments.map((name) => (
                        <Chip key={`inst-${profile.id}-${name}`}>{name}</Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Genres</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {genres.map((name) => (
                        <Chip key={`gen-${profile.id}-${name}`}>{name}</Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Experience
                    </h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {profile.yearsExperience !== null &&
                      profile.yearsExperience !== undefined
                        ? `${profile.yearsExperience} years`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Availability
                    </h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {profile.availabilityText
                        ? profile.availabilityText
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Portfolio links">
              {links.length === 0 ? (
                <p className="text-sm text-zinc-400">No links added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
                      >
                        {l.label}
                        <span className="text-zinc-500">↗</span>
                      </a>
                      <div className="mt-1 text-xs text-zinc-500 break-all">
                        {l.url}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="Contact">
              <p className="text-sm text-zinc-300">
                Interested in working together?
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2">
                  <div className="text-xs text-zinc-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100 break-all">
                    {profile.contactEmail ?? "Not provided"}
                  </div>
                </div>

                {profile.contactEmail ? (
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
                  >
                    Contact Musician
                  </a>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard title="Work preferences">
              <div className="flex flex-wrap gap-2">
                <Chip>{profile.isRemote ? "Remote-friendly" : "In-person"}</Chip>
                {profile.seekingPaid ? <Chip>Paid</Chip> : null}
                {profile.seekingUnpaid ? <Chip>Unpaid</Chip> : null}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

