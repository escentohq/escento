"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { skipSoundAction } from "./actions";

interface SoundFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile;
}

export function SoundForm({ action, initialData }: SoundFormProps) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  const instrumentsList = initialData.instruments?.join(", ") || "";
  const genresList = initialData.genres?.join(", ") || "";

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your sound & skills</h1>
        <p className="mt-2 text-sm text-[#64748B]">Tell us about your musical expertise</p>
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
            required
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
            required
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Classical, Jazz, Pop"
            aria-invalid={!!state.fieldErrors?.genres}
          />
          {state.fieldErrors?.genres && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.genres}</p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#0F172A]">What are you looking for? *</legend>
          <label className="flex items-center gap-3">
            <input
              name="seekingPaid"
              type="checkbox"
              defaultChecked={initialData.seekingPaid}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF] focus:ring-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Paid gigs</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              name="seekingUnpaid"
              type="checkbox"
              defaultChecked={initialData.seekingUnpaid}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF] focus:ring-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Unpaid/volunteer opportunities</span>
          </label>
          {state.fieldErrors?.["seeking"] && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors["seeking"]}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="yearsExperience" className="block text-sm font-medium text-[#0F172A]">
            Years of Experience <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min="0"
            defaultValue={initialData.yearsExperience || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., 5"
            aria-invalid={!!state.fieldErrors?.yearsExperience}
          />
          {state.fieldErrors?.yearsExperience && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.yearsExperience}</p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              name="isRemote"
              type="checkbox"
              defaultChecked={initialData.isRemote}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF] focus:ring-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Available for remote collaborations</span>
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="availabilityText" className="block text-sm font-medium text-[#0F172A]">
            Availability <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <textarea
            id="availabilityText"
            name="availabilityText"
            defaultValue={initialData.availabilityText || ""}
            rows={3}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Weekdays after 5pm, weekends anytime"
            aria-invalid={!!state.fieldErrors?.availabilityText}
          />
          {state.fieldErrors?.availabilityText && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.availabilityText}</p>
          )}
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <form action={skipSoundAction}>
            <button
              type="submit"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
            >
              Skip
            </button>
          </form>
        </div>

        <Link
          href="/onboarding/musician/basics"
          className="block text-center text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          ← Back
        </Link>
      </form>
    </motion.div>
  );
}
