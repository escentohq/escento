import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { PreferencesForm } from "./_form";
import { savePreferencesAction } from "./actions";

export default async function PreferencesPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/preferences");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return <PreferencesForm action={savePreferencesAction} initialData={profile} />;
}
