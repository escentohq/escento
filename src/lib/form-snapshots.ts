import { strOrEmpty, type FormValues } from "@/lib/form-utils";

export function profileValuesFromFormData(fd: FormData): FormValues {
  return {
    displayName: strOrEmpty(fd.get("displayName")),
    bio: strOrEmpty(fd.get("bio")),
    school: strOrEmpty(fd.get("school")),
    location: strOrEmpty(fd.get("location")),
    locationDisplayName: strOrEmpty(fd.get("locationDisplayName")),
    locationPlaceId: strOrEmpty(fd.get("locationPlaceId")),
    locationLat: strOrEmpty(fd.get("locationLat")),
    locationLng: strOrEmpty(fd.get("locationLng")),
    locationCity: strOrEmpty(fd.get("locationCity")),
    locationState: strOrEmpty(fd.get("locationState")),
    locationCountry: strOrEmpty(fd.get("locationCountry")),
    locationProvider: strOrEmpty(fd.get("locationProvider")),
    providerPlaceId: strOrEmpty(fd.get("providerPlaceId")),
    locationVisibility: strOrEmpty(fd.get("locationVisibility")),
    isRemote: fd.get("isRemote") === "on",
    seekingPaid: fd.get("seekingPaid") === "on",
    seekingUnpaid: fd.get("seekingUnpaid") === "on",
    yearsExperience: strOrEmpty(fd.get("yearsExperience")),
    availabilityText: strOrEmpty(fd.get("availabilityText")),
    contactEmail: strOrEmpty(fd.get("contactEmail")),
    instrumentsCsv: strOrEmpty(fd.get("instrumentsCsv")),
    genresCsv: strOrEmpty(fd.get("genresCsv")),
    instagramUrl: strOrEmpty(fd.get("instagramUrl")),
    youtubeUrl: strOrEmpty(fd.get("youtubeUrl")),
    spotifyUrl: strOrEmpty(fd.get("spotifyUrl")),
    soundcloudUrl: strOrEmpty(fd.get("soundcloudUrl")),
    websiteUrl: strOrEmpty(fd.get("websiteUrl")),
  };
}

export function gigValuesFromFormData(fd: FormData): FormValues {
  return {
    title: strOrEmpty(fd.get("title")),
    description: strOrEmpty(fd.get("description")),
    projectType: strOrEmpty(fd.get("projectType")),
    location: strOrEmpty(fd.get("location")),
    locationDisplayName: strOrEmpty(fd.get("locationDisplayName")),
    locationPlaceId: strOrEmpty(fd.get("locationPlaceId")),
    locationLat: strOrEmpty(fd.get("locationLat")),
    locationLng: strOrEmpty(fd.get("locationLng")),
    locationCity: strOrEmpty(fd.get("locationCity")),
    locationState: strOrEmpty(fd.get("locationState")),
    locationCountry: strOrEmpty(fd.get("locationCountry")),
    locationProvider: strOrEmpty(fd.get("locationProvider")),
    providerPlaceId: strOrEmpty(fd.get("providerPlaceId")),
    locationVisibility: strOrEmpty(fd.get("locationVisibility")),
    isRemote: fd.get("isRemote") === "on",
    compensationType: strOrEmpty(fd.get("compensationType")),
    compensationDetails: strOrEmpty(fd.get("compensationDetails")),
    deadline: strOrEmpty(fd.get("deadline")),
    instrumentsCsv: strOrEmpty(fd.get("instrumentsCsv")),
    genresCsv: strOrEmpty(fd.get("genresCsv")),
  };
}

export function boolValue(values: FormValues | undefined, key: string, fallback: boolean): boolean {
  const value = values?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function stringValue(values: FormValues | undefined, key: string, fallback = ""): string {
  const value = values?.[key];
  return typeof value === "string" ? value : fallback;
}
