"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/components/ui/form-submit-button";
import type { ActionState } from "@/lib/form-utils";
import { emptyActionState } from "@/lib/form-utils";

type ProfileFormState = {
  displayName: string;
  bio: string;
  school: string;
  location: string;
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: string;
  availabilityText: string;
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  websiteUrl: string;
  instrumentsCsv: string;
  genresCsv: string;
};

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#0F172A]">
        {label} {required ? <span className="text-[#FF3366]">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-[#FF3366]">{error}</p> : null}
    </div>
  );
}

function CheckboxField({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A]"
    >
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#0055FF]" />
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
  initial: Partial<ProfileFormState>;
  action: Action;
}) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const title = mode === "create" ? "Create Profile" : "Save Profile";
  const pending = mode === "create" ? "Creating..." : "Saving...";
  const errors = state.fieldErrors ?? {};

  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm md:p-8">
      {state.message ? (
        <div className="mb-6 rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-10">
        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Spotlight
          </legend>

          <Field id="displayName" label="Display name" required error={errors.displayName}>
            <input id="displayName" name="displayName" defaultValue={initial.displayName ?? ""} className="input-base" placeholder="Maya Singh" required />
          </Field>

          <Field id="bio" label="Bio" error={errors.bio}>
            <textarea
              id="bio"
              name="bio"
              defaultValue={initial.bio ?? ""}
              className="input-base min-h-36"
              placeholder="What do you play, what projects do you like, and what should creators know before they email?"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field id="school" label="School" error={errors.school}>
              <input id="school" name="school" defaultValue={initial.school ?? ""} className="input-base" placeholder="UT Austin" />
            </Field>
            <Field id="location" label="Location" error={errors.location}>
              <input id="location" name="location" defaultValue={initial.location ?? ""} className="input-base" placeholder="Austin, TX" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
            Soundcheck
          </legend>

          <div className="grid gap-4 md:grid-cols-3">
            <CheckboxField id="isRemote" name="isRemote" label="Remote-friendly" defaultChecked={initial.isRemote ?? true} />
            <CheckboxField id="seekingPaid" name="seekingPaid" label="Open to paid" defaultChecked={initial.seekingPaid ?? true} />
            <CheckboxField id="seekingUnpaid" name="seekingUnpaid" label="Open to unpaid" defaultChecked={initial.seekingUnpaid ?? true} />
          </div>
          {errors.seekingPaid ? (
            <p className="text-sm font-medium text-[#FF3366]">{errors.seekingPaid}</p>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Field id="yearsExperience" label="Years of experience" error={errors.yearsExperience}>
              <input id="yearsExperience" name="yearsExperience" defaultValue={initial.yearsExperience ?? ""} className="input-base" inputMode="numeric" placeholder="3" />
            </Field>
            <Field id="availabilityText" label="Availability" error={errors.availabilityText}>
              <input id="availabilityText" name="availabilityText" defaultValue={initial.availabilityText ?? ""} className="input-base" placeholder="Weekends, evenings, 2 weeks notice" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
            Plays
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="instrumentsCsv" label="Instruments" required error={errors.instrumentsCsv}>
              <input id="instrumentsCsv" name="instrumentsCsv" defaultValue={initial.instrumentsCsv ?? ""} className="input-base" placeholder="Guitar, Vocals, Piano" required />
            </Field>
            <Field id="genresCsv" label="Genres" required error={errors.genresCsv}>
              <input id="genresCsv" name="genresCsv" defaultValue={initial.genresCsv ?? ""} className="input-base" placeholder="Indie, Jazz, Film scoring" required />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Links
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="youtubeUrl" label="YouTube" error={errors.youtubeUrl}>
              <input id="youtubeUrl" name="youtubeUrl" defaultValue={initial.youtubeUrl ?? ""} className="input-base" placeholder="https://youtube.com/..." />
            </Field>
            <Field id="soundcloudUrl" label="SoundCloud" error={errors.soundcloudUrl}>
              <input id="soundcloudUrl" name="soundcloudUrl" defaultValue={initial.soundcloudUrl ?? ""} className="input-base" placeholder="https://soundcloud.com/..." />
            </Field>
            <Field id="spotifyUrl" label="Spotify" error={errors.spotifyUrl}>
              <input id="spotifyUrl" name="spotifyUrl" defaultValue={initial.spotifyUrl ?? ""} className="input-base" placeholder="https://open.spotify.com/..." />
            </Field>
            <Field id="websiteUrl" label="Website" error={errors.websiteUrl}>
              <input id="websiteUrl" name="websiteUrl" defaultValue={initial.websiteUrl ?? ""} className="input-base" placeholder="https://..." />
            </Field>
            <div className="md:col-span-2">
              <Field id="instagramUrl" label="Instagram" error={errors.instagramUrl}>
                <input id="instagramUrl" name="instagramUrl" defaultValue={initial.instagramUrl ?? ""} className="input-base" placeholder="https://instagram.com/..." />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Contact
          </legend>
          <Field id="contactEmail" label="Contact email" required error={errors.contactEmail}>
            <input id="contactEmail" type="email" name="contactEmail" defaultValue={initial.contactEmail ?? ""} className="input-base" placeholder="maya@school.edu" required />
          </Field>
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
