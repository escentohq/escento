"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { skipPortfolioAction } from "./actions";

interface PortfolioFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile;
}

export function PortfolioForm({ action, initialData }: PortfolioFormProps) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const prefersReducedMotion = useReducedMotion();
  const [profileImageError, setProfileImageError] = useState<string>("");
  const [resumePdfError, setResumePdfError] = useState<string>("");

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  function validateProfileImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setProfileImageError("Please upload an image file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError("Image must be under 5MB");
      return false;
    }
    setProfileImageError("");
    return true;
  }

  function validateResumePdf(file: File) {
    if (file.type !== "application/pdf") {
      setResumePdfError("Please upload a PDF file");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumePdfError("PDF must be under 10MB");
      return false;
    }
    setResumePdfError("");
    return true;
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your portfolio</h1>
        <p className="mt-2 text-sm text-[#64748B]">Showcase your work and experience</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="videoPortfolioUrl" className="block text-sm font-medium text-[#0F172A]">
            Video Portfolio URL <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="videoPortfolioUrl"
            name="videoPortfolioUrl"
            type="url"
            defaultValue={initialData.videoPortfolioUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            aria-invalid={!!state.fieldErrors?.videoPortfolioUrl}
          />
          {state.fieldErrors?.videoPortfolioUrl && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.videoPortfolioUrl}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="profileImage" className="block text-sm font-medium text-[#0F172A]">
            Profile Photo <span className="text-[#94A3B8]">(optional, max 5MB)</span>
          </label>
          <input
            id="profileImage"
            name="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) validateProfileImage(file);
            }}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] file:rounded-lg file:border-0 file:bg-[#0055FF] file:px-3 file:py-1 file:text-sm file:font-medium file:text-white focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            aria-invalid={!!profileImageError}
          />
          {profileImageError && (
            <p className="text-sm font-medium text-[#DC2626]">{profileImageError}</p>
          )}
          {state.fieldErrors?.profileImage && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.profileImage}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="resumePdf" className="block text-sm font-medium text-[#0F172A]">
            Resume (PDF) <span className="text-[#94A3B8]">(optional, max 10MB)</span>
          </label>
          <input
            id="resumePdf"
            name="resumePdf"
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) validateResumePdf(file);
            }}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] file:rounded-lg file:border-0 file:bg-[#0055FF] file:px-3 file:py-1 file:text-sm file:font-medium file:text-white focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            aria-invalid={!!resumePdfError}
          />
          {resumePdfError && (
            <p className="text-sm font-medium text-[#DC2626]">{resumePdfError}</p>
          )}
          {state.fieldErrors?.resumePdf && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.resumePdf}</p>
          )}
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Uploading...">
            Next
          </FormSubmitButton>
          <form action={skipPortfolioAction}>
            <button
              type="submit"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
            >
              Skip
            </button>
          </form>
        </div>

        <Link
          href="/onboarding/musician/sound"
          className="block text-center text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          ← Back
        </Link>
      </form>
    </motion.div>
  );
}
