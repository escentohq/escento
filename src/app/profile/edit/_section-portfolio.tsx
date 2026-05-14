"use client";

import { useActionState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { savePortfolioSection } from "./actions";

interface PortfolioSectionProps {
  profile: MusicianProfile;
}

export function PortfolioSection({ profile }: PortfolioSectionProps) {
  const [state, formAction] = useActionState(savePortfolioSection, emptyActionState);
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
        <h2 className="text-2xl font-bold text-[#0F172A]">Portfolio</h2>
        <p className="mt-1 text-sm text-[#64748B]">Showcase your work and experience</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        {profile.profileImageUrl && (
          <fieldset className="space-y-2">
            <label className="block text-sm font-medium text-[#0F172A]">Profile Photo</label>
            <div className="flex items-center gap-4">
              <img
                src={profile.profileImageUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
              <span className="text-sm text-[#64748B]">Current photo</span>
            </div>
          </fieldset>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="videoPortfolioUrl" className="block text-sm font-medium text-[#0F172A]">
            Video Portfolio URL
          </label>
          <input
            id="videoPortfolioUrl"
            name="videoPortfolioUrl"
            type="url"
            defaultValue={profile.videoPortfolioUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://youtube.com/..."
            aria-invalid={!!state.fieldErrors?.videoPortfolioUrl}
          />
          {state.fieldErrors?.videoPortfolioUrl && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.videoPortfolioUrl}
            </p>
          )}
        </fieldset>

        {profile.resumePdfUrl && (
          <fieldset className="space-y-2">
            <label className="block text-sm font-medium text-[#0F172A]">Resume (PDF)</label>
            <a
              href={profile.resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-[#0055FF] px-4 py-2 text-sm font-medium text-[#0055FF] hover:bg-[#EFF6FF]"
            >
              Download Resume
            </a>
          </fieldset>
        )}

        <div className="flex gap-3 border-t border-[#E2E8F0] pt-6">
          <FormSubmitButton className="rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC]" pendingLabel="Saving...">
            Save Changes
          </FormSubmitButton>
        </div>
      </form>
    </motion.div>
  );
}
