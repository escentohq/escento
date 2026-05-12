"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { COMPENSATION_TYPES, PROJECT_TYPES, compensationLabel, projectTypeLabel } from "@/lib/display";
import type { ActionState } from "@/lib/form-utils";
import { emptyActionState } from "@/lib/form-utils";

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

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#0F172A]">
        {label} {required ? <span className="text-[#FF3366]">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-[#FF3366]">{error}</p> : null}
    </div>
  );
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
  const [state, formAction] = useActionState(action, emptyActionState);
  const values = { ...emptyInitial, ...initial };
  const deadlineValue = values.deadline ? values.deadline.slice(0, 10) : "";
  const errors = state.fieldErrors ?? {};

  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm md:p-8">
      {state.message ? (
        <div className="mb-6 rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-10">
        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Project
          </legend>
          <Field id="title" label="Title" required error={errors.title}>
            <input id="title" name="title" defaultValue={values.title} className="input-base" placeholder="Composer needed for 10-minute thesis short" required />
          </Field>
          <Field id="description" label="Description" required error={errors.description}>
            <textarea
              id="description"
              name="description"
              defaultValue={values.description}
              className="input-base min-h-40"
              placeholder="What are you making, what do you need, and what is the timeline?"
              required
            />
          </Field>
          <Field id="projectType" label="Project type" required error={errors.projectType}>
            <select id="projectType" name="projectType" className="select-base" required defaultValue={values.projectType}>
              <option value="">Select...</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {projectTypeLabel(type)}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
            Looking for
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="instrumentsCsv" label="Instruments needed" error={errors.instrumentsCsv}>
              <input id="instrumentsCsv" name="instrumentsCsv" defaultValue={values.instrumentsCsv} className="input-base" placeholder="Violin, Piano, Vocals" />
            </Field>
            <Field id="genresCsv" label="Genres preferred" error={errors.genresCsv}>
              <input id="genresCsv" name="genresCsv" defaultValue={values.genresCsv} className="input-base" placeholder="Ambient, Jazz, Indie" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
            Logistics
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="location" label="Location" error={errors.location}>
              <input id="location" name="location" defaultValue={values.location} className="input-base" placeholder="Austin, TX" />
            </Field>
            <label htmlFor="isRemote" className="mt-7 flex min-h-14 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A]">
              <input id="isRemote" type="checkbox" name="isRemote" defaultChecked={values.isRemote} className="h-4 w-4 accent-[#0055FF]" />
              Remote option
            </label>
          </div>
          <Field id="deadline" label="Deadline" error={errors.deadline}>
            <input id="deadline" type="date" name="deadline" className="input-base" defaultValue={deadlineValue} />
          </Field>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Compensation
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="compensationType" label="Compensation type" required error={errors.compensationType}>
              <select id="compensationType" name="compensationType" className="select-base" required defaultValue={values.compensationType}>
                <option value="">Select...</option>
                {COMPENSATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {compensationLabel(type)}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="compensationDetails" label="Compensation details" error={errors.compensationDetails}>
              <input id="compensationDetails" name="compensationDetails" defaultValue={values.compensationDetails} className="input-base" placeholder="$150, credit, meals, studio time" />
            </Field>
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

