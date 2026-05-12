import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";
import {
  clampText,
  compensationLabel,
  projectTypeLabel,
  visibleTags,
} from "@/lib/display";
import { db } from "@/lib/db";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { closeGig } from "./actions";
import { DeleteGigButton } from "./DeleteGigButton";

export default async function ManageGigsPage() {
  const session = await requireRole("CREATOR", "/gigs/manage");

  const gigs = await db.gig.findMany({
    where: { creatorId: session.user.id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageShell
      eyebrow="Backstage"
      title="Manage Gigs"
      body="Edit listings, mark a role filled, or remove a post when the set is done."
      action={<PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta>}
      size="medium"
    >
      {gigs.length === 0 ? (
        <EmptyState
          eyebrow="Soundcheck"
          title="You haven't posted anything yet."
          body="Write the brief, name the sound, and put it in front of musicians."
          cta={<PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta>}
        />
      ) : (
        <div className="space-y-5">
          {gigs.map((gig, index) => {
            const instrumentTags = visibleTags(gig.instruments.map((x) => x.instrument.name));
            const genreTags = visibleTags(gig.genres.map((x) => x.genre.name));
            const isClosed = gig.status === "CLOSED";

            return (
              <Reveal key={gig.id} delay={Math.min(index, 6) * 0.04}>
                <article className="rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <h2 className="break-words text-xl font-black tracking-tight text-[#0F172A]">{gig.title}</h2>
                        <StatusBadge status={gig.status} />
                      </div>
                      <p className="mt-2 font-mono text-xs text-[#64748B]">
                        {projectTypeLabel(gig.projectType)} / {gig.isRemote ? "Remote option" : gig.location || "Location TBD"} / {compensationLabel(gig.compensationType)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => <Chip key={`${gig.id}-i-${name}`} tone="blue">{name}</Chip>)}
                        {instrumentTags.hiddenCount ? <Chip>+{instrumentTags.hiddenCount} more</Chip> : null}
                        {genreTags.shown.map((name) => <Chip key={`${gig.id}-g-${name}`} tone="pink">{name}</Chip>)}
                        {genreTags.hiddenCount ? <Chip>+{genreTags.hiddenCount} more</Chip> : null}
                      </div>

                      <p className="mt-4 text-sm font-medium leading-relaxed text-[#475569]">
                        {clampText(gig.description, 150)}
                      </p>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                      <Link href={`/gigs/${gig.id}/edit`} className="btn-ghost flex-1 sm:flex-none">Edit</Link>
                      {!isClosed ? (
                        <form action={closeGig.bind(null, gig.id)} className="flex-1 sm:flex-none">
                          <button type="submit" className="btn-ghost w-full">Mark Filled</button>
                        </form>
                      ) : null}
                      <DeleteGigButton gigId={gig.id} className="flex-1 sm:flex-none" />
                      <Link href={`/gigs/${gig.id}`} className="btn-ghost flex-1 sm:flex-none">View</Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
