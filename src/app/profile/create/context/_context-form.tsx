"use client";

import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { WizardStepFooter } from "@/components/profile/wizard-step-footer";
import {
  LocationAutocompleteField,
  type LocationAutocompleteValue,
} from "@/components/location/location-autocomplete-field";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { stringValue } from "@/lib/form-snapshots";
import { countFieldErrors, emptyActionState, type ActionState } from "@/lib/form-utils";

import { saveContextAction } from "./actions";

export type ContextFormValues = LocationAutocompleteValue & {
  school: string;
  yearsExperience: string;
  availabilityText: string;
};

export function ContextForm({
  initial,
  skipHref,
  backHref,
}: {
  initial: ContextFormValues;
  skipHref: string;
  backHref: string;
}) {
  const [values, setValues] = useState(initial);
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState<ActionState, FormData>(saveContextAction, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

  useEffect(() => {
    if (state.values) {
      setValues((current) => ({
        ...current,
        school: stringValue(state.values, "school", current.school),
        yearsExperience: stringValue(state.values, "yearsExperience", current.yearsExperience),
        availabilityText: stringValue(state.values, "availabilityText", current.availabilityText),
        locationDisplayName: stringValue(state.values, "locationDisplayName", current.locationDisplayName),
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
          id="school"
          label="School"
          error={errors.school}
          showError={formFields.shouldShowError("school", errors.school)}
          onBlur={() => formFields.markTouched("school")}
        >
          <Input
            name="school"
            value={values.school}
            onChange={(event) => setValues((current) => ({ ...current, school: event.target.value }))}
            placeholder="UT Austin"
          />
        </FormField>

        <FormField
          id="locationDisplayName"
          label="Location"
          error={errors.locationDisplayName}
          showError={formFields.shouldShowError("locationDisplayName", errors.locationDisplayName)}
          onBlur={() => formFields.markTouched("locationDisplayName")}
          hint="Choose a city or region from the suggestions."
        >
          <LocationAutocompleteField
            value={values as LocationAutocompleteValue}
            onChange={(next) => setValues((current) => ({ ...current, ...next }))}
            invalid={
              formFields.shouldShowError("locationDisplayName", errors.locationDisplayName) &&
              Boolean(errors.locationDisplayName)
            }
          />
        </FormField>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="yearsExperience"
            label="Years of experience"
            error={errors.yearsExperience}
            showError={formFields.shouldShowError("yearsExperience", errors.yearsExperience)}
            onBlur={() => formFields.markTouched("yearsExperience")}
          >
            <Input
              name="yearsExperience"
              value={values.yearsExperience}
              onChange={(event) => setValues((current) => ({ ...current, yearsExperience: event.target.value }))}
              inputMode="numeric"
              placeholder="3"
            />
          </FormField>
          <FormField
            id="availabilityText"
            label="Availability"
            error={errors.availabilityText}
            showError={formFields.shouldShowError("availabilityText", errors.availabilityText)}
            onBlur={() => formFields.markTouched("availabilityText")}
          >
            <Input
              name="availabilityText"
              value={values.availabilityText}
              onChange={(event) => setValues((current) => ({ ...current, availabilityText: event.target.value }))}
              placeholder="Weekends, evenings, 2 weeks notice"
            />
          </FormField>
        </div>

        <WizardStepFooter backHref={backHref} skipHref={skipHref} />
      </form>
    </div>
  );
}
