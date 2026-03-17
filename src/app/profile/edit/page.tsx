import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "../_profile-form";
import { updateMusicianProfile } from "./actions";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "MUSICIAN") redirect("/");

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
  );
}

