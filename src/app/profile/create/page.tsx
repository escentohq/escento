import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/api/profiles";
import { requireRole } from "@/lib/auth-guards";
import { nextIncompleteStep, stepPath } from "@/lib/profile-progress";

/**
 * Entry point for the create wizard. Holds no UI of its own — it resolves where
 * the user left off and forwards, so `/profile/create` stays a stable link from
 * the directory, the nav, and the onboarding role picker.
 */
export default async function CreateProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/create");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect(stepPath("identity"));

  const step = nextIncompleteStep(profile);
  if (!step) redirect("/profile/edit");

  redirect(stepPath(step));
}
