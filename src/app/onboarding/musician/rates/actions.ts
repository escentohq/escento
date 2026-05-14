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
  const rates = rateRows.map((row, idx) => ({
    id: `rate-${idx}`,
    musicianProfileId: profile.id,
    rateType: row.type || "",
    amount: row.amount ? parseFloat(row.amount) : null,
    description: row.description || null,
  }));

  // Validate at least one rate if any rates are provided
  const hasRates = rates.some((r) => r.rateType || r.amount);
  if (hasRates) {
    const errors: Record<string, string> = {};
    rates.forEach((rate, idx) => {
      if (rate.rateType && !rate.amount) {
        errors[`rate[${idx}][amount]`] = "Amount is required";
      }
      if (rate.amount && !rate.rateType) {
        errors[`rate[${idx}][type]`] = "Rate type is required";
      }
    });
    if (Object.keys(errors).length) {
      return { ok: false, message: "Please fix rate errors", fieldErrors: errors };
    }
  }

  await saveMusicianRates(
    profile.id,
    rates.filter((r) => r.rateType && r.amount)
  );
  await updateOnboardingStep(profile.id, 4);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/availability");
}

export async function skipRatesAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/rates");
  redirect("/onboarding/musician/availability");
}
