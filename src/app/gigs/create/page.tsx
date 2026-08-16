import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { GigForm } from "../_gig-form";
import { createGigAction } from "./actions";
import { ACCOUNT_NAME_PATH, hasPublicName } from "@/lib/public-name";

export default async function CreateGigPage() {
  // Taxonomy is public and session-independent, so it loads alongside the auth check
  // instead of after it. The no-op catch keeps a redirect from surfacing as an
  // unhandled rejection when the guard unwinds before we await.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  const session = await requireRole("CREATOR", "/gigs/create");
  if (!hasPublicName(session.user.name)) redirect(ACCOUNT_NAME_PATH);
  const [instruments, genres] = await tagsPromise;

  return (
    <PageShell
      title="Post a gig"
      body="Tell musicians what the project needs, where it happens, what it pays, and when it is due."
      size="medium"
    >
      <GigForm
        action={createGigAction}
        submitLabel="Publish gig"
        pendingLabel="Publishing..."
        cancelHref="/gigs"
        instruments={instruments}
        genres={genres}
      />
    </PageShell>
  );
}
