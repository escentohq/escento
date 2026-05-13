import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { GigForm } from "../_gig-form";
import { createGigAction } from "./actions";

export default async function CreateGigPage() {
  await requireRole("CREATOR", "/gigs/create");

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
      />
    </PageShell>
  );
}
