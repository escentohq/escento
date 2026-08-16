import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { listGenres, listInstruments } from "@/lib/api/tags";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfileAction } from "./actions";

export default async function EditProfilePage() {
  // Taxonomy depends on neither the session nor the profile; start it first so it
  // overlaps both reads. The no-op catch keeps a redirect from surfacing as an
  // unhandled rejection when we unwind before awaiting it.
  const tagsPromise = Promise.all([listInstruments(), listGenres()]);
  tagsPromise.catch(() => {});

  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect("/profile/create");
  const [instruments, genres] = await tagsPromise;

  const instrumentsCsv = (profile.instruments || []).join(", ");
  const genresCsv = (profile.genres || []).join(", ");

  return (
    <PageShell
      eyebrow="Your profile"
      title="Edit profile"
      body="Update the information people see in the musician directory."
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
        instruments={instruments}
        genres={genres}
      />
    </PageShell>
  );
}
