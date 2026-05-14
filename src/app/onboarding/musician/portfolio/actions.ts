"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile, updateOnboardingStep } from "@/lib/api/profiles";
import { uploadProfileImage, uploadResumePdf } from "@/lib/api/media";
import { validateStep3 } from "@/lib/validation/profile";
import { ActionState, emptyActionState } from "@/lib/form-utils";

export async function savePortfolioAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/portfolio");
  const { fieldErrors, data } = validateStep3(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  const profileImageFile = fd.get("profileImage") as File | null;
  const resumePdfFile = fd.get("resumePdf") as File | null;

  let profileImageUrl = profile.profileImageUrl;
  let resumePdfUrl = profile.resumePdfUrl;

  if (profileImageFile && profileImageFile.size > 0) {
    try {
      profileImageUrl = await uploadProfileImage(session.user.id, profileImageFile);
    } catch (err) {
      return { ok: false, message: "Failed to upload profile image", fieldErrors: {} };
    }
  }

  if (resumePdfFile && resumePdfFile.size > 0) {
    try {
      resumePdfUrl = await uploadResumePdf(session.user.id, resumePdfFile);
    } catch (err) {
      return { ok: false, message: "Failed to upload resume PDF", fieldErrors: {} };
    }
  }

  await updateProfile(profile.id, {
    ...data,
    profileImageUrl,
    resumePdfUrl,
  });
  await updateOnboardingStep(profile.id, 3);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/rates");
}

export async function skipPortfolioAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/portfolio");
  redirect("/onboarding/musician/rates");
}
