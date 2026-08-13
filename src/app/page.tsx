import { redirect } from "next/navigation";

import { HomeLanding } from "@/components/home/HomeLanding";
import { getCurrentSession } from "@/lib/auth-guards";
import { getProfileByUserId, listProfiles } from "@/lib/api/profiles";
import { listOpenGigs } from "@/lib/api/gigs";

export default async function Home() {
  const [session, featuredProfiles, featuredGigs] = await Promise.all([
    getCurrentSession(),
    listProfiles(),
    listOpenGigs(),
  ]);

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  const isMusician = session?.user?.role === "MUSICIAN";
  const isCreator = session?.user?.role === "CREATOR";

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (isMusician && session?.user?.id) {
    const existing = await getProfileByUserId(session.user.id);
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
      featuredProfiles={featuredProfiles.slice(0, 8)}
      featuredGigs={featuredGigs.slice(0, 2)}
    />
  );
}
