import type { Metadata } from "next";

import { HomeLanding } from "@/components/home/HomeLanding";
import { listOpenGigs } from "@/lib/api/gigs";
import { getProfileByUserId, listProfiles } from "@/lib/api/profiles";
import { getCurrentSession } from "@/lib/auth-guards";
import { resolveMusicianProfileNavigation } from "@/lib/profile-progress";

export const metadata: Metadata = {
  title: "About",
  description: "Musicians create profiles, creators post gigs, and either side can send a request.",
};

/**
 * The editorial introduction to Escento. This used to be `/`, which now shows the
 * marketplace directly (issue #5); the pitch kept its own route rather than being
 * deleted.
 */
export default async function AboutPage() {
  const [profilesResult, gigsResult, sessionResult] = await Promise.allSettled([
    listProfiles(),
    listOpenGigs(),
    getCurrentSession(),
  ]);
  if (profilesResult.status === "rejected") {
    console.error("[about] featured profiles unavailable", profilesResult.reason);
  }
  if (gigsResult.status === "rejected") {
    console.error("[about] featured gigs unavailable", gigsResult.reason);
  }
  // A rejected session is deliberately silent. `getCurrentSession()` reads cookies,
  // so during the build's static-render attempt it throws Next's dynamic-usage
  // bailout — a control-flow signal, not a failure. Logging it printed an error on
  // every build for a route that then correctly rendered dynamically.

  const featuredProfiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const featuredGigs = gigsResult.status === "fulfilled" ? gigsResult.value : [];
  const session = sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const musicianProfile =
    session?.user.role === "MUSICIAN"
      ? await getProfileByUserId(session.user.id).catch((error) => {
          console.error("[about] musician profile navigation unavailable", error);
          return undefined;
        })
      : undefined;
  const musicianProfileNavigation =
    musicianProfile === undefined ? undefined : resolveMusicianProfileNavigation(musicianProfile);

  return (
    <HomeLanding
      featuredProfiles={featuredProfiles.slice(0, 8)}
      featuredGigs={featuredGigs.slice(0, 2)}
      musicianProfileNavigation={musicianProfileNavigation}
    />
  );
}
