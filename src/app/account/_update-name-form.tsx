"use client";

import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, emptyActionState } from "@/lib/form-utils";
import { updateNameAction } from "./actions";

type Props = {
  initialName: string;
};

export function UpdateNameForm({ initialName }: Props) {
  const [name, setName] = useState(initialName);
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(updateNameAction, emptyActionState);

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
    <form
      action={formAction}
      noValidate
      className="space-y-4"
      onSubmit={() => formFields.setSubmitAttempted(true)}
    >
      {state.ok && state.message ? (
        <FormErrorBanner variant="success" message={state.message} />
      ) : null}

      {state.message && !state.ok && fieldErrorCount >= 2 ? (
        <FormErrorBanner
          message={state.message}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <FormField
        id="name"
        label="Display name"
        required
        error={errors.name}
        showError={formFields.shouldShowError("name", errors.name)}
        onBlur={() => formFields.markTouched("name")}
      >
        <Input
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
        />
      </FormField>

      <FormSubmitButton pendingLabel="Saving…">Save</FormSubmitButton>
    </form>
  );
}
