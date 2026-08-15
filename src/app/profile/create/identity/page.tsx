import { PageShell } from "@/components/ui/page-shell";
import { WizardProgress } from "@/components/profile/wizard-progress";
import { getProfileByUserId } from "@/lib/api/profiles";
import { requireRole } from "@/lib/auth-guards";
import { stepNumber } from "@/lib/profile-progress";

import { IdentityForm } from "./_identity-form";

export default async function IdentityStepPage() {
  const session = await requireRole("MUSICIAN", "/profile/create/identity");
  const profile = await getProfileByUserId(session.user.id);

  return (
    <PageShell
      eyebrow="On stage"
      title="What should creators call you?"
      body="One field is all it takes to get listed. Everything else can wait."
      size="narrow"
    >
      <WizardProgress current={stepNumber("identity")} />
      <IdentityForm
        initial={{
          displayName: profile?.displayName ?? "",
          bio: profile?.bio ?? "",
        }}
      />
    </PageShell>
  );
}
