import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { BasicsForm } from "./_form";
import { saveBasicsAction } from "./actions";

export default async function BasicsPage() {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/basics");
  const profile = await getProfileByUserId(session.user.id);

  return (
    <BasicsForm
      action={saveBasicsAction}
      initialData={profile}
      userId={session.user.id}
    />
  );
}
