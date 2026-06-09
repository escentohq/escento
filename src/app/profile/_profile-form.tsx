"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LocationAutocompleteField,
  type LocationAutocompleteValue,
} from "@/components/location/location-autocomplete-field";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { boolValue, stringValue } from "@/lib/form-snapshots";
import { countFieldErrors, type ActionState } from "@/lib/form-utils";
import { emptyActionState } from "@/lib/form-utils";

export type ProfileFormValues = {
  displayName: string;
  bio: string;
  school: string;
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
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: string;
  availabilityText: string;
  instagramUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  websiteUrl: string;
  instrumentsCsv: string;
  genresCsv: string;
};

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

function buildValues(initial: Partial<ProfileFormValues>): ProfileFormValues {
  return {
    displayName: initial.displayName ?? "",
    bio: initial.bio ?? "",
    school: initial.school ?? "",
    location: initial.location ?? "",
    locationDisplayName: initial.locationDisplayName ?? initial.location ?? "",
    locationPlaceId: initial.locationPlaceId ?? "",
    locationLat: initial.locationLat ?? "",
    locationLng: initial.locationLng ?? "",
    locationCity: initial.locationCity ?? "",
    locationState: initial.locationState ?? "",
    locationCountry: initial.locationCountry ?? "",
    locationProvider: initial.locationProvider ?? "",
    providerPlaceId: initial.providerPlaceId ?? initial.locationPlaceId ?? "",
    locationVisibility: initial.locationVisibility ?? "public_region",
    isRemote: initial.isRemote ?? true,
    seekingPaid: initial.seekingPaid ?? true,
    seekingUnpaid: initial.seekingUnpaid ?? true,
    yearsExperience: initial.yearsExperience ?? "",
    availabilityText: initial.availabilityText ?? "",
    instagramUrl: initial.instagramUrl ?? "",
    youtubeUrl: initial.youtubeUrl ?? "",
    spotifyUrl: initial.spotifyUrl ?? "",
    soundcloudUrl: initial.soundcloudUrl ?? "",
    websiteUrl: initial.websiteUrl ?? "",
    instrumentsCsv: initial.instrumentsCsv ?? "",
    genresCsv: initial.genresCsv ?? "",
  };
}

function CheckboxField({
  id,
  name,
  label,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A]"
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#0055FF]"
      />
      {label}
    </label>
  );
}

