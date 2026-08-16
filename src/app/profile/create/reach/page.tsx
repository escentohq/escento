import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { WizardProgress } from "@/components/profile/wizard-progress";
import { getProfileByUserId } from "@/lib/api/profiles";
import { requireRole } from "@/lib/auth-guards";
import { stepNumber, stepPath } from "@/lib/profile-progress";

import { ReachForm } from "./_reach-form";

export default async function ReachStepPage() {
  const session = await requireRole("MUSICIAN", "/profile/create/reach");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect(stepPath("identity"));

  return (
    <PageShell
      eyebrow="Links"
      title="Where can people hear your work?"
      body="Add any work links you want to share, then choose the work you accept."
      size="narrow"
    >
      <WizardProgress current={stepNumber("reach")} />
      <ReachForm
        initial={{
          isRemote: profile.isRemote,
          seekingPaid: profile.seekingPaid,
          seekingUnpaid: profile.seekingUnpaid,
          youtubeUrl: profile.youtubeUrl ?? "",
          soundcloudUrl: profile.soundcloudUrl ?? "",
          spotifyUrl: profile.spotifyUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          instagramUrl: profile.instagramUrl ?? "",
        }}
        backHref={stepPath("context")}
        skipHref={`/musicians/${profile.id}`}
      />
    </PageShell>
  );
}
