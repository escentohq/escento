"use client";

import { useActionState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { savePreferencesSection } from "./actions";

interface PreferencesSectionProps {
  profile: MusicianProfile;
}

export function PreferencesSection({ profile }: PreferencesSectionProps) {
  const [state, formAction] = useActionState(savePreferencesSection, emptyActionState);
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
        <h2 className="text-2xl font-bold text-[#0F172A]">Preferences</h2>
        <p className="mt-1 text-sm text-[#64748B]">Control how you appear to event creators</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-4 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-4">
          <legend className="text-sm font-medium text-[#0F172A]">Visibility & Communication</legend>

          <label className="flex items-start gap-3">
            <input
              name="isSearchable"
              type="checkbox"
              defaultChecked={profile.isSearchable !== false}
              className="mt-1 h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0F172A]">Make my profile searchable</p>
              <p className="text-xs text-[#64748B]">
                Allow event creators to find and book you
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <input
              name="allowEventInvitations"
              type="checkbox"
              defaultChecked={profile.allowEventInvitations !== false}
              className="mt-1 h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0F172A]">Receive event invitations</p>
              <p className="text-xs text-[#64748B]">
                Let event creators send you direct invitations
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <input
              name="newsletterOptIn"
              type="checkbox"
              defaultChecked={profile.newsletterOptIn || false}
              className="mt-1 h-5 w-5 rounded border-[#E2E8F0] text-[#0055FF]"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0F172A]">Subscribe to newsletter</p>
              <p className="text-xs text-[#64748B]">
                Get updates about opportunities and platform news
              </p>
            </div>
          </label>
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
