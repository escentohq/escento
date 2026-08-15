"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { stringValue } from "@/lib/form-snapshots";
import { countFieldErrors, emptyActionState, type ActionState } from "@/lib/form-utils";

import { saveIdentityAction } from "./actions";

export function IdentityForm({ initial }: { initial: { displayName: string; bio: string } }) {
  const [values, setValues] = useState(initial);
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState<ActionState, FormData>(saveIdentityAction, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

  useEffect(() => {
    if (state.values) {
      setValues((current) => ({
        displayName: stringValue(state.values, "displayName", current.displayName),
        bio: stringValue(state.values, "bio", current.bio),
      }));
    }
  }, [state.values]);

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="border-y border-rule py-6 md:py-8">
      {state.message && fieldErrorCount >= 2 ? (
        <div className="mb-6">
          <FormErrorBanner
            message={state.message}
            fieldErrorCount={fieldErrorCount}
            onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
          />
        </div>
      ) : null}

      <form
        action={formAction}
        noValidate
        className="space-y-6"
        onSubmit={() => formFields.setSubmitAttempted(true)}
      >
        <FormField
          id="displayName"
          label="Display name"
          required
          error={errors.displayName}
          showError={formFields.shouldShowError("displayName", errors.displayName)}
          onBlur={() => formFields.markTouched("displayName")}
        >
          <Input
            name="displayName"
            value={values.displayName}
            onChange={(event) => setValues((current) => ({ ...current, displayName: event.target.value }))}
            placeholder="Maya Singh"
          />
        </FormField>

        <FormField
          id="bio"
          label="Bio"
          hint="Optional. You can add this later."
          error={errors.bio}
          showError={formFields.shouldShowError("bio", errors.bio)}
          onBlur={() => formFields.markTouched("bio")}
        >
          <Textarea
            name="bio"
            value={values.bio}
            onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
            className="min-h-28"
            placeholder="What do you play, and what should creators know before they reach out?"
          />
        </FormField>

        <div className="flex flex-col-reverse gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-bold text-muted transition-colors duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            Cancel
          </Link>
          <FormSubmitButton pendingLabel="Creating…" className="w-full sm:w-auto">
            Create Profile
          </FormSubmitButton>
        </div>
      </form>
    </div>
  );
}
