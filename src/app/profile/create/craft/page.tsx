import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { WizardProgress } from "@/components/profile/wizard-progress";
import { getProfileByUserId } from "@/lib/api/profiles";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { requireRole } from "@/lib/auth-guards";
import { stepNumber, stepPath } from "@/lib/profile-progress";

import { CraftForm } from "./_craft-form";

export default async function CraftStepPage() {
  // Taxonomy depends on neither the session nor the profile; start it first so it
  // overlaps both reads. The no-op catch keeps a redirect from surfacing as an
  // unhandled rejection when we unwind before awaiting it.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  const session = await requireRole("MUSICIAN", "/profile/create/craft");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect(stepPath("identity"));
  const [instruments, genres] = await tagsPromise;

  return (
    <PageShell
      title="What do you play?"
      body="Add the instruments you play and the genres you work in."
      size="narrow"
    >
      <WizardProgress current={stepNumber("craft")} />
      <CraftForm
        instruments={instruments}
        genres={genres}
        selectedInstruments={profile.instruments ?? []}
        selectedGenres={profile.genres ?? []}
        backHref={stepPath("identity")}
        skipHref={stepPath("context")}
      />
    </PageShell>
  );
}
