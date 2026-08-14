import { HomeLanding } from "@/components/home/HomeLanding";
import { listProfiles } from "@/lib/api/profiles";
import { listOpenGigs } from "@/lib/api/gigs";

export default async function Home() {
  const [featuredProfiles, featuredGigs] = await Promise.all([
    listProfiles(),
    listOpenGigs(),
  ]);

  return (
    <HomeLanding
      featuredProfiles={featuredProfiles.slice(0, 8)}
      featuredGigs={featuredGigs.slice(0, 2)}
    />
  );
}
