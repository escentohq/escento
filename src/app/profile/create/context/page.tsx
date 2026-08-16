import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { WizardProgress } from "@/components/profile/wizard-progress";
import { getProfileByUserId } from "@/lib/api/profiles";
import { requireRole } from "@/lib/auth-guards";
import { stepNumber, stepPath } from "@/lib/profile-progress";

import { ContextForm } from "./_context-form";

export default async function ContextStepPage() {
  const session = await requireRole("MUSICIAN", "/profile/create/context");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect(stepPath("identity"));

  return (
    <PageShell
      title="Where are you, and when are you free?"
      body="These fields are optional. Skip anything you do not want to add yet."
      size="narrow"
    >
      <WizardProgress current={stepNumber("context")} />
      <ContextForm
        initial={{
          school: profile.school ?? "",
          location: profile.location ?? "",
          locationDisplayName: profile.locationDisplayName ?? profile.location ?? "",
          locationPlaceId: profile.locationPlaceId ?? "",
          locationLat: profile.locationLat === null ? "" : String(profile.locationLat),
          locationLng: profile.locationLng === null ? "" : String(profile.locationLng),
          locationCity: profile.locationCity ?? "",
          locationState: profile.locationState ?? "",
          locationCountry: profile.locationCountry ?? "",
          locationProvider: profile.locationProvider ?? "",
          providerPlaceId: profile.providerPlaceId ?? profile.locationPlaceId ?? "",
          locationVisibility: profile.locationVisibility,
          yearsExperience:
            profile.yearsExperience === null || profile.yearsExperience === undefined
              ? ""
              : String(profile.yearsExperience),
          availabilityText: profile.availabilityText ?? "",
        }}
        backHref={stepPath("craft")}
        skipHref={stepPath("reach")}
      />
    </PageShell>
  );
}
