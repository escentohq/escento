"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile, updateOnboardingStep } from "@/lib/api/profiles";
import { validateStep7 } from "@/lib/validation/profile";
import { ActionState, emptyActionState } from "@/lib/form-utils";

export async function savePreferencesAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/preferences");
  const { fieldErrors, data } = validateStep7(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  await updateProfile(profile.id, data);
  await updateOnboardingStep(profile.id, 7);

  revalidatePath("/onboarding/musician");
  revalidatePath("/profile/edit");
  redirect("/profile/edit");
}
