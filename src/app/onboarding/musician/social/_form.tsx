"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { skipSocialAction } from "./actions";

interface SocialFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile;
}

export function SocialForm({ action, initialData }: SocialFormProps) {
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
        <h1 className="text-3xl font-bold text-[#0F172A]">Your social links</h1>
        <p className="mt-2 text-sm text-[#64748B]">Connect your social profiles</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="instagramUrl" className="block text-sm font-medium text-[#0F172A]">
            Instagram <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={initialData.instagramUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://instagram.com/your_handle"
            aria-invalid={!!state.fieldErrors?.instagramUrl}
          />
          {state.fieldErrors?.instagramUrl && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.instagramUrl}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-[#0F172A]">
            YouTube <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            defaultValue={initialData.youtubeUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://youtube.com/@your_channel"
            aria-invalid={!!state.fieldErrors?.youtubeUrl}
          />
          {state.fieldErrors?.youtubeUrl && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.youtubeUrl}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="spotifyUrl" className="block text-sm font-medium text-[#0F172A]">
            Spotify <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="spotifyUrl"
            name="spotifyUrl"
            type="url"
            defaultValue={initialData.spotifyUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://open.spotify.com/artist/..."
            aria-invalid={!!state.fieldErrors?.spotifyUrl}
          />
          {state.fieldErrors?.spotifyUrl && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.spotifyUrl}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="soundcloudUrl" className="block text-sm font-medium text-[#0F172A]">
            SoundCloud <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="soundcloudUrl"
            name="soundcloudUrl"
            type="url"
            defaultValue={initialData.soundcloudUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://soundcloud.com/your_handle"
            aria-invalid={!!state.fieldErrors?.soundcloudUrl}
          />
          {state.fieldErrors?.soundcloudUrl && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.soundcloudUrl}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-[#0F172A]">
            Website <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={initialData.websiteUrl || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="https://your-website.com"
            aria-invalid={!!state.fieldErrors?.websiteUrl}
          />
          {state.fieldErrors?.websiteUrl && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.websiteUrl}</p>
          )}
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <form action={skipSocialAction}>
            <button
              type="submit"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
            >
              Skip
            </button>
          </form>
        </div>

        <Link
          href="/onboarding/musician/availability"
          className="block text-center text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          ← Back
        </Link>
      </form>
    </motion.div>
  );
}
