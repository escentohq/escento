import Link from "next/link";

import { getActiveView } from "@/lib/active-view";
import { getCurrentSession, hasCapability } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import {
  PROFILE_WIZARD_TOTAL,
  completedStepCount,
  isProfileLaunchReady,
  nextIncompleteStep,
  resolveMusicianProfileNavigation,
} from "@/lib/profile-progress";

const STEP_PROMPT: Record<string, string> = {
  identity: "Add the name creators should see.",
  craft: "Add the instruments you play and the genres you work in.",
  context: "Add your school, location, and availability.",
  reach: "Add links to your work.",
};

/**
 * Shown to musicians who left the create wizard early. Reads the session, so
 * mount it inside a Suspense boundary to keep the surrounding page streaming.
 *
 * There is no dismiss control: it clears itself once the profile is listed
 * and every step holds something. Each remaining step is one click away.
 */
export async function FinishProfileNudge() {
  const [session, activeView] = await Promise.all([getCurrentSession(), getActiveView()]);
  // Capability decides whether the nudge is *possible*; the active view decides
  // whether it is *wanted*. A dual account working in creator mode is not nagged
  // about a half-finished musician profile.
  if (!hasCapability(session, "MUSICIAN") || activeView !== "MUSICIAN") return null;
  if (!session) return null;

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) return null;

  const step = nextIncompleteStep(profile);
  const listed = isProfileLaunchReady(profile);
  // A listed profile with every step filled has nothing left to say here.
  // The inverse can happen: every wizard step holds something, but the
  // something in "context" was only years of experience, which is not enough
  // to be listed. Send them back to context in that case.
  if (!step && listed) return null;
  const resumeStep = step ?? "context";
  const navigation = resolveMusicianProfileNavigation(profile);

  const done = completedStepCount(profile);

  return (
    <aside className="mb-8 flex flex-col gap-4 border-y border-rule bg-surface px-1 py-5 md:flex-row md:items-center md:justify-between md:px-4">
      <div className="min-w-0">
        <p className="text-meta uppercase text-brand">
          {listed
            ? `Profile setup: ${done} of ${PROFILE_WIZARD_TOTAL} steps`
            : "Saved, not listed yet"}
        </p>
        <p className="mt-2 text-body text-ink">
          {listed
            ? STEP_PROMPT[resumeStep]
            : "Add an instrument or genre and a bit of context so creators can find you."}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-5">
        <Link
          href={navigation.href}
          className="text-control text-brand transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          Continue setup
        </Link>
        <Link
          href={`/musicians/${profile.id}`}
          className="text-sm font-bold text-muted transition-colors duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          View your profile
        </Link>
      </div>
    </aside>
  );
}
