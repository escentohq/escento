import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/api/profiles";
import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { ProfileForm } from "../_profile-form";
import { createMusicianProfileAction } from "./actions";

export default async function CreateProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/create");

  const existing = await getProfileByUserId(session.user.id);
  if (existing) redirect("/profile/edit");

  return (
    <PageShell
      eyebrow="On stage"
      title="Create Profile"
      body="Put your sound where creators can find it. Keep it specific, link your work, and make email easy."
      size="medium"
    >
      <ProfileForm
        mode="create"
        initial={{ isRemote: true, seekingPaid: true, seekingUnpaid: true }}
        action={createMusicianProfileAction}
      />
    </PageShell>
  );
}
