"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { boolValue, stringValue } from "@/lib/form-snapshots";
import { COMPENSATION_TYPES, PROJECT_TYPES, compensationLabel, projectTypeLabel } from "@/lib/display";
import { countFieldErrors, emptyActionState, type ActionState } from "@/lib/form-utils";

export type GigFormInitial = {
  title: string;
  description: string;
  projectType: string;
  location: string;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string;
  deadline: string;
  instrumentsCsv: string;
  genresCsv: string;
};

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

const emptyInitial: GigFormInitial = {
  title: "",
  description: "",
  projectType: "",
  location: "",
  isRemote: true,
  compensationType: "",
  compensationDetails: "",
  deadline: "",
  instrumentsCsv: "",
  genresCsv: "",
};

function buildValues(initial: Partial<GigFormInitial>): GigFormInitial {
  return { ...emptyInitial, ...initial };
}

export function GigForm({
  initial = emptyInitial,
  action,
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  initial?: Partial<GigFormInitial>;
  action: Action;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}) {
  const [values, setValues] = useState(() => buildValues(initial));
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(action, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const deadlineValue = values.deadline ? values.deadline.slice(0, 10) : "";

  useEffect(() => {
    if (state.values) {
      setValues((current) => ({
        ...current,
        title: stringValue(state.values, "title", current.title),
        description: stringValue(state.values, "description", current.description),
        projectType: stringValue(state.values, "projectType", current.projectType),
        location: stringValue(state.values, "location", current.location),
        isRemote: boolValue(state.values, "isRemote", current.isRemote),
        compensationType: stringValue(state.values, "compensationType", current.compensationType),
        compensationDetails: stringValue(state.values, "compensationDetails", current.compensationDetails),
        deadline: stringValue(state.values, "deadline", current.deadline),
        instrumentsCsv: stringValue(state.values, "instrumentsCsv", current.instrumentsCsv),
        genresCsv: stringValue(state.values, "genresCsv", current.genresCsv),
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
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm md:p-8">
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
        className="space-y-10"
        onSubmit={() => formFields.setSubmitAttempted(true)}
      >
        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Project
          </legend>
          <FormField
            id="title"
            label="Title"
            required
            error={errors.title}
            showError={formFields.shouldShowError("title", errors.title)}
            onBlur={() => formFields.markTouched("title")}
          >
            <Input
              name="title"
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              placeholder="Composer needed for 10-minute thesis short"
            />
          </FormField>
          <FormField
            id="description"
            label="Description"
            required
            error={errors.description}
            showError={formFields.shouldShowError("description", errors.description)}
            onBlur={() => formFields.markTouched("description")}
          >
            <Textarea
              name="description"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              className="min-h-40"
              placeholder="What are you making, what do you need, and what is the timeline?"
            />
          </FormField>
          <FormField
            id="projectType"
            label="Project type"
            required
            error={errors.projectType}
            showError={formFields.shouldShowError("projectType", errors.projectType)}
            onBlur={() => formFields.markTouched("projectType")}
          >
            <Select
              name="projectType"
              value={values.projectType}
              onChange={(event) => setValues((current) => ({ ...current, projectType: event.target.value }))}
            >
              <option value="">Select...</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {projectTypeLabel(type)}
                </option>
              ))}
            </Select>
          </FormField>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
            Looking for
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="instrumentsCsv"
              label="Instruments needed"
              error={errors.instrumentsCsv}
              showError={formFields.shouldShowError("instrumentsCsv", errors.instrumentsCsv)}
              onBlur={() => formFields.markTouched("instrumentsCsv")}
            >
              <Input
                name="instrumentsCsv"
                value={values.instrumentsCsv}
                onChange={(event) => setValues((current) => ({ ...current, instrumentsCsv: event.target.value }))}
                placeholder="Violin, Piano, Vocals"
              />
            </FormField>
            <FormField
              id="genresCsv"
              label="Genres preferred"
              error={errors.genresCsv}
              showError={formFields.shouldShowError("genresCsv", errors.genresCsv)}
              onBlur={() => formFields.markTouched("genresCsv")}
            >
              <Input
                name="genresCsv"
                value={values.genresCsv}
                onChange={(event) => setValues((current) => ({ ...current, genresCsv: event.target.value }))}
                placeholder="Ambient, Jazz, Indie"
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
            Logistics
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="location"
              label="Location"
              error={errors.location}
              showError={formFields.shouldShowError("location", errors.location)}
              onBlur={() => formFields.markTouched("location")}
            >
              <Input
                name="location"
                value={values.location}
                onChange={(event) => setValues((current) => ({ ...current, location: event.target.value }))}
                placeholder="Austin, TX"
              />
            </FormField>
            <label
              htmlFor="isRemote"
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] md:mt-7"
            >
              <input
                id="isRemote"
                type="checkbox"
                name="isRemote"
                checked={values.isRemote}
                onChange={(event) => setValues((current) => ({ ...current, isRemote: event.target.checked }))}
                className="h-4 w-4 accent-[#0055FF]"
              />
              Remote option
            </label>
          </div>
          <FormField
            id="deadline"
            label="Deadline"
            error={errors.deadline}
            showError={formFields.shouldShowError("deadline", errors.deadline)}
            onBlur={() => formFields.markTouched("deadline")}
          >
            <Input
              name="deadline"
              type="date"
              value={deadlineValue}
              onChange={(event) => setValues((current) => ({ ...current, deadline: event.target.value }))}
            />
          </FormField>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Compensation
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="compensationType"
              label="Compensation type"
              required
              error={errors.compensationType}
              showError={formFields.shouldShowError("compensationType", errors.compensationType)}
              onBlur={() => formFields.markTouched("compensationType")}
            >
              <Select
                name="compensationType"
                value={values.compensationType}
                onChange={(event) => setValues((current) => ({ ...current, compensationType: event.target.value }))}
              >
                <option value="">Select...</option>
                {COMPENSATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {compensationLabel(type)}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              id="compensationDetails"
              label="Compensation details"
              error={errors.compensationDetails}
              showError={formFields.shouldShowError("compensationDetails", errors.compensationDetails)}
              onBlur={() => formFields.markTouched("compensationDetails")}
            >
              <Input
                name="compensationDetails"
                value={values.compensationDetails}
                onChange={(event) => setValues((current) => ({ ...current, compensationDetails: event.target.value }))}
                placeholder="$150, credit, meals, studio time"
              />
            </FormField>
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-4 border-t border-[#F1F5F9] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href={cancelHref} className="text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF]">
            Cancel
          </Link>
          <FormSubmitButton pendingLabel={pendingLabel} className="w-full sm:w-auto">
            {submitLabel}
          </FormSubmitButton>
        </div>
      </form>
    </div>
  );
}
