import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";
import { listGigsByCreator } from "@/lib/api/gigs";
import {
  clampText,
  compensationLabel,
  gigStatusLabel,
  projectTypeLabel,
  visibleTags,
} from "@/lib/display";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { CloseGigButton } from "./CloseGigButton";
import { DeleteGigButton } from "./DeleteGigButton";
import { ReopenGigButton } from "./ReopenGigButton";

export default async function ManageGigsPage() {
  const session = await requireRole("CREATOR", "/gigs/manage");

  const gigs = await listGigsByCreator(session.user.id);

  return (
    <PageShell
      eyebrow="Your listings"
      title="Manage gigs"
      body="Edit open calls, mark filled roles, or remove old listings."
      action={<PrimaryCta href="/gigs/create">Post a New Gig</PrimaryCta>}
    >
      <section>
        {gigs.length === 0 ? (
          <EmptyState
            eyebrow="Empty stage"
            title="No gigs posted yet."
            body="Post your first project to find musicians."
            cta={<PrimaryCta href="/gigs/create">Post a Gig</PrimaryCta>}
          />
        ) : (
          <div className="divide-y divide-rule border-y border-rule">
            {gigs.map((gig) => {
              const instrumentTags = visibleTags(gig.instruments ?? []);
              const genreTags = visibleTags(gig.genres ?? []);

              return (
                  <div key={gig.id} className="grid min-w-0 gap-5 bg-surface py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] md:items-start md:px-4">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-meta uppercase text-muted">
                            {projectTypeLabel(gig.projectType)}
                          </span>
                          <Chip
                            tone={gig.status === "OPEN" ? "blue" : "neutral"}
                          >
                            {gigStatusLabel(gig.status)}
                          </Chip>
                        </div>
                        <h2 className="mt-2 break-words text-item-heading text-ink">
                          {gig.title}
                        </h2>
                      </div>
                      <Chip tone="gold">
                        {compensationLabel(gig.compensationType)}
                      </Chip>
                    </div>

                    <div>
                    <p className="text-secondary text-muted">
                      {clampText(gig.description, 160)}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => (
                          <Chip key={`${gig.id}-i-${name}`}>
                            {name}
                          </Chip>
                        ))}
                        {instrumentTags.hiddenCount ? (
                          <Chip>+{instrumentTags.hiddenCount} more</Chip>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => (
                          <Chip key={`${gig.id}-g-${name}`}>
                            {name}
                          </Chip>
                        ))}
                        {genreTags.hiddenCount ? (
                          <Chip>+{genreTags.hiddenCount} more</Chip>
                        ) : null}
                      </div>
                    </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-44 md:flex-col">
                      <Link
                        href={`/gigs/${gig.id}/edit`}
                        className="control-secondary min-h-11 flex-1 px-4 py-2 md:w-full"
                      >
                        Edit
                      </Link>

                      {gig.status === "OPEN" ? (
                        <CloseGigButton gigId={gig.id} />
                      ) : (
                        <ReopenGigButton gigId={gig.id} />
                      )}

                      <DeleteGigButton gigId={gig.id} className="w-full" />
                    </div>
                  </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
