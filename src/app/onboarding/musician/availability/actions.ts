"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile, updateOnboardingStep } from "@/lib/api/profiles";
import { validateStep5 } from "@/lib/validation/profile";
import { ActionState, emptyActionState } from "@/lib/form-utils";

export async function saveAvailabilityAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/availability");
  const { fieldErrors, data } = validateStep5(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  await updateProfile(profile.id, {
    willingToTravel: data.willingToTravel,
    travelRadiusMiles: data.travelRadiusMiles,
    tourStartDate: data.tourStartDate ? data.tourStartDate.toISOString().split("T")[0] : null,
    tourEndDate: data.tourEndDate ? data.tourEndDate.toISOString().split("T")[0] : null,
    minNoticeDays: data.minNoticeDays,
  });
  await updateOnboardingStep(profile.id, 5);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/social");
}

export async function skipAvailabilityAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/availability");
  redirect("/onboarding/musician/social");
}
