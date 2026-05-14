import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { AvailabilityForm } from "./_form";
import { saveAvailabilityAction } from "./actions";

export default async function AvailabilityPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/availability");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return <AvailabilityForm action={saveAvailabilityAction} initialData={profile} />;
}