export function ProfileForm({
  mode,
  initial,
  action,
}: {
  mode: "create" | "edit";
  initial: Partial<ProfileFormValues>;
  action: Action;
}) {
  const [values, setValues] = useState(() => buildValues(initial));
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(action, emptyActionState);

  const title = mode === "create" ? "Create Profile" : "Save Profile";
  const pending = mode === "create" ? "Creating…" : "Saving…";
  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

  useEffect(() => {
    if (state.values) {
      setValues((current) => ({
        ...current,
        displayName: stringValue(state.values, "displayName", current.displayName),
        bio: stringValue(state.values, "bio", current.bio),
        school: stringValue(state.values, "school", current.school),
        location: stringValue(state.values, "location", current.location),
        locationDisplayName: stringValue(state.values, "locationDisplayName", current.locationDisplayName),
        locationPlaceId: stringValue(state.values, "locationPlaceId", current.locationPlaceId),
        locationLat: stringValue(state.values, "locationLat", current.locationLat),
        locationLng: stringValue(state.values, "locationLng", current.locationLng),
        locationCity: stringValue(state.values, "locationCity", current.locationCity),
        locationState: stringValue(state.values, "locationState", current.locationState),
        locationCountry: stringValue(state.values, "locationCountry", current.locationCountry),
        locationProvider: stringValue(state.values, "locationProvider", current.locationProvider),
        providerPlaceId: stringValue(state.values, "providerPlaceId", current.providerPlaceId),
        locationVisibility: stringValue(state.values, "locationVisibility", current.locationVisibility) === "private" ? "private" : "public_region",
        isRemote: boolValue(state.values, "isRemote", current.isRemote),
        seekingPaid: boolValue(state.values, "seekingPaid", current.seekingPaid),
        seekingUnpaid: boolValue(state.values, "seekingUnpaid", current.seekingUnpaid),
        yearsExperience: stringValue(state.values, "yearsExperience", current.yearsExperience),
        availabilityText: stringValue(state.values, "availabilityText", current.availabilityText),
        instagramUrl: stringValue(state.values, "instagramUrl", current.instagramUrl),
        youtubeUrl: stringValue(state.values, "youtubeUrl", current.youtubeUrl),
        spotifyUrl: stringValue(state.values, "spotifyUrl", current.spotifyUrl),
        soundcloudUrl: stringValue(state.values, "soundcloudUrl", current.soundcloudUrl),
        websiteUrl: stringValue(state.values, "websiteUrl", current.websiteUrl),
        instrumentsCsv: stringValue(state.values, "instrumentsCsv", current.instrumentsCsv),
        genresCsv: stringValue(state.values, "genresCsv", current.genresCsv),
      }));
    }
  }, [state.values]);

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm md:p-8">
      {state.message && fieldErrorCount >= 2 ? (
        <div className="mb-6">
          <FormErrorBanner
            message={state.message}
            fieldErrorCount={fieldErrorCount}
            onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
          />
        </div>
      ) : null}

      <form
        action={formAction}
        noValidate
        className="space-y-10"
        onSubmit={() => formFields.setSubmitAttempted(true)}
      >
        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Spotlight
          </legend>

          <FormField
            id="displayName"
            label="Display name"
            required
            error={errors.displayName}
            showError={formFields.shouldShowError("displayName", errors.displayName)}
            onBlur={() => formFields.markTouched("displayName")}
          >
            <Input
              name="displayName"
              value={values.displayName}
              onChange={(event) => setValues((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="Maya Singh"
            />
          </FormField>

          <FormField
            id="bio"
            label="Bio"
            error={errors.bio}
            showError={formFields.shouldShowError("bio", errors.bio)}
            onBlur={() => formFields.markTouched("bio")}
          >
            <Textarea
              name="bio"
              value={values.bio}
              onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
              className="min-h-36"
              placeholder="What do you play, what projects do you like, and what should creators know before they reach out?"
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="school"
              label="School"
              error={errors.school}
              showError={formFields.shouldShowError("school", errors.school)}
              onBlur={() => formFields.markTouched("school")}
            >
              <Input
                name="school"
                value={values.school}
                onChange={(event) => setValues((current) => ({ ...current, school: event.target.value }))}
                placeholder="UT Austin"
              />
            </FormField>
            <FormField
              id="locationDisplayName"
              label="Location"
              error={errors.locationDisplayName}
              showError={formFields.shouldShowError("locationDisplayName", errors.locationDisplayName)}
              onBlur={() => formFields.markTouched("locationDisplayName")}
              hint="Choose a city or region from the suggestions. Select Remote-friendly below if location does not matter."
            >
              <LocationAutocompleteField
                value={values as LocationAutocompleteValue}
                onChange={(next) => setValues((current) => ({ ...current, ...next }))}
                invalid={formFields.shouldShowError("locationDisplayName", errors.locationDisplayName) && Boolean(errors.locationDisplayName)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
            Soundcheck
          </legend>

          <div className="grid gap-4 md:grid-cols-3">
            <CheckboxField
              id="isRemote"
              name="isRemote"
              label="Remote-friendly"
              checked={values.isRemote}
              onChange={(checked) => setValues((current) => ({ ...current, isRemote: checked }))}
            />
            <CheckboxField
              id="seekingPaid"
              name="seekingPaid"
              label="Open to paid"
              checked={values.seekingPaid}
              onChange={(checked) => setValues((current) => ({ ...current, seekingPaid: checked }))}
            />
            <CheckboxField
              id="seekingUnpaid"
              name="seekingUnpaid"
              label="Open to unpaid"
              checked={values.seekingUnpaid}
              onChange={(checked) => setValues((current) => ({ ...current, seekingUnpaid: checked }))}
            />
          </div>
          {errors.seekingPaid ? (
            <p
              role={formFields.shouldShowError("seekingPaid", errors.seekingPaid) ? "alert" : undefined}
              className={`text-sm font-medium text-[#B42318] ${formFields.shouldShowError("seekingPaid", errors.seekingPaid) ? "" : "sr-only"}`}
            >
              {errors.seekingPaid}
            </p>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="yearsExperience"
              label="Years of experience"
              error={errors.yearsExperience}
              showError={formFields.shouldShowError("yearsExperience", errors.yearsExperience)}
              onBlur={() => formFields.markTouched("yearsExperience")}
            >
              <Input
                name="yearsExperience"
                value={values.yearsExperience}
                onChange={(event) => setValues((current) => ({ ...current, yearsExperience: event.target.value }))}
                inputMode="numeric"
                placeholder="3"
              />
            </FormField>
            <FormField
              id="availabilityText"
              label="Availability"
              error={errors.availabilityText}
              showError={formFields.shouldShowError("availabilityText", errors.availabilityText)}
              onBlur={() => formFields.markTouched("availabilityText")}
            >
              <Input
                name="availabilityText"
                value={values.availabilityText}
                onChange={(event) => setValues((current) => ({ ...current, availabilityText: event.target.value }))}
                placeholder="Weekends, evenings, 2 weeks notice"
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
            Plays
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="instrumentsCsv"
              label="Instruments"
              error={errors.instrumentsCsv}
              showError={formFields.shouldShowError("instrumentsCsv", errors.instrumentsCsv)}
              onBlur={() => formFields.markTouched("instrumentsCsv")}
            >
              <Input
                name="instrumentsCsv"
                value={values.instrumentsCsv}
                onChange={(event) => setValues((current) => ({ ...current, instrumentsCsv: event.target.value }))}
                placeholder="Guitar, Vocals, Piano"
              />
            </FormField>
            <FormField
              id="genresCsv"
              label="Genres"
              error={errors.genresCsv}
              showError={formFields.shouldShowError("genresCsv", errors.genresCsv)}
              onBlur={() => formFields.markTouched("genresCsv")}
            >
              <Input
                name="genresCsv"
                value={values.genresCsv}
                onChange={(event) => setValues((current) => ({ ...current, genresCsv: event.target.value }))}
                placeholder="Indie, Jazz, Film scoring"
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Links
          </legend>

          <div className="grid gap-5 md:grid-cols-2">
              {(
                [
                  ["youtubeUrl", "YouTube"],
                  ["soundcloudUrl", "SoundCloud"],
                  ["spotifyUrl", "Spotify"],
                  ["websiteUrl", "Website"],
                ] as const
              ).map(([key, label]) => (
                <FormField
                  key={key}
                  id={key}
                  label={label}
                  error={errors[key]}
                  showError={formFields.shouldShowError(key, errors[key])}
                  onBlur={() => formFields.markTouched(key)}
                >
                  <Input
                    name={key}
                    value={values[key]}
                    onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={`https://${label.toLowerCase()}.com/...`}
                  />
                </FormField>
              ))}
              <div className="md:col-span-2">
                <FormField
                  id="instagramUrl"
                  label="Instagram"
                  error={errors.instagramUrl}
                  showError={formFields.shouldShowError("instagramUrl", errors.instagramUrl)}
                  onBlur={() => formFields.markTouched("instagramUrl")}
                >
                  <Input
                    name="instagramUrl"
                    value={values.instagramUrl}
                    onChange={(event) => setValues((current) => ({ ...current, instagramUrl: event.target.value }))}
                    placeholder="https://instagram.com/..."
                  />
                </FormField>
              </div>
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-4 border-t border-[#F1F5F9] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF]">
            Cancel
          </Link>
          <FormSubmitButton pendingLabel={pending} className="w-full sm:w-auto">
            {title}
          </FormSubmitButton>
        </div>
      </form>
    </div>
  );
}
