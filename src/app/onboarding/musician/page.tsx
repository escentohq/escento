import { redirect } from "next/navigation";
import { getProfileByUserId } from "@/lib/api/profiles";
import { requireRole } from "@/lib/auth-guards";

export default async function MusicianoOnboardingPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/basics");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  const nextStep = Math.min(profile.onboardingStep ?? 0, 6) + 1;
  const stepMap = ["basics", "sound", "portfolio", "rates", "availability", "social", "preferences"];
  const nextSlug = stepMap[nextStep - 1] || "basics";

  if (nextStep > 7) {
    redirect("/profile/edit");
  }

  redirect(`/onboarding/musician/${nextSlug}`);
}
