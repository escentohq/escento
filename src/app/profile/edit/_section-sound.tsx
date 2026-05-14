"use client";

import { useActionState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { saveSoundSection } from "./actions";

interface SoundSectionProps {
  profile: MusicianProfile;
}

export function SoundSection({ profile }: SoundSectionProps) {
  const [state, formAction] = useActionState(saveSoundSection, emptyActionState);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  const instrumentsList = profile.instruments?.join(", ") || "";
  const genresList = profile.genres?.join(", ") || "";

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Sound & Skills</h2>
        <p className="mt-1 text-sm text-[#64748B]">Showcase your instruments and genres</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="instruments" className="block text-sm font-medium text-[#0F172A]">
            Instruments <span className="text-[#94A3B8]">(comma-separated)</span>
          </label>
          <input
            id="instruments"
            name="instruments"
            type="text"
            defaultValue={instrumentsList}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Piano, Guitar, Violin"
            aria-invalid={!!state.fieldErrors?.instruments}
          />
          {state.fieldErrors?.instruments && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.instruments}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="genres" className="block text-sm font-medium text-[#0F172A]">
            Genres <span className="text-[#94A3B8]">(comma-separated)</span>
          </label>
          <input
            id="genres"
            name="genres"
            type="text"
            defaultValue={genresList}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Classical, Jazz, Pop"
            aria-invalid={!!state.fieldErrors?.genres}
          />
          {state.fieldErrors?.genres && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.genres}</p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#0F172A]">What are you looking for?</legend>
          <label className="flex items-center gap-3">
            <input
              name="seekingPaid"
              type="checkbox"
              defaultChecked={profile.seekingPaid}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Paid gigs</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              name="seekingUnpaid"
              type="checkbox"
              defaultChecked={profile.seekingUnpaid}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Unpaid/volunteer opportunities</span>
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="yearsExperience" className="block text-sm font-medium text-[#0F172A]">
            Years of Experience
          </label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min="0"
            defaultValue={profile.yearsExperience || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., 5"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              name="isRemote"
              type="checkbox"
              defaultChecked={profile.isRemote}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Available for remote collaborations</span>
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="availabilityText" className="block text-sm font-medium text-[#0F172A]">
            Availability
          </label>
          <textarea
            id="availabilityText"
            name="availabilityText"
            defaultValue={profile.availabilityText || ""}
            rows={3}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Weekdays after 5pm"
          />
        </fieldset>

        <div className="flex gap-3 border-t border-[#E2E8F0] pt-6">
          <FormSubmitButton className="rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC]" pendingLabel="Saving...">
            Save Changes
          </FormSubmitButton>
        </div>
      </form>
    </motion.div>
  );
}
