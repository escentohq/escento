"use client";

import { useActionState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { saveBasicsSection } from "./actions";

interface BasicsSectionProps {
  profile: MusicianProfile;
}

export function BasicsSection({ profile }: BasicsSectionProps) {
  const [state, formAction] = useActionState(saveBasicsSection, emptyActionState);
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
        <h2 className="text-2xl font-bold text-[#0F172A]">Basic Information</h2>
        <p className="mt-1 text-sm text-[#64748B]">Update your personal details</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-medium text-[#0F172A]">
            Full Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={profile.displayName || ""}
            maxLength={80}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="Your full name"
            aria-invalid={!!state.fieldErrors?.displayName}
          />
          {state.fieldErrors?.displayName && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.displayName}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-[#0F172A]">
            Email Address
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={profile.contactEmail || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="your@email.com"
            aria-invalid={!!state.fieldErrors?.contactEmail}
          />
          {state.fieldErrors?.contactEmail && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.contactEmail}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-[#0F172A]">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio || ""}
            maxLength={1200}
            rows={4}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="Tell people about yourself..."
            aria-invalid={!!state.fieldErrors?.bio}
          />
          {state.fieldErrors?.bio && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.bio}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="school" className="block text-sm font-medium text-[#0F172A]">
            School or Institution
          </label>
          <input
            id="school"
            name="school"
            type="text"
            defaultValue={profile.school || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Juilliard"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-[#0F172A]">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={profile.location || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="City, State"
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
