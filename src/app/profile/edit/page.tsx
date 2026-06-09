import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfileAction } from "./actions";

export default async function EditProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect("/profile/create");

  const instrumentsCsv = (profile.instruments || []).join(", ");
  const genresCsv = (profile.genres || []).join(", ");

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
          displayName: profile.displayName,
          bio: profile.bio ?? "",
          school: profile.school ?? "",
          location: profile.location ?? "",
          locationDisplayName: profile.locationDisplayName ?? profile.location ?? "",
          locationPlaceId: profile.locationPlaceId ?? "",
          locationLat: profile.locationLat === null ? "" : String(profile.locationLat),
          locationLng: profile.locationLng === null ? "" : String(profile.locationLng),
          locationCity: profile.locationCity ?? "",
          locationState: profile.locationState ?? "",
          locationCountry: profile.locationCountry ?? "",
          locationProvider: profile.locationProvider ?? "",
          providerPlaceId: profile.providerPlaceId ?? profile.locationPlaceId ?? "",
          locationVisibility: profile.locationVisibility,
          isRemote: profile.isRemote,
          seekingPaid: profile.seekingPaid,
          seekingUnpaid: profile.seekingUnpaid,
          yearsExperience:
            profile.yearsExperience === null || profile.yearsExperience === undefined
              ? ""
              : String(profile.yearsExperience),
          availabilityText: profile.availabilityText ?? "",
          instagramUrl: profile.instagramUrl ?? "",
          youtubeUrl: profile.youtubeUrl ?? "",
          spotifyUrl: profile.spotifyUrl ?? "",
          soundcloudUrl: profile.soundcloudUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          instrumentsCsv,
          genresCsv,
        }}
        action={updateMusicianProfileAction}
      />
    </PageShell>
  );
}
