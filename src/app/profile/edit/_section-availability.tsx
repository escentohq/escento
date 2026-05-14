"use client";

import { useActionState, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { saveAvailabilitySection } from "./actions";

interface AvailabilitySectionProps {
  profile: MusicianProfile;
}

export function AvailabilitySection({ profile }: AvailabilitySectionProps) {
  const [state, formAction] = useActionState(saveAvailabilitySection, emptyActionState);
  const [willingToTravel, setWillingToTravel] = useState(profile.willingToTravel || false);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Availability</h2>
        <p className="mt-1 text-sm text-[#64748B]">When and where you're available</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#0F172A]">Travel</legend>
          <label className="flex items-center gap-3">
            <input
              name="willingToTravel"
              type="checkbox"
              checked={willingToTravel}
              onChange={(e) => setWillingToTravel(e.target.checked)}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Willing to travel for gigs</span>
          </label>
        </fieldset>

        {willingToTravel && (
          <fieldset className="space-y-2">
            <label htmlFor="travelRadiusMiles" className="block text-sm font-medium text-[#0F172A]">
              Travel Radius (miles) *
            </label>
            <input
              id="travelRadiusMiles"
              name="travelRadiusMiles"
              type="number"
              min="0"
              defaultValue={profile.travelRadiusMiles || ""}
              required={willingToTravel}
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
              placeholder="e.g., 50"
              aria-invalid={!!state.fieldErrors?.travelRadiusMiles}
            />
            {state.fieldErrors?.travelRadiusMiles && (
              <p className="text-sm font-medium text-[#DC2626]">
                {state.fieldErrors.travelRadiusMiles}
              </p>
            )}
          </fieldset>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="tourStartDate" className="block text-sm font-medium text-[#0F172A]">
            Tour Start Date
          </label>
          <input
            id="tourStartDate"
            name="tourStartDate"
            type="date"
            defaultValue={profile.tourStartDate || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="tourEndDate" className="block text-sm font-medium text-[#0F172A]">
            Tour End Date
          </label>
          <input
            id="tourEndDate"
            name="tourEndDate"
            type="date"
            defaultValue={profile.tourEndDate || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="minNoticeDays" className="block text-sm font-medium text-[#0F172A]">
            Minimum Notice Required (days)
          </label>
          <input
            id="minNoticeDays"
            name="minNoticeDays"
            type="number"
            min="0"
            defaultValue={profile.minNoticeDays || "14"}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="14"
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
