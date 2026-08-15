"use client";

import { useActionState, useEffect } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { WizardStepFooter } from "@/components/profile/wizard-step-footer";
import { TagFilterMultiSelect } from "@/components/location/tag-filter-multi-select";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, emptyActionState, type ActionState } from "@/lib/form-utils";

import { saveCraftAction } from "./actions";

type TagOption = { name: string };

export function CraftForm({
  instruments,
  genres,
  selectedInstruments,
  selectedGenres,
  skipHref,
  backHref,
}: {
  instruments: TagOption[];
  genres: TagOption[];
  selectedInstruments: string[];
  selectedGenres: string[];
  skipHref: string;
  backHref: string;
}) {
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState<ActionState, FormData>(saveCraftAction, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

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
          id="instrumentsCsv"
          label="Instruments"
          error={errors.instrumentsCsv}
          showError={formFields.shouldShowError("instrumentsCsv", errors.instrumentsCsv)}
          onBlur={() => formFields.markTouched("instrumentsCsv")}
        >
          <TagFilterMultiSelect
            id="instrumentsCsv"
            name="instrumentsCsv"
            label="Instruments"
            kind="instrument"
            options={instruments}
            selected={selectedInstruments}
            placeholder="Guitar, vocals, piano"
            hiddenValueMode="csv"
            fallbackLabel="Add"
            hideLabel
          />
        </FormField>

        <FormField
          id="genresCsv"
          label="Genres"
          error={errors.genresCsv}
          showError={formFields.shouldShowError("genresCsv", errors.genresCsv)}
          onBlur={() => formFields.markTouched("genresCsv")}
        >
          <TagFilterMultiSelect
            id="genresCsv"
            name="genresCsv"
            label="Genres"
            kind="genre"
            options={genres}
            selected={selectedGenres}
            placeholder="Indie, jazz, film scoring"
            hiddenValueMode="csv"
            fallbackLabel="Add"
            hideLabel
          />
        </FormField>

        <WizardStepFooter backHref={backHref} skipHref={skipHref} />
      </form>
    </div>
  );
}
