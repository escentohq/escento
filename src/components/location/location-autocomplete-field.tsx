"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { getLocationDetails, getLocationSuggestions, type LocationSuggestion } from "@/app/location/actions";

export type LocationAutocompleteValue = {
  location: string;
  locationDisplayName: string;
  locationPlaceId: string;
  locationLat: string;
  locationLng: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  locationProvider: string;
  providerPlaceId: string;
  locationVisibility: "public_region" | "private";
};

type Props = {
  value: LocationAutocompleteValue;
  onChange: (value: LocationAutocompleteValue) => void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "disabled" | "placeholder">;

const emptyStructured = {
  locationPlaceId: "",
  locationLat: "",
  locationLng: "",
  locationCity: "",
  locationState: "",
  locationCountry: "",
  locationProvider: "",
  providerPlaceId: "",
};

export function LocationAutocompleteField({
  value,
  onChange,
  invalid = false,
  disabled = false,
  placeholder = "Austin, TX",
  ...inputProps
}: Props) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const shouldSearch = !disabled && value.locationDisplayName.length >= 2 && !value.locationPlaceId;

  useEffect(() => {
    if (!shouldSearch) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const nextSuggestions = await getLocationSuggestions(value.locationDisplayName);
        if (requestIdRef.current === requestId) setSuggestions(nextSuggestions);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [shouldSearch, value.locationDisplayName]);

  function updateDisplay(nextDisplay: string) {
    if (nextDisplay.length < 2) setSuggestions([]);
    onChange({
      ...value,
      ...emptyStructured,
      location: nextDisplay,
      locationDisplayName: nextDisplay,
    });
  }

  function selectSuggestion(suggestion: LocationSuggestion) {
    const applyDetails = (details: {
      placeId: string;
      displayName: string;
      lat: number;
      lng: number;
      city: string | null;
      state: string | null;
      country: string | null;
      provider: string;
    }) => {
      onChange({
        ...value,
        location: details.displayName,
        locationDisplayName: details.displayName,
        locationPlaceId: details.placeId,
        providerPlaceId: details.placeId,
        locationProvider: details.provider,
        locationLat: String(details.lat),
        locationLng: String(details.lng),
        locationCity: details.city ?? "",
        locationState: details.state ?? "",
        locationCountry: details.country ?? "",
      });
      setSuggestions([]);
    };

    if (typeof suggestion.lat === "number" && typeof suggestion.lng === "number") {
      applyDetails(suggestion);
      return;
    }

    startTransition(async () => {
      const details = await getLocationDetails(suggestion.placeId);
      if (!details) {
        onChange({
          ...value,
          ...emptyStructured,
          location: suggestion.description,
          locationDisplayName: suggestion.description,
        });
        setSuggestions([]);
        return;
      }

      applyDetails(details);
    });
  }

  return (
    <div className="relative">
      <Input
        {...inputProps}
        value={value.locationDisplayName}
        onChange={(event) => updateDisplay(event.target.value)}
        placeholder={placeholder}
        invalid={invalid}
        disabled={disabled}
        autoComplete="off"
      />
      <input type="hidden" name="location" value={value.location} />
      <input type="hidden" name="locationDisplayName" value={value.locationDisplayName} />
      <input type="hidden" name="locationPlaceId" value={value.locationPlaceId} />
      <input type="hidden" name="locationLat" value={value.locationLat} />
      <input type="hidden" name="locationLng" value={value.locationLng} />
      <input type="hidden" name="locationCity" value={value.locationCity} />
      <input type="hidden" name="locationState" value={value.locationState} />
      <input type="hidden" name="locationCountry" value={value.locationCountry} />
      <input type="hidden" name="locationProvider" value={value.locationProvider} />
      <input type="hidden" name="providerPlaceId" value={value.providerPlaceId} />
      <input type="hidden" name="locationVisibility" value={value.locationVisibility} />

      {shouldSearch && suggestions.length > 0 ? (
        <div className="surface-overlay absolute z-30 mt-2 max-h-64 w-full overflow-auto border border-ink bg-surface p-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className="block w-full px-3 py-2 text-left text-control text-ink transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="block">{suggestion.description}</span>
              {suggestion.secondaryDescription ? (
                <span className="mt-0.5 block text-xs font-medium text-[#64748B]">
                  {suggestion.secondaryDescription}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {isPending ? (
        <p className="mt-2 text-xs font-medium text-[#64748B]">Checking locations...</p>
      ) : null}
    </div>
  );
}
