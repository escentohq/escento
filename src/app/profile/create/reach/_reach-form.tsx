"use client";

import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { WizardStepFooter } from "@/components/profile/wizard-step-footer";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { boolValue, stringValue } from "@/lib/form-snapshots";
import { countFieldErrors, emptyActionState, type ActionState } from "@/lib/form-utils";

import { saveReachAction } from "./actions";

const LINK_FIELDS = [
  ["youtubeUrl", "YouTube"],
  ["soundcloudUrl", "SoundCloud"],
  ["spotifyUrl", "Spotify"],
  ["websiteUrl", "Website"],
  ["instagramUrl", "Instagram"],
] as const;

export type ReachFormValues = {
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  youtubeUrl: string;
  soundcloudUrl: string;
  spotifyUrl: string;
  websiteUrl: string;
  instagramUrl: string;
};

export function ReachForm({
  initial,
  skipHref,
  backHref,
}: {
  initial: ReachFormValues;
  skipHref: string;
  backHref: string;
}) {
  const [values, setValues] = useState(initial);
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState<ActionState, FormData>(saveReachAction, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

  useEffect(() => {
    if (state.values) {
      setValues((current) => ({
        isRemote: boolValue(state.values, "isRemote", current.isRemote),
        seekingPaid: boolValue(state.values, "seekingPaid", current.seekingPaid),
        seekingUnpaid: boolValue(state.values, "seekingUnpaid", current.seekingUnpaid),
        youtubeUrl: stringValue(state.values, "youtubeUrl", current.youtubeUrl),
        soundcloudUrl: stringValue(state.values, "soundcloudUrl", current.soundcloudUrl),
        spotifyUrl: stringValue(state.values, "spotifyUrl", current.spotifyUrl),
        websiteUrl: stringValue(state.values, "websiteUrl", current.websiteUrl),
        instagramUrl: stringValue(state.values, "instagramUrl", current.instagramUrl),
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
        <fieldset className="space-y-4">
          <legend className="text-meta uppercase text-brand">Work preferences</legend>
          <div className="grid gap-4 md:grid-cols-3">
            <CheckboxField
              id="isRemote"
              name="isRemote"
              label="Remote-friendly"
              checked={values.isRemote}
              onChange={(checked) => setValues((current) => ({ ...current, isRemote: checked }))}
            />
            <CheckboxField
              id="seekingPaid"
              name="seekingPaid"
              label="Paid work"
              checked={values.seekingPaid}
              onChange={(checked) => setValues((current) => ({ ...current, seekingPaid: checked }))}
            />
            <CheckboxField
              id="seekingUnpaid"
              name="seekingUnpaid"
              label="Unpaid work"
              checked={values.seekingUnpaid}
              onChange={(checked) => setValues((current) => ({ ...current, seekingUnpaid: checked }))}
            />
          </div>
        </fieldset>

        <div className="grid gap-6 md:grid-cols-2">
          {LINK_FIELDS.map(([key, label]) => (
            <FormField
              key={key}
              id={key}
              label={label}
              error={errors[key]}
              showError={formFields.shouldShowError(key, errors[key])}
              onBlur={() => formFields.markTouched(key)}
            >
              <Input
                name={key}
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={`https://${label.toLowerCase()}.com/...`}
              />
            </FormField>
          ))}
        </div>

        <WizardStepFooter
          backHref={backHref}
          skipHref={skipHref}
          submitLabel="Finish"
          pendingLabel="Finishing…"
        />
      </form>
    </div>
  );
}
