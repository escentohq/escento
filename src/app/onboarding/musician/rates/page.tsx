import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, getMusicianRates } from "@/lib/api/profiles";
import { RatesForm } from "./_form";
import { saveRatesAction } from "./actions";

export default async function RatesPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/rates");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  const rates = await getMusicianRates(profile.id);

  return <RatesForm action={saveRatesAction} initialData={profile} rates={rates} />;
}
