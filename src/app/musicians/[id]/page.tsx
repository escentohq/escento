import { Mail, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { SectionCard } from "@/components/ui/section-card";
import { db } from "@/lib/db";

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
    ...(profile.soundcloudUrl ? [{ label: "SoundCloud", url: profile.soundcloudUrl }] : []),
    ...(profile.spotifyUrl ? [{ label: "Spotify", url: profile.spotifyUrl }] : []),
    ...(profile.instagramUrl ? [{ label: "Instagram", url: profile.instagramUrl }] : []),
  ];

  return (
    <div className="bg-[#FAFAFA] px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <BackLink href="/musicians">Back to musicians</BackLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <SectionCard eyebrow="On stage" title={profile.displayName}>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#475569]">
                <span>{profile.location || "Location not specified"}</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>{profile.isRemote ? "Remote-friendly" : "In-person only"}</span>
                {profile.school ? (
                  <>
                    <span className="text-[#CBD5E1]">/</span>
                    <span>{profile.school}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Bio</h3>
                  <p className="mt-3 whitespace-pre-wrap text-base font-medium leading-relaxed text-[#475569]">
                    {profile.bio || "No bio yet."}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Instruments</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {instruments.length ? instruments.map((name) => <Chip key={name} tone="blue">{name}</Chip>) : <Chip>No instruments</Chip>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Genres</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {genres.length ? genres.map((name) => <Chip key={name} tone="pink">{name}</Chip>) : <Chip>No genres</Chip>}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Experience</h3>
                    <p className="mt-2 text-sm font-medium text-[#475569]">
                      {profile.yearsExperience !== null && profile.yearsExperience !== undefined ? `${profile.yearsExperience} years` : "Not specified"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Availability</h3>
                    <p className="mt-2 text-sm font-medium text-[#475569]">
                      {profile.availabilityText || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard eyebrow="Links" title="Portfolio">
              {links.length === 0 ? (
                <p className="text-sm font-medium text-[#475569]">No links added yet.</p>
              ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0055FF] hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <SectionCard eyebrow="Connect" title="Contact">
              <p className="text-sm font-medium leading-relaxed text-[#475569]">
                Interested in working together? Reach out directly.
              </p>

              <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#64748B]">Email</div>
                <div className="mt-2 break-all text-sm font-black text-[#0F172A]">
                  {profile.contactEmail ?? "Not provided"}
                </div>
              </div>

              {profile.contactEmail ? (
                <a href={`mailto:${profile.contactEmail}`} className="btn-primary mt-5 w-full">
                  <Mail className="h-4 w-4" aria-hidden />
                  Contact Musician
                </a>
              ) : null}
            </SectionCard>

            <SectionCard eyebrow="Soundcheck" title="Work preferences">
              <div className="flex flex-wrap gap-2">
                <Chip tone={profile.isRemote ? "blue" : "neutral"}>{profile.isRemote ? "Remote-friendly" : "In person"}</Chip>
                {profile.seekingPaid ? <Chip tone="gold">Paid</Chip> : null}
                {profile.seekingUnpaid ? <Chip tone="pink">Unpaid + Credit</Chip> : null}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

