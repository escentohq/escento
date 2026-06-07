"use server";

import { strOrEmpty } from "@/lib/form-utils";

export type LocationSuggestion = {
  placeId: string;
  description: string;
};

export type LocationDetails = {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  country: string | null;
};

function googleKey() {
  return process.env.GOOGLE_MAPS_API_KEY;
}

function component(components: any[], type: string, useShortName = false) {
  const found = components.find((item) => item.types?.includes(type));
  if (!found) return null;
  return useShortName ? found.short_name ?? found.long_name ?? null : found.long_name ?? null;
}

export async function getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  const input = strOrEmpty(query);
  const key = googleKey();
  if (!key || input.length < 2) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", input);
  url.searchParams.set("key", key);
  url.searchParams.set("types", "geocode");
  url.searchParams.set("language", "en");
  url.searchParams.set("components", "country:us");

  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) return [];
  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return [];

  return (data.predictions ?? []).slice(0, 5).map((prediction: any) => ({
    placeId: prediction.place_id,
    description: prediction.description,
  }));
}

export async function getLocationDetails(placeId: string): Promise<LocationDetails | null> {
  const id = strOrEmpty(placeId);
  const key = googleKey();
  if (!key || !id) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", id);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en");
  url.searchParams.set("fields", "place_id,formatted_address,geometry,address_component");

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.status !== "OK") return null;

  const result = data.result;
  const components = result.address_components ?? [];
  const location = result.geometry?.location;
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") return null;

  return {
    placeId: result.place_id,
    displayName: result.formatted_address,
    lat: location.lat,
    lng: location.lng,
    city:
      component(components, "locality") ??
      component(components, "postal_town") ??
      component(components, "administrative_area_level_2"),
    state: component(components, "administrative_area_level_1", true),
    country: component(components, "country", true),
  };
}

