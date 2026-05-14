"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile, updateOnboardingStep } from "@/lib/api/profiles";
import { validateStep6 } from "@/lib/validation/profile";
import { ActionState, emptyActionState } from "@/lib/form-utils";

export async function saveSocialAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/social");
  const { fieldErrors, data } = validateStep6(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  await updateProfile(profile.id, data);
  await updateOnboardingStep(profile.id, 6);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/preferences");
}

export async function skipSocialAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/social");
  redirect("/onboarding/musician/preferences");
}
