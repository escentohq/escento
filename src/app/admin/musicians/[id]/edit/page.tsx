import { redirect } from "next/navigation";

import { AdminNav, AdminSetupRequired, AdminUnavailable } from "@/components/admin/admin-display";
import { PageShell } from "@/components/ui/page-shell";
import { ProfileForm } from "@/app/profile/_profile-form";
import { getAdminAccess } from "@/lib/admin-auth";
import { getAdminEditableProfile } from "@/lib/api/admin-edits";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { adminUpdateMusicianProfileAction } from "./actions";

function isValidId(id: string) {
  return id.length > 0 && id.length < 128;
}

export default async function AdminEditMusicianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  const { id } = await params;
  if (!isValidId(id)) redirect("/admin/musicians");

  let profile;
  let instruments;
  let genres;
  try {
    [profile, instruments, genres] = await Promise.all([
      getAdminEditableProfile(id),
      listInstruments(),
      listGenres(),
    ]);
  } catch (error) {
    console.error("[admin] musician edit data failed", error);
    return <AdminSetupRequired />;
  }

  if (!profile) redirect("/admin/musicians");

  return (
    <PageShell
      eyebrow="Admin"
      title={`Edit ${profile.displayName}`}
      body="Full admin edit access for this musician profile. Changes affect the public profile immediately."
      size="medium"
    >
      <AdminNav />
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
          yearsExperience: profile.yearsExperience === null ? "" : String(profile.yearsExperience),
          availabilityText: profile.availabilityText ?? "",
          instagramUrl: profile.instagramUrl ?? "",
          youtubeUrl: profile.youtubeUrl ?? "",
          spotifyUrl: profile.spotifyUrl ?? "",
          soundcloudUrl: profile.soundcloudUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          instrumentsCsv: profile.instruments?.join(", ") ?? "",
          genresCsv: profile.genres?.join(", ") ?? "",
        }}
        action={(state, fd) => adminUpdateMusicianProfileAction(id, state, fd)}
        instruments={instruments}
        genres={genres}
        cancelHref="/admin/musicians"
      />
    </PageShell>
  );
}
