import {
  fieldError,
  isValidUrlOrEmpty,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalInteger,
  strOrEmpty,
  type FieldErrors,
} from "@/lib/form-utils";
import { parseStructuredLocation } from "@/lib/location";
import type { CreateProfileInput } from "@/lib/api/types";

/**
 * Profile parsing/validation shared by the create wizard steps and the full
 * `/profile/edit` form. The wizard saves one slice per step, so each slice gets
 * its own parser and `validateProfile` composes all four — that way a rule added
 * for the edit form cannot silently skip the wizard, or the other way around.
 */

export function validateIdentity(fd: FormData) {
  const fieldErrors: FieldErrors = {};

  const displayName = strOrEmpty(fd.get("displayName"));
  const bio = nonEmptyOrNull(fd.get("bio"));

  if (!displayName) fieldError(fieldErrors, "displayName", "Add the name creators should see.");
  if (displayName.length > 80) fieldError(fieldErrors, "displayName", "Keep the display name under 80 characters.");
  if (bio && bio.length > 1200) fieldError(fieldErrors, "bio", "Keep the bio under 1,200 characters.");

  return { fieldErrors, data: { displayName, bio } };
}

export function validateCraft(fd: FormData) {
  const fieldErrors: FieldErrors = {};

  return {
    fieldErrors,
    data: {
      instruments: parseCsv(fd.get("instrumentsCsv")),
      genres: parseCsv(fd.get("genresCsv")),
    },
  };
}

export function validateContext(fd: FormData) {
  const fieldErrors: FieldErrors = {};

  const school = nonEmptyOrNull(fd.get("school"));
  const location = parseStructuredLocation(fd);
  const yearsExperienceRaw = strOrEmpty(fd.get("yearsExperience"));
  const yearsExperience = parseOptionalInteger(yearsExperienceRaw);
  const availabilityText = nonEmptyOrNull(fd.get("availabilityText"));

  if (yearsExperienceRaw && yearsExperience === null) fieldError(fieldErrors, "yearsExperience", "Use a whole number.");
  if (yearsExperience !== null && yearsExperience < 0) fieldError(fieldErrors, "yearsExperience", "Experience cannot be negative.");

  return {
    fieldErrors,
    data: { school, ...location, yearsExperience, availabilityText },
  };
}

export function validateReach(fd: FormData) {
  const fieldErrors: FieldErrors = {};

  const isRemote = fd.get("isRemote") === "on";
  const seekingPaid = fd.get("seekingPaid") === "on";
  const seekingUnpaid = fd.get("seekingUnpaid") === "on";
  const instagramUrl = nonEmptyOrNull(fd.get("instagramUrl"));
  const youtubeUrl = nonEmptyOrNull(fd.get("youtubeUrl"));
  const spotifyUrl = nonEmptyOrNull(fd.get("spotifyUrl"));
  const soundcloudUrl = nonEmptyOrNull(fd.get("soundcloudUrl"));
  const websiteUrl = nonEmptyOrNull(fd.get("websiteUrl"));

  for (const [field, value] of Object.entries({
    instagramUrl,
    youtubeUrl,
    spotifyUrl,
    soundcloudUrl,
    websiteUrl,
  })) {
    if (!isValidUrlOrEmpty(value)) fieldError(fieldErrors, field, "Use a full http:// or https:// URL.");
  }

  return {
    fieldErrors,
    data: {
      isRemote,
      seekingPaid,
      seekingUnpaid,
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      soundcloudUrl,
      websiteUrl,
    },
  };
}

/** Every field at once — what `/profile/edit` submits. */
export function validateProfile(fd: FormData) {
  const identity = validateIdentity(fd);
  const craft = validateCraft(fd);
  const context = validateContext(fd);
  const reach = validateReach(fd);

  return {
    fieldErrors: {
      ...identity.fieldErrors,
      ...craft.fieldErrors,
      ...context.fieldErrors,
      ...reach.fieldErrors,
    },
    data: { ...identity.data, ...craft.data, ...context.data, ...reach.data },
  };
}

/**
 * A profile row the wizard can insert after step one alone. The three booleans
 * default to `true` here even though the columns default to `false` in Postgres:
 * that matches what `/profile/create` has always pre-checked, and a bare profile
 * saved with `is_remote = false` and no location would be filtered out of the
 * directory the user is about to land on.
 */
export function emptyProfileInput(contactEmail: string): CreateProfileInput {
  return {
    displayName: "",
    bio: null,
    school: null,
    location: null,
    locationDisplayName: null,
    locationPlaceId: null,
    locationLat: null,
    locationLng: null,
    locationCity: null,
    locationState: null,
    locationCountry: null,
    locationProvider: null,
    providerPlaceId: null,
    locationVisibility: "public_region",
    isRemote: true,
    seekingPaid: true,
    seekingUnpaid: true,
    yearsExperience: null,
    availabilityText: null,
    contactEmail,
    instagramUrl: null,
    youtubeUrl: null,
    spotifyUrl: null,
    soundcloudUrl: null,
    websiteUrl: null,
  };
}
