"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { emptyActionState } from "@/lib/form-utils";
import { updateNameAction } from "./actions";

type Props = {
  initialName: string;
};

export function UpdateNameForm({ initialName }: Props) {
  const [state, formAction] = useActionState(updateNameAction, emptyActionState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-[#0F172A]">
          Display name <span aria-hidden="true" className="text-[#FF3366]">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          required
          maxLength={80}
          className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] transition-colors placeholder:text-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20"
        />
        {state.fieldErrors?.name && (
          <p className="mt-2 text-sm text-[#FF3366]">{state.fieldErrors.name}</p>
        )}
      </div>

      {state.ok && state.message && (
        <div className="rounded-2xl bg-[#0055FF]/10 px-4 py-2.5 text-sm text-[#0055FF]">
          {state.message}
        </div>
      )}

      <FormSubmitButton pendingLabel="Saving…">Save</FormSubmitButton>
    </form>
  );
}
