import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "../_profile-form";
import { createMusicianProfile } from "./actions";

export default async function CreateProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "MUSICIAN") redirect("/");

  const existing = await db.musicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/profile/edit");

  return (
    <ProfileForm
      mode="create"
      initial={{ isRemote: true, seekingPaid: true, seekingUnpaid: true }}
      action={createMusicianProfile}
    />
  );
}

