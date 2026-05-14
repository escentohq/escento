import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { SoundForm } from "./_form";
import { saveSoundAction } from "./actions";

export default async function SoundPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/sound");
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  return <SoundForm action={saveSoundAction} initialData={profile} />;
}
