"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

interface BasicsFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile | null;
  userId: string;
}

export function BasicsForm({ action, initialData }: BasicsFormProps) {
  const [state, formAction] = useActionState(action, emptyActionState);
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
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Let's start with the basics</h1>
        <p className="mt-2 text-sm text-[#64748B]">Tell us about yourself</p>
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
            defaultValue={initialData?.displayName || ""}
            required
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
            defaultValue={initialData?.contactEmail || ""}
            required
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
            Bio <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initialData?.bio || ""}
            maxLength={1200}
            rows={4}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="Tell us about your musical experience and style..."
            aria-invalid={!!state.fieldErrors?.bio}
          />
          {state.fieldErrors?.bio && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.bio}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="school" className="block text-sm font-medium text-[#0F172A]">
            School or Institution <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="school"
            name="school"
            type="text"
            defaultValue={initialData?.school || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., Juilliard, Berkeley"
            aria-invalid={!!state.fieldErrors?.school}
          />
          {state.fieldErrors?.school && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.school}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-[#0F172A]">
            Location <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={initialData?.location || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="City, State or Country"
            aria-invalid={!!state.fieldErrors?.location}
          />
          {state.fieldErrors?.location && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.location}</p>
          )}
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <Link
            href="/onboarding/musician"
            className="flex items-center justify-center rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
          >
            ← Back
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
