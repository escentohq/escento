import {
  fieldError,
  isValidEmail,
  isValidUrlOrEmpty,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalInteger,
  strOrEmpty,
  parseOptionalDate,
} from "@/lib/form-utils";

export function validateStep1(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

  const displayName = strOrEmpty(fd.get("displayName"));
  const contactEmail = strOrEmpty(fd.get("contactEmail"));
  const bio = nonEmptyOrNull(fd.get("bio"));
  const school = nonEmptyOrNull(fd.get("school"));
  const location = nonEmptyOrNull(fd.get("location"));

  if (!displayName) fieldError(fieldErrors, "displayName", "Add the name creators should see.");
  if (displayName.length > 80) fieldError(fieldErrors, "displayName", "Keep the display name under 80 characters.");
  if (bio && bio.length > 1200) fieldError(fieldErrors, "bio", "Keep the bio under 1,200 characters.");
  if (!contactEmail) fieldError(fieldErrors, "contactEmail", "Add a contact email.");
  if (contactEmail && !isValidEmail(contactEmail)) fieldError(fieldErrors, "contactEmail", "Use a valid email address.");

  return {
    fieldErrors,
    data: {
      displayName,
      contactEmail,
      bio,
      school,
      location,
    },
  };
}

export function validateStep2(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

  const instruments = parseCsv(fd.get("instrumentsCsv"));
  const genres = parseCsv(fd.get("genresCsv"));
  const seekingPaid = fd.get("seekingPaid") === "on";
  const seekingUnpaid = fd.get("seekingUnpaid") === "on";
  const yearsExperienceRaw = strOrEmpty(fd.get("yearsExperience"));
  const yearsExperience = parseOptionalInteger(yearsExperienceRaw);
  const isRemote = fd.get("isRemote") === "on";
  const availabilityText = nonEmptyOrNull(fd.get("availabilityText"));

  if (!instruments.length) fieldError(fieldErrors, "instrumentsCsv", "Add at least one instrument.");
  if (!genres.length) fieldError(fieldErrors, "genresCsv", "Add at least one genre.");
  if (!seekingPaid && !seekingUnpaid) fieldError(fieldErrors, "seekingPaid", "Choose at least one compensation preference.");
  if (yearsExperienceRaw && yearsExperience === null) fieldError(fieldErrors, "yearsExperience", "Use a whole number.");
  if (yearsExperience !== null && yearsExperience < 0) fieldError(fieldErrors, "yearsExperience", "Experience cannot be negative.");

  return {
    fieldErrors,
    data: {
      instruments,
      genres,
      seekingPaid,
      seekingUnpaid,
      yearsExperience,
      isRemote,
      availabilityText,
    },
  };
}

export function validateStep3(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

  const videoPortfolioUrl = nonEmptyOrNull(fd.get("videoPortfolioUrl"));
  const profileImage = fd.get("profileImage") as File | null;
  const resumePdf = fd.get("resumePdf") as File | null;

  if (videoPortfolioUrl && !isValidUrlOrEmpty(videoPortfolioUrl)) {
    fieldError(fieldErrors, "videoPortfolioUrl", "Use a full http:// or https:// URL.");
  }

  if (profileImage && profileImage.size > 0) {
    if (!profileImage.type.startsWith("image/")) {
      fieldError(fieldErrors, "profileImage", "File must be an image.");
    } else if (profileImage.size > 5 * 1024 * 1024) {
      fieldError(fieldErrors, "profileImage", "Image must be smaller than 5MB.");
    }
  }

  if (resumePdf && resumePdf.size > 0) {
    if (resumePdf.type !== "application/pdf") {
      fieldError(fieldErrors, "resumePdf", "File must be a PDF.");
    } else if (resumePdf.size > 10 * 1024 * 1024) {
      fieldError(fieldErrors, "resumePdf", "PDF must be smaller than 10MB.");
    }
  }

  return {
    fieldErrors,
    data: {
      videoPortfolioUrl,
      profileImage,
      resumePdf,
    },
  };
}

export function validateStep4(fd: FormData) {
  const fieldErrors: Record<string, string> = {};
  // Rates validation handled per-row by parseIndexedRows
  return {
    fieldErrors,
    data: {},
  };
}

export function validateStep5(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

  const willingToTravel = fd.get("willingToTravel") === "on";
  const travelRadiusMilesRaw = strOrEmpty(fd.get("travelRadiusMiles"));
  const travelRadiusMiles = willingToTravel ? parseOptionalInteger(travelRadiusMilesRaw) : null;
  const tourStartDateRaw = strOrEmpty(fd.get("tourStartDate"));
  const tourStartDate = parseOptionalDate(tourStartDateRaw);
  const tourEndDateRaw = strOrEmpty(fd.get("tourEndDate"));
  const tourEndDate = parseOptionalDate(tourEndDateRaw);
  const minNoticeDaysRaw = strOrEmpty(fd.get("minNoticeDays"));
  const minNoticeDays = parseOptionalInteger(minNoticeDaysRaw) ?? 14;

  if (willingToTravel && !travelRadiusMiles) {
    fieldError(fieldErrors, "travelRadiusMiles", "Add a travel radius.");
  }
  if (travelRadiusMiles !== null && travelRadiusMiles < 0) {
    fieldError(fieldErrors, "travelRadiusMiles", "Radius cannot be negative.");
  }
  if (tourStartDateRaw && !tourStartDate) {
    fieldError(fieldErrors, "tourStartDate", "Use a valid date.");
  }
  if (tourEndDateRaw && !tourEndDate) {
    fieldError(fieldErrors, "tourEndDate", "Use a valid date.");
  }
  if (tourStartDate && tourEndDate && tourStartDate > tourEndDate) {
    fieldError(fieldErrors, "tourEndDate", "End date must be after start date.");
  }

  return {
    fieldErrors,
    data: {
      willingToTravel,
      travelRadiusMiles,
      tourStartDate,
      tourEndDate,
      minNoticeDays,
    },
  };
}

export function validateStep6(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

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
    if (!isValidUrlOrEmpty(value)) {
      fieldError(fieldErrors, field, "Use a full http:// or https:// URL.");
    }
  }

  return {
    fieldErrors,
    data: {
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      soundcloudUrl,
      websiteUrl,
    },
  };
}

export function validateStep7(fd: FormData) {
  const fieldErrors: Record<string, string> = {};

  const isSearchable = fd.get("isSearchable") === "on";
  const allowEventInvitations = fd.get("allowEventInvitations") === "on";
  const newsletterOptIn = fd.get("newsletterOptIn") === "on";

  return {
    fieldErrors,
    data: {
      isSearchable,
      allowEventInvitations,
      newsletterOptIn,
    },
  };
}
