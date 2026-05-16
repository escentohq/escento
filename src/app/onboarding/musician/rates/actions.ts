"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateOnboardingStep, saveMusicianRates } from "@/lib/api/profiles";
import { ActionState, emptyActionState, parseIndexedRows } from "@/lib/form-utils";

export async function saveRatesAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/rates");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  // Parse indexed rate rows: rate[0][type], rate[0][amount], etc.
  const rateRows = parseIndexedRows(fd, "rate");
  const rates = rateRows
    .filter((row) => row.type || row.amount)
    .map((row) => ({
      rateType: row.type || "",
      amount: row.amount ? parseFloat(row.amount) : 0,
      currency: row.currency || "USD",
      notes: row.description || null,
    }));

  const errors: Record<string, string> = {};
  rateRows.forEach((row, idx) => {
    if (row.type && !row.amount) {
      errors[`rate[${idx}][amount]`] = "Amount is required";
    }
    if (row.amount && !row.type) {
      errors[`rate[${idx}][type]`] = "Rate type is required";
    }
  });
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix rate errors", fieldErrors: errors };
  }

  await saveMusicianRates(profile.id, rates);
  await updateOnboardingStep(profile.id, 4);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/availability");
}

export async function skipRatesAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/rates");
  redirect("/onboarding/musician/availability");
}
