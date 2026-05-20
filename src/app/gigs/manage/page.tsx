import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";
import { listGigsByCreator } from "@/lib/api/gigs";
import {
  clampText,
  compensationLabel,
  projectTypeLabel,
  visibleTags,
} from "@/lib/display";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Reveal } from "@/components/ui/reveal";
import { CloseGigButton } from "./CloseGigButton";
import { DeleteGigButton } from "./DeleteGigButton";

export default async function ManageGigsPage() {
  const session = await requireRole("CREATOR", "/gigs/manage");

  const gigs = await listGigsByCreator(session.user.id);

  return (
    <PageShell
      eyebrow="Stage management"
      title="Manage Gigs"
      body="Track your open projects, close them when the role is filled, or take them down."
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig, index) => {
              const instrumentTags = visibleTags(gig.instruments ?? []);
              const genreTags = visibleTags(gig.genres ?? []);

              return (
                <Reveal key={gig.id} delay={Math.min(index, 6) * 0.04}>
                  <div className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-[#FF3366]/8">
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-[#FF3366]/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />

                    <div className="relative z-10 flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                            {projectTypeLabel(gig.projectType)}
                          </span>
                          <Chip
                            tone={gig.status === "OPEN" ? "blue" : "neutral"}
                          >
                            {gig.status}
                          </Chip>
                        </div>
                        <h2 className="mt-1 wrap-break-word text-lg font-black tracking-tight text-[#0F172A]">
                          {gig.title}
                        </h2>
                      </div>
                      <Chip tone="gold">
                        {compensationLabel(gig.compensationType)}
                      </Chip>
                    </div>

                    <p className="relative z-10 mt-4 text-sm font-medium leading-relaxed text-[#475569]">
                      {clampText(gig.description, 160)}
                    </p>

                    <div className="relative z-10 mt-5 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {instrumentTags.shown.map((name) => (
                          <Chip key={`${gig.id}-i-${name}`} tone="blue">
                            {name}
                          </Chip>
                        ))}
                        {instrumentTags.hiddenCount ? (
                          <Chip>+{instrumentTags.hiddenCount} more</Chip>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {genreTags.shown.map((name) => (
                          <Chip key={`${gig.id}-g-${name}`} tone="pink">
                            {name}
                          </Chip>
                        ))}
                        {genreTags.hiddenCount ? (
                          <Chip>+{genreTags.hiddenCount} more</Chip>
                        ) : null}
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto space-y-3 pt-6">
                      <Link
                        href={`/gigs/${gig.id}/edit`}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-[#0055FF] px-4 py-2.5 text-sm font-bold text-[#0055FF] transition-all duration-200 hover:bg-[#0055FF] hover:text-white focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                      >
                        Edit
                      </Link>

                      {gig.status === "OPEN" ? (
                        <CloseGigButton gigId={gig.id} />
                      ) : null}

                      <DeleteGigButton gigId={gig.id} className="w-full" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
