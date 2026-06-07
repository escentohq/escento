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

      onChange({
        ...value,
        location: details.displayName,
        locationDisplayName: details.displayName,
        locationPlaceId: details.placeId,
        locationLat: String(details.lat),
        locationLng: String(details.lng),
        locationCity: details.city ?? "",
        locationState: details.state ?? "",
        locationCountry: details.country ?? "",
      });
      setSuggestions([]);
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
      <input type="hidden" name="locationVisibility" value={value.locationVisibility} />

      {shouldSearch && suggestions.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#0055FF]"
            >
              {suggestion.description}
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
