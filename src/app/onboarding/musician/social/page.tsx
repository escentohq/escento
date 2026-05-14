import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { SocialForm } from "./_form";
import { saveSocialAction } from "./actions";

export default async function SocialPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/social");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return <SocialForm action={saveSocialAction} initialData={profile} />;
}
