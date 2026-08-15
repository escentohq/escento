"use client";

import Link from "next/link";

import { FormSubmitButton } from "@/components/ui/form-submit-button";

/**
 * Back / Skip / submit row shared by the skippable wizard steps. Back and Skip
 * are plain links: neither writes, so a step abandoned here leaves whatever the
 * earlier steps already saved.
 */
export function WizardStepFooter({
  backHref,
  skipHref,
  submitLabel = "Save and continue",
  pendingLabel = "Saving…",
}: {
  backHref: string;
  skipHref: string;
  submitLabel?: string;
  pendingLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <Link
          href={backHref}
          className="text-sm font-bold text-muted transition-colors duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          Back
        </Link>
        <Link
          href={skipHref}
          className="text-sm font-bold text-muted transition-colors duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          Skip for now
        </Link>
      </div>
      <FormSubmitButton pendingLabel={pendingLabel} className="w-full sm:w-auto">
        {submitLabel}
      </FormSubmitButton>
    </div>
  );
}
