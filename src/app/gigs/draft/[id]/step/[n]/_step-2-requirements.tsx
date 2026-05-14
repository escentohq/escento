"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { Gig } from "@/lib/api/types";
import { ActionState, emptyActionState, parseCsv } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

interface Step2FormProps {
  gigId: string;
  initialData: Gig;
  action: (state: ActionState, fd: FormData, gigId: string) => Promise<ActionState>;
}

export function Step2Form({ gigId, initialData, action }: Step2FormProps) {
  const [state, formAction] = useActionState(
    (state: ActionState, fd: FormData) => action(state, fd, gigId),
    emptyActionState
  );
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
      className="mx-auto max-w-2xl space-y-8 px-6 py-12"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Requirements</h1>
        <p className="mt-2 text-sm text-[#64748B]">Step 2 of 3</p>
      </div>

      <form action={formAction} className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="instrumentsCsv" className="block text-sm font-medium text-[#0F172A]">
            Instruments <span className="text-[#FF3366]">*</span>
          </label>
          <input
            id="instrumentsCsv"
            name="instrumentsCsv"
            type="text"
            defaultValue={instrumentsList}
            required
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Piano, Guitar, Violin (comma-separated)"
            aria-invalid={!!state.fieldErrors?.instruments}
          />
          {state.fieldErrors?.instruments && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.instruments}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="genresCsv" className="block text-sm font-medium text-[#0F172A]">
            Genres <span className="text-[#FF3366]">*</span>
          </label>
          <input
            id="genresCsv"
            name="genresCsv"
            type="text"
            defaultValue={genresList}
            required
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Classical, Jazz, Pop (comma-separated)"
            aria-invalid={!!state.fieldErrors?.genres}
          />
          {state.fieldErrors?.genres && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.genres}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-[#0F172A]">
            Experience Level <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={initialData.experienceLevel || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
          >
            <option value="">Select level...</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </select>
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="ensembleSize" className="block text-sm font-medium text-[#0F172A]">
            Ensemble Size <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="ensembleSize"
            name="ensembleSize"
            type="text"
            defaultValue={initialData.ensembleSize || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Solo, Duo, Small ensemble, Full band"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="equipmentRequirements"
            className="block text-sm font-medium text-[#0F172A]"
          >
            Equipment Requirements <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <textarea
            id="equipmentRequirements"
            name="equipmentRequirements"
            defaultValue={initialData.equipmentRequirements || ""}
            rows={3}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Must have own amp, PA system available, etc."
          />
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <Link
            href="/gigs/manage"
            className="flex items-center justify-center rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
