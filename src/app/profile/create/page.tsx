import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { ProfileForm } from "../_profile-form";
import { createMusicianProfile } from "./actions";

export default async function CreateProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/create");
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("musician_profile")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

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
        action={createMusicianProfile}
      />
    </PageShell>
  );
}
