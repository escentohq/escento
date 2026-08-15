import Link from "next/link";

import { getCurrentSession } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import {
  PROFILE_WIZARD_TOTAL,
  completedStepCount,
  nextIncompleteStep,
  stepPath,
} from "@/lib/profile-progress";

const STEP_PROMPT: Record<string, string> = {
  identity: "Add the name creators should see.",
  craft: "Add your instruments and genres so creators can find you.",
  context: "Add your school, location, and availability.",
  reach: "Add links to your work so creators can hear you.",
};

/**
 * Shown to musicians who left the create wizard early. Reads the session, so
 * mount it inside a Suspense boundary to keep the surrounding page streaming.
 *
 * There is no dismiss control: it clears itself as soon as every step holds
 * something, and each step is one click away from here.
 */
export async function FinishProfileNudge() {
  const session = await getCurrentSession();
  if (session?.user?.role !== "MUSICIAN") return null;

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) return null;

  const step = nextIncompleteStep(profile);
  if (!step) return null;

  const done = completedStepCount(profile);

  return (
    <aside className="mb-8 flex flex-col gap-4 border-y border-rule bg-surface px-1 py-5 md:flex-row md:items-center md:justify-between md:px-4">
      <div className="min-w-0">
        <p className="text-meta uppercase text-brand">
          Your profile is {done} of {PROFILE_WIZARD_TOTAL} done
        </p>
        <p className="mt-2 text-body text-ink">{STEP_PROMPT[step]}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-5">
        <Link
          href={stepPath(step)}
          className="text-control text-brand transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          Continue
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
