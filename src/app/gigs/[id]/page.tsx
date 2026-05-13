import { Mail, Clapperboard, BadgeDollarSign, MapPin, Calendar } from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { compensationLabel, formatDate, projectTypeLabel } from "@/lib/display";
import { db } from "@/lib/db";

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
  const isClosed = gig.status === "CLOSED";

  const details = [
    { icon: Clapperboard, label: "Project", value: projectTypeLabel(gig.projectType) },
    { icon: BadgeDollarSign, label: "Compensation", value: compensationLabel(gig.compensationType) },
    { icon: MapPin, label: "Location", value: gig.isRemote ? "Remote option" : (gig.location || "TBD") },
    { icon: Calendar, label: "Deadline", value: formatDate(gig.deadline) },
  ] as const;

  return (
    <div className="bg-[#FAFAFA] px-4 py-12 sm:px-6 md:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <BackLink href="/gigs">Back to gigs</BackLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Main column ── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Cinematic gig header — dark */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-bl-full bg-linear-to-br from-[#FF3366]/15 to-transparent"
                aria-hidden
              />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
                    Open call
                  </span>
                  <StatusBadge status={gig.status} />
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                  {gig.title}
                </h1>

                {gig.creator?.name && (
                  <p className="mt-3 font-mono text-sm text-[#94A3B8]">
                    Posted by {gig.creator.name}
                  </p>
                )}

                {/* Detail tiles */}
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {details.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl bg-[#1E293B] p-4">
                      <Icon className="h-4 w-4 text-[#94A3B8]" aria-hidden />
                      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {gig.compensationDetails && (
                  <p className="mt-4 text-sm font-medium text-[#94A3B8]">
                    {gig.compensationDetails}
                  </p>
                )}
              </div>
            </div>

            {/* Description + tags */}
            <SectionCard eyebrow="The brief" title="Description">
              <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-[#475569]">
                {gig.description}
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                    Instruments needed
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instruments.length
                      ? instruments.map((name) => <Chip key={name} tone="blue">{name}</Chip>)
                      : <Chip>Not specified</Chip>}
                  </div>
                </div>
                <div>
                  <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                    Genres preferred
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {genres.length
                      ? genres.map((name) => <Chip key={name} tone="pink">{name}</Chip>)
                      : <Chip>Not specified</Chip>}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Contact card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
              <div
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#0055FF]/6 to-transparent"
                aria-hidden
              />
              <div className="relative z-10">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                  Connect
                </span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-[#0F172A]">
                  Contact creator
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
                  Interested? Reach out directly. No inbox, no feed — just the next email.
                </p>

                <div className="mt-6 space-y-3">
                  {gig.creator?.name && (
                    <div className="rounded-2xl bg-[#F8FAFC] p-4">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
                        Creator
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#0F172A]">{gig.creator.name}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-[#F8FAFC] p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm font-bold text-[#0F172A]">
                      {gig.creator?.email ?? "Not provided"}
                    </p>
                  </div>
                </div>

                {gig.creator?.email && !isClosed && (
                  <a
                    href={`mailto:${gig.creator.email}?subject=${encodeURIComponent(`Motivo: ${gig.title}`)}`}
                    className="group mt-5 flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#0F172A] px-5 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                  >
                    <span>Contact Creator</span>
                    <Mail className="h-4 w-4" aria-hidden />
                  </a>
                )}

                {isClosed && (
                  <div className="mt-5 rounded-2xl bg-[#FF3366]/10 px-5 py-3.5 text-center text-sm font-bold text-[#FF3366]">
                    This gig is filled
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
