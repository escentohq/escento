import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { convertSnakeToCamel } from "@/lib/db";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfile } from "./actions";

export default async function EditProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/edit");
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("user_id", session.user.id)
    .single();

  if (!profile) redirect("/profile/create");

  const profileData = convertSnakeToCamel(profile as Record<string, unknown>) as any;
  const instrumentsCsv = (profile.musician_instrument || [])
    .map((x: any) => x.instrument?.name)
    .join(", ");
  const genresCsv = (profile.musician_genre || []).map((x: any) => x.genre?.name).join(", ");

  return (
    <PageShell
      eyebrow="Soundcheck"
      title="Edit Profile"
      body="Tune the details creators see before they reach out."
      size="medium"
    >
      <ProfileForm
        mode="edit"
        initial={{
          displayName: profileData.displayName,
          bio: profileData.bio ?? "",
          school: profileData.school ?? "",
          location: profileData.location ?? "",
          isRemote: profileData.isRemote,
          seekingPaid: profileData.seekingPaid,
          seekingUnpaid: profileData.seekingUnpaid,
          yearsExperience:
            profileData.yearsExperience === null || profileData.yearsExperience === undefined
              ? ""
              : String(profileData.yearsExperience),
          availabilityText: profileData.availabilityText ?? "",
          contactEmail: profileData.contactEmail ?? "",
          instagramUrl: profileData.instagramUrl ?? "",
          youtubeUrl: profileData.youtubeUrl ?? "",
          spotifyUrl: profileData.spotifyUrl ?? "",
          soundcloudUrl: profileData.soundcloudUrl ?? "",
          websiteUrl: profileData.websiteUrl ?? "",
          instrumentsCsv,
          genresCsv,
        }}
        action={updateMusicianProfile}
      />
    </PageShell>
  );
}
