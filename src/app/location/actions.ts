"use server";

import { strOrEmpty } from "@/lib/form-utils";
import {
  getLaunchMarketByPlaceId,
  getLaunchMarketSuggestions,
  type LaunchMarket,
} from "@/lib/launch-markets";

export type LocationSuggestion = {
  placeId: string;
  description: string;
  displayName: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  country: string | null;
  provider: "geoapify" | "launch_market";
};

export type LocationDetails = {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  country: string | null;
  provider: "geoapify" | "launch_market";
};

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    formatted?: string;
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
    lat?: number;
    lon?: number;
  };
};

function geoapifyKey() {
  return process.env.GEOAPIFY_API_KEY;
}

function locality(properties: NonNullable<GeoapifyFeature["properties"]>) {
  return properties.city ?? properties.town ?? properties.village ?? properties.municipality ?? properties.name ?? null;
}

function cleanDisplay(properties: NonNullable<GeoapifyFeature["properties"]>) {
  const city = locality(properties);
  const state = properties.state_code ?? properties.state ?? null;
  const country = properties.country_code?.toUpperCase() ?? properties.country ?? null;

  if (city && state && country && country !== "US") return `${city}, ${state}, ${country}`;
  if (city && state) return `${city}, ${state}`;
  if (city && country && country !== "US") return `${city}, ${country}`;
  return properties.formatted ?? city ?? "";
}

function toLocationDetails(feature: GeoapifyFeature): LocationDetails | null {
  const properties = feature.properties;
  if (!properties || typeof properties.lat !== "number" || typeof properties.lon !== "number") {
    return null;
  }

  const displayName = cleanDisplay(properties);
  if (!displayName) return null;

  const placeId = properties.place_id ?? `${properties.lat},${properties.lon},${displayName}`;
  const country = properties.country_code?.toUpperCase() ?? properties.country ?? null;

  return {
    placeId,
    displayName,
    lat: properties.lat,
    lng: properties.lon,
    city: locality(properties),
    state: properties.state_code ?? properties.state ?? null,
    country,
    provider: "geoapify",
  };
}

function launchMarketToDetails(market: LaunchMarket): LocationDetails {
  return {
    placeId: market.placeId,
    displayName: market.displayName,
    lat: market.lat,
    lng: market.lng,
    city: market.city,
    state: market.state,
    country: market.country,
    provider: "launch_market",
  };
}

function dedupeSuggestions(suggestions: LocationSuggestion[]) {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.displayName.toLowerCase()}:${suggestion.lat}:${suggestion.lng}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  const input = strOrEmpty(query);
  const launchSuggestions = getLaunchMarketSuggestions(input).map((market) => ({
    ...launchMarketToDetails(market),
    description: market.displayName,
  }));

  if (launchSuggestions.length >= 3) return launchSuggestions.slice(0, 5);

  const key = geoapifyKey();
  if (!key || input.length < 2) return launchSuggestions;

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", input);
  url.searchParams.set("apiKey", key);
  url.searchParams.set("type", "city");
  url.searchParams.set("filter", "countrycode:us");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "5");

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return launchSuggestions;
    const data = await response.json();

    const geoapifySuggestions = (data.features ?? [])
      .map((feature: GeoapifyFeature) => toLocationDetails(feature))
      .filter((details: LocationDetails | null): details is LocationDetails => Boolean(details))
      .slice(0, 5)
      .map((details: LocationDetails) => ({
        ...details,
        description: details.displayName,
      }));

    return dedupeSuggestions([...launchSuggestions, ...geoapifySuggestions]).slice(0, 5);
  } catch (error) {
    console.error("[location] Geoapify autocomplete failed:", error);
    return launchSuggestions;
  }
}

export async function getLocationDetails(placeId: string): Promise<LocationDetails | null> {
  const id = strOrEmpty(placeId);
  const launchMarket = getLaunchMarketByPlaceId(id);
  if (launchMarket) return launchMarketToDetails(launchMarket);

  const key = geoapifyKey();
  if (!key || !id) return null;

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("apiKey", key);
  url.searchParams.set("filter", `place:${id}`);
  url.searchParams.set("format", "geojson");
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) return null;
    const data = await response.json();
    const feature = data.features?.[0];

    return feature ? toLocationDetails(feature) : null;
  } catch (error) {
    console.error("[location] Geoapify details lookup failed:", error);
    return null;
  }
}
