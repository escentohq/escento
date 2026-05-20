"use client";

import { useActionState, useEffect, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors } from "@/lib/form-utils";
import { updatePasswordAction, type UpdatePasswordState } from "./actions";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const formFields = useFormFieldState();

  const [state, formAction] = useActionState(updatePasswordAction, {
    ok: false,
    fieldErrors: {},
  });

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const confirmMismatch =
    confirm.length > 0 && password !== confirm ? "Passwords need to match." : undefined;
  const confirmError = errors.confirm ?? confirmMismatch;

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
      className="space-y-6"
      onSubmit={() => formFields.setSubmitAttempted(true)}
    >
      {state.message && fieldErrorCount === 0 ? (
        <FormErrorBanner message={state.message} />
      ) : null}

      {fieldErrorCount >= 2 && state.message ? (
        <FormErrorBanner
          message={state.message}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        error={errors.password}
        showError={formFields.shouldShowError("password", errors.password)}
        onBlur={() => formFields.markTouched("password")}
        value={password}
        onChange={setPassword}
        showStrength
      />

      <PasswordField
        id="confirm"
        name="confirm"
        label="Confirm password"
        autoComplete="new-password"
        error={confirmError}
        showError={formFields.shouldShowError("confirm", confirmError)}
        onBlur={() => formFields.markTouched("confirm")}
        value={confirm}
        onChange={setConfirm}
      />

      <FormSubmitButton pendingLabel="Updating…" className="w-full">
        Update password
      </FormSubmitButton>
    </form>
  );
}
