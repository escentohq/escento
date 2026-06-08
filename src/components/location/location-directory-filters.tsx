"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  LocationAutocompleteField,
  type LocationAutocompleteValue,
} from "@/components/location/location-autocomplete-field";
import type { RemoteFilter } from "@/lib/location";

type Option = {
  name: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  action: string;
  clearHref: string;
  keyword?: string;
  locationDisplayName?: string;
  locationLat?: string;
  locationLng?: string;
  radius?: string;
  remote?: RemoteFilter;
  projectType?: string;
  projectTypeOptions?: readonly SelectOption[];
  instrument?: string;
  instruments: Option[];
  genre?: string;
  genres: Option[];
  hasFilters: boolean;
};

export function LocationDirectoryFilters({
  action,
  clearHref,
  keyword = "",
  locationDisplayName = "",
  locationLat = "",
  locationLng = "",
  radius = "",
  remote = "include",
  projectType = "",
  projectTypeOptions,
  instrument = "",
  instruments,
  genre = "",
  genres,
  hasFilters,
}: Props) {
  const hasAdvancedFilters = Boolean(
    projectType ||
      instrument ||
      genre ||
      locationDisplayName ||
      radius ||
      remote !== "include",
  );
  const [advancedOpen, setAdvancedOpen] = useState(hasAdvancedFilters);
  const [location, setLocation] = useState<LocationAutocompleteValue>({
    location: locationDisplayName,
    locationDisplayName,
    locationPlaceId: "",
    locationLat,
    locationLng,
    locationCity: "",
    locationState: "",
    locationCountry: "",
    locationProvider: "",
    providerPlaceId: "",
    locationVisibility: "public_region",
  });

  return (
    <form method="GET" className="space-y-5" action={action}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label htmlFor="q" className="min-w-0 flex-1 text-sm font-bold text-[#0F172A]">
          Search
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" aria-hidden />
            <Input
              id="q"
              name="q"
              defaultValue={keyword}
              placeholder="Search by name, keyword, city, school, or gig detail"
              className="pl-11"
            />
          </div>
        </label>

        <button
          type="submit"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-[#0F172A] px-7 text-sm font-bold tracking-wide text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_-8px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 lg:min-h-11"
        >
          Search
        </button>

        <button
          type="button"
          aria-expanded={advancedOpen}
          aria-controls="directory-advanced-search"
          onClick={() => setAdvancedOpen((open) => !open)}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-5 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0055FF] hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 lg:min-h-11"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Advanced search
        </button>

        {hasFilters ? (
          <Link
            href={clearHref}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center px-2 text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF] lg:justify-start"
          >
            Clear
          </Link>
        ) : null}
      </div>

      {advancedOpen ? (
        <div
          id="directory-advanced-search"
          className="grid gap-4 border-t border-[#F1F5F9] pt-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {projectTypeOptions ? (
            <label htmlFor="projectType" className="text-sm font-bold text-[#0F172A]">
              Project type
              <Select id="projectType" name="projectType" defaultValue={projectType}>
                <option value="">All types</option>
                {projectTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </label>
          ) : null}

          <label htmlFor="instrument" className="text-sm font-bold text-[#0F172A]">
            Instrument
            <Select id="instrument" name="instrument" defaultValue={instrument}>
              <option value="">All instruments</option>
              {instruments.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </Select>
          </label>

          <label htmlFor="genre" className="text-sm font-bold text-[#0F172A]">
            Genre
            <Select id="genre" name="genre" defaultValue={genre}>
              <option value="">All genres</option>
              {genres.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </Select>
          </label>

          <label htmlFor="directoryLocation" className="text-sm font-bold text-[#0F172A]">
            Location
            <LocationAutocompleteField
              id="directoryLocation"
              value={location}
              onChange={setLocation}
              placeholder="Austin, TX"
            />
            <input type="hidden" name="lat" value={location.locationLat} />
            <input type="hidden" name="lng" value={location.locationLng} />
          </label>

          <label htmlFor="radius" className="text-sm font-bold text-[#0F172A]">
            Radius
            <Select id="radius" name="radius" defaultValue={radius}>
              <option value="">Any distance</option>
              {[5, 10, 15, 20, 25, 50, 100].map((value) => (
                <option key={value} value={value}>{value} miles</option>
              ))}
            </Select>
          </label>

          <label htmlFor="remote" className="text-sm font-bold text-[#0F172A]">
            Remote
            <Select id="remote" name="remote" defaultValue={remote}>
              <option value="include">Include remote</option>
              <option value="remote">Remote only</option>
              <option value="in_person">In-person only</option>
            </Select>
          </label>
        </div>
      ) : null}
    </form>
  );
}
