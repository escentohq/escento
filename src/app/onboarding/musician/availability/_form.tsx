"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { skipAvailabilityAction } from "./actions";

interface AvailabilityFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile;
}

export function AvailabilityForm({ action, initialData }: AvailabilityFormProps) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const prefersReducedMotion = useReducedMotion();
  const [willingToTravel, setWillingToTravel] = useState(initialData.willingToTravel || false);

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your availability</h1>
        <p className="mt-2 text-sm text-[#64748B]">Tell people when you're available</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#0F172A]">Willing to travel?</legend>
          <label className="flex items-center gap-3">
            <input
              name="willingToTravel"
              type="checkbox"
              checked={willingToTravel}
              onChange={(e) => setWillingToTravel(e.target.checked)}
              className="h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF] focus:ring-[#0055FF]"
            />
            <span className="text-sm text-[#0F172A]">Yes, I'm willing to travel for gigs</span>
          </label>
        </fieldset>

        {willingToTravel && (
          <fieldset className="space-y-2">
            <label htmlFor="travelRadiusMiles" className="block text-sm font-medium text-[#0F172A]">
              Travel Radius <span className="text-[#94A3B8]">(miles)</span>
            </label>
            <input
              id="travelRadiusMiles"
              name="travelRadiusMiles"
              type="number"
              min="0"
              defaultValue={initialData.travelRadiusMiles || ""}
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
            Tour Start Date <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="tourStartDate"
            name="tourStartDate"
            type="date"
            defaultValue={initialData.tourStartDate || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            aria-invalid={!!state.fieldErrors?.tourStartDate}
          />
          {state.fieldErrors?.tourStartDate && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.tourStartDate}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="tourEndDate" className="block text-sm font-medium text-[#0F172A]">
            Tour End Date <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="tourEndDate"
            name="tourEndDate"
            type="date"
            defaultValue={initialData.tourEndDate || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            aria-invalid={!!state.fieldErrors?.tourEndDate}
          />
          {state.fieldErrors?.tourEndDate && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.tourEndDate}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="minNoticeDays" className="block text-sm font-medium text-[#0F172A]">
            Minimum Notice Required <span className="text-[#94A3B8]">(days, optional)</span>
          </label>
          <input
            id="minNoticeDays"
            name="minNoticeDays"
            type="number"
            min="0"
            defaultValue={initialData.minNoticeDays || "14"}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="14"
            aria-invalid={!!state.fieldErrors?.minNoticeDays}
          />
          {state.fieldErrors?.minNoticeDays && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.minNoticeDays}
            </p>
          )}
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <form action={skipAvailabilityAction}>
            <button
              type="submit"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
            >
              Skip
            </button>
          </form>
        </div>

        <Link
          href="/onboarding/musician/rates"
          className="block text-center text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          ← Back
        </Link>
      </form>
    </motion.div>
  );
}
