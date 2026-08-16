import { HomeLanding } from "@/components/home/HomeLanding";
import { getProfileByUserId, listProfiles } from "@/lib/api/profiles";
import { listOpenGigs } from "@/lib/api/gigs";
import { getCurrentSession } from "@/lib/auth-guards";
import { resolveMusicianProfileNavigation } from "@/lib/profile-progress";

export default async function Home() {
  const [profilesResult, gigsResult, sessionResult] = await Promise.allSettled([
    listProfiles(),
    listOpenGigs(),
    getCurrentSession(),
  ]);
  if (profilesResult.status === "rejected") {
    console.error("[home] featured profiles unavailable", profilesResult.reason);
  }
  if (gigsResult.status === "rejected") {
    console.error("[home] featured gigs unavailable", gigsResult.reason);
  }

  const featuredProfiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const featuredGigs = gigsResult.status === "fulfilled" ? gigsResult.value : [];
  const session = sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const musicianProfile =
    session?.user.role === "MUSICIAN"
      ? await getProfileByUserId(session.user.id).catch((error) => {
          console.error("[home] musician profile navigation unavailable", error);
          return undefined;
        })
      : undefined;
  const musicianProfileNavigation =
    musicianProfile === undefined ? undefined : resolveMusicianProfileNavigation(musicianProfile);

  return (
    <HomeLanding
      featuredProfiles={featuredProfiles.slice(0, 8)}
      featuredGigs={featuredGigs.slice(0, 3)}
      musicianProfileNavigation={musicianProfileNavigation}
    />
  );
}
