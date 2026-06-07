import { fieldError, nonEmptyOrNull, strOrEmpty, type FieldErrors } from "@/lib/form-utils";

export type RemoteFilter = "include" | "remote" | "in_person";

export type StructuredLocationInput = {
  location: string | null;
  locationDisplayName: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationVisibility: "public_region" | "private";
};

export type LocationSearch = {
  query?: string;
  lat?: number | null;
  lng?: number | null;
  radiusMiles?: number | null;
  remoteFilter?: RemoteFilter;
};

const EARTH_RADIUS_MILES = 3958.7613;

function parseNumber(value: unknown): number | null {
  const raw = strOrEmpty(value);
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseStructuredLocation(fd: FormData): StructuredLocationInput {
  const displayName = nonEmptyOrNull(fd.get("locationDisplayName"));
  const legacyLocation = nonEmptyOrNull(fd.get("location")) ?? displayName;

  return {
    location: legacyLocation,
    locationDisplayName: displayName,
    locationPlaceId: nonEmptyOrNull(fd.get("locationPlaceId")),
    locationLat: parseNumber(fd.get("locationLat")),
    locationLng: parseNumber(fd.get("locationLng")),
    locationCity: nonEmptyOrNull(fd.get("locationCity")),
    locationState: nonEmptyOrNull(fd.get("locationState")),
    locationCountry: nonEmptyOrNull(fd.get("locationCountry")),
    locationVisibility: fd.get("locationVisibility") === "private" ? "private" : "public_region",
  };
}

export function validateStructuredLocation(
  fieldErrors: FieldErrors,
  location: StructuredLocationInput,
  isRemote: boolean,
) {
  if (isRemote) return;

  if (!location.locationDisplayName || location.locationLat === null || location.locationLng === null) {
    fieldError(fieldErrors, "locationDisplayName", "Choose a location from the suggestions or select Remote.");
  }
}

export function displayLocation(
  location: {
    locationDisplayName?: string | null;
    location?: string | null;
    isRemote?: boolean;
  },
  fallback = "Location not specified",
) {
  const display = location.locationDisplayName || location.location;
  if (display && location.isRemote) return `${display} · Remote available`;
  if (display) return display;
  if (location.isRemote) return "Remote";
  return fallback;
}

export function distanceMiles(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const toRad = (degrees: number) => degrees * (Math.PI / 180);
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

export function parseLocationSearch(params: {
  location?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  remote?: string;
  q?: string;
}): LocationSearch {
  const radius = parseNumber(params.radius);
  const remoteFilter: RemoteFilter =
    params.remote === "remote" || params.remote === "in_person" ? params.remote : "include";

  return {
    query: nonEmptyOrNull(params.q) ?? undefined,
    lat: parseNumber(params.lat),
    lng: parseNumber(params.lng),
    radiusMiles: radius && [5, 10, 20, 50, 100].includes(radius) ? radius : null,
    remoteFilter,
  };
}

