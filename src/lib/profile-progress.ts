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
