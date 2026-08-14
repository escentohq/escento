import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { GigForm } from "../_gig-form";
import { createGigAction } from "./actions";

export default async function CreateGigPage() {
  // Taxonomy is public and session-independent, so it loads alongside the auth check
  // instead of after it. The no-op catch keeps a redirect from surfacing as an
  // unhandled rejection when the guard unwinds before we await.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  await requireRole("CREATOR", "/gigs/create");
  const [instruments, genres] = await tagsPromise;

  return (
    <PageShell
      eyebrow="Backstage"
      title="Post a Gig"
      body="Name the project, the sound, the timeline, and how musicians should think about compensation."
      size="medium"
    >
      <GigForm
        action={createGigAction}
        submitLabel="Publish Gig"
        pendingLabel="Publishing..."
        cancelHref="/gigs"
        instruments={instruments}
        genres={genres}
      />
    </PageShell>
  );
}
