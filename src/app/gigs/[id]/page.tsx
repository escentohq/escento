import { Mail } from "lucide-react";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/ui/back-link";
import { Chip } from "@/components/ui/chip";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  compensationLabel,
  formatDate,
  projectTypeLabel,
} from "@/lib/display";
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

  return (
    <div className="bg-[#FAFAFA] px-4 py-12 sm:px-6 md:py-18 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <BackLink href="/gigs">Back to gigs</BackLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <SectionCard eyebrow="Open call" title={gig.title}>
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-[#475569]">
                <StatusBadge status={gig.status} />
                <span>{projectTypeLabel(gig.projectType)}</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>{gig.isRemote ? "Remote option" : gig.location || "Location TBD"}</span>
                <span className="text-[#CBD5E1]">/</span>
                <span>{compensationLabel(gig.compensationType)}</span>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Description</h3>
                  <p className="mt-3 whitespace-pre-wrap text-base font-medium leading-relaxed text-[#475569]">
                    {gig.description}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Instruments needed</h3>
                    <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                      {instruments.length ? instruments.map((name) => <Chip key={name} tone="blue">{name}</Chip>) : <Chip>Not specified</Chip>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Genres preferred</h3>
                    <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                      {genres.length ? genres.map((name) => <Chip key={name} tone="pink">{name}</Chip>) : <Chip>Not specified</Chip>}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Compensation</h3>
                    <p className="mt-2 text-sm font-medium text-[#475569]">
                      {compensationLabel(gig.compensationType)}
                      {gig.compensationDetails ? ` / ${gig.compensationDetails}` : ""}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#0F172A]">Deadline</h3>
                    <p className="mt-2 text-sm font-medium text-[#475569]">{formatDate(gig.deadline)}</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <SectionCard eyebrow="Connect" title="Contact creator">
              <p className="text-sm font-medium leading-relaxed text-[#475569]">
                Interested? Reach out directly. No inbox, no feed, just the next email.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#64748B]">Creator</div>
                  <div className="mt-2 text-sm font-black text-[#0F172A]">
                    {gig.creator?.name ?? "Student creator"}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#64748B]">Email</div>
                  <div className="mt-2 break-all text-sm font-black text-[#0F172A]">
                    {gig.creator?.email ?? "Not provided"}
                  </div>
                </div>
              </div>

              {gig.creator?.email ? (
                <a href={`mailto:${gig.creator.email}?subject=${encodeURIComponent(`GigForge: ${gig.title}`)}`} className="btn-primary mt-5 w-full">
                  <Mail className="h-4 w-4" aria-hidden />
                  Contact Creator
                </a>
              ) : null}
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
