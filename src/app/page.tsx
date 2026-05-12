import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { HomeLanding } from "@/components/home/HomeLanding";
import { db } from "@/lib/db";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  const isMusician = session?.user?.role === "MUSICIAN";
  const isCreator = session?.user?.role === "CREATOR";

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (isMusician && session.user?.id) {
    const existing = await db.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const secondaryHref = isCreator
    ? "/gigs/create"
    : musicianProfilePath
      ? musicianProfilePath
      : "/signin";

  const secondaryLabel = isCreator
    ? "Post a Gig"
    : musicianProfilePath === "/profile/edit"
      ? "Edit Profile"
      : musicianProfilePath === "/profile/create"
        ? "Create Profile"
        : "Sign In";

  const signedInLabel = session?.user?.role
    ? session.user.role.toLowerCase()
    : session?.user?.email ?? null;

  return (
    <HomeLanding
      secondaryHref={secondaryHref}
      secondaryLabel={secondaryLabel}
      signedInLabel={signedInLabel}
    />
  );
}

