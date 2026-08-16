import type { MusicianProfile } from "@/lib/api/types";

/**
 * The create wizard saves one slice of the profile per step, so "where do I
 * resume?" has to be derived from the row itself rather than from client state.
 * A step counts as done once it holds anything at all — skipping is allowed
 * everywhere after identity, so the check is presence, not completeness.
 */

export const PROFILE_WIZARD_STEPS = ["identity", "craft", "context", "reach"] as const;

export type ProfileWizardStep = (typeof PROFILE_WIZARD_STEPS)[number];

export const PROFILE_WIZARD_TOTAL = PROFILE_WIZARD_STEPS.length;

type ProfileProgressInput = Pick<
  MusicianProfile,
  | "displayName"
  | "school"
  | "locationDisplayName"
  | "yearsExperience"
  | "availabilityText"
  | "instagramUrl"
  | "youtubeUrl"
  | "spotifyUrl"
  | "soundcloudUrl"
  | "websiteUrl"
> & { instruments?: string[]; genres?: string[] };

/**
 * The fields the launch-readiness check actually reads. Kept separate from
 * wizard-step progress: finishing a step and being listed are different
 * questions (years of experience completes "context" but is not enough context
 * for a creator to evaluate someone).
 */
export type ProfileLaunchInput = Pick<
  MusicianProfile,
  | "displayName"
  | "bio"
  | "school"
  | "location"
  | "locationDisplayName"
  | "locationCity"
  | "isRemote"
  | "availabilityText"
> & { instruments?: string[]; genres?: string[] };

function hasText(value?: string | null): boolean {
  return Boolean(value?.trim());
}

export function stepPath(step: ProfileWizardStep): string {
  return `/profile/create/${step}`;
}

export function stepNumber(step: ProfileWizardStep): number {
  return PROFILE_WIZARD_STEPS.indexOf(step) + 1;
}

export function nextStepAfter(step: ProfileWizardStep): ProfileWizardStep | null {
  return PROFILE_WIZARD_STEPS[stepNumber(step)] ?? null;
}

export function previousStepBefore(step: ProfileWizardStep): ProfileWizardStep | null {
  return PROFILE_WIZARD_STEPS[stepNumber(step) - 2] ?? null;
}

function isStepComplete(profile: ProfileProgressInput, step: ProfileWizardStep): boolean {
  switch (step) {
    case "identity":
      return Boolean(profile.displayName);
    case "craft":
      return (profile.instruments?.length ?? 0) > 0 || (profile.genres?.length ?? 0) > 0;
    case "context":
      return Boolean(
        profile.school ||
          profile.locationDisplayName ||
          profile.yearsExperience !== null ||
          profile.availabilityText,
      );
    case "reach":
      return Boolean(
        profile.instagramUrl ||
          profile.youtubeUrl ||
          profile.spotifyUrl ||
          profile.soundcloudUrl ||
          profile.websiteUrl,
      );
  }
}

export function completedStepCount(profile: ProfileProgressInput): number {
  return PROFILE_WIZARD_STEPS.filter((step) => isStepComplete(profile, step)).length;
}

/** The step the user should land on when resuming, or `null` once every step holds something. */
export function nextIncompleteStep(profile: ProfileProgressInput): ProfileWizardStep | null {
  return PROFILE_WIZARD_STEPS.find((step) => !isStepComplete(profile, step)) ?? null;
}

/**
 * Whether a profile is useful enough to be anonymous inventory.
 *
 * The threshold is deliberately small and uses only fields already on the row:
 * a name, at least one instrument or genre, and one piece of context a creator
 * can evaluate (bio, school, a location, remote availability, or an
 * availability note). Mirrors `musician_profile_is_launch_ready` in
 * `20260816040000_profile_launch_readiness.sql`.
 */
export function isProfileLaunchReady(profile: ProfileLaunchInput): boolean {
  if (!hasText(profile.displayName)) return false;

  const hasCraft = (profile.instruments?.length ?? 0) > 0 || (profile.genres?.length ?? 0) > 0;
  if (!hasCraft) return false;

  return (
    hasText(profile.bio) ||
    hasText(profile.school) ||
    hasText(profile.location) ||
    hasText(profile.locationDisplayName) ||
    hasText(profile.locationCity) ||
    profile.isRemote === true ||
    hasText(profile.availabilityText)
  );
}
