import { PrimaryCta } from "@/components/ui/primary-cta";
import { getProfileByUserId } from "@/lib/api/profiles";
import { getCurrentSession } from "@/lib/auth-guards";
import { resolveMusicianProfileNavigation } from "@/lib/profile-progress";

/**
 * Reads the session, so every caller renders it inside its own Suspense boundary
 * and the page shell never waits on identity.
 */
export async function MusicianProfileCta() {
  const session = await getCurrentSession();
  const profile =
    session?.user.role === "MUSICIAN" ? await getProfileByUserId(session.user.id) : null;
  const navigation = resolveMusicianProfileNavigation(profile);

  return (
    <PrimaryCta href={navigation.href} prefetch={false}>
      {navigation.label}
    </PrimaryCta>
  );
}
