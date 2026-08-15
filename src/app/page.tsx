import { HomeLanding } from "@/components/home/HomeLanding";
import { listProfiles } from "@/lib/api/profiles";
import { listOpenGigs } from "@/lib/api/gigs";

export default async function Home() {
  const [profilesResult, gigsResult] = await Promise.allSettled([
    listProfiles(),
    listOpenGigs(),
  ]);
  if (profilesResult.status === "rejected") {
    console.error("[home] featured profiles unavailable", profilesResult.reason);
  }
  if (gigsResult.status === "rejected") {
    console.error("[home] featured gigs unavailable", gigsResult.reason);
  }

  const featuredProfiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const featuredGigs = gigsResult.status === "fulfilled" ? gigsResult.value : [];

  return (
    <HomeLanding
      featuredProfiles={featuredProfiles.slice(0, 8)}
      featuredGigs={featuredGigs.slice(0, 2)}
    />
  );
}
