import { redirect } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfile } from "./actions";

export default async function EditProfilePage() {
  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await db.musicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      instruments: { include: { instrument: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!profile) redirect("/profile/create");

  const instrumentsCsv = profile.instruments
    .map((x) => x.instrument.name)
    .join(", ");
  const genresCsv = profile.genres.map((x) => x.genre.name).join(", ");

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
          isRemote: profile.isRemote,
          seekingPaid: profile.seekingPaid,
          seekingUnpaid: profile.seekingUnpaid,
          yearsExperience:
            profile.yearsExperience === null || profile.yearsExperience === undefined
              ? ""
              : String(profile.yearsExperience),
          availabilityText: profile.availabilityText ?? "",
          contactEmail: profile.contactEmail ?? "",
          instagramUrl: profile.instagramUrl ?? "",
          youtubeUrl: profile.youtubeUrl ?? "",
          spotifyUrl: profile.spotifyUrl ?? "",
          soundcloudUrl: profile.soundcloudUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          instrumentsCsv,
          genresCsv,
        }}
        action={updateMusicianProfile}
      />
    </PageShell>
  );
}
