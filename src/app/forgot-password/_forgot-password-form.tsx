"use client";

import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, isValidEmail } from "@/lib/form-utils";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const formFields = useFormFieldState();

  const [state, formAction] = useActionState(resetPasswordAction, {
    ok: false,
    fieldErrors: {},
  });

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const emailFormatError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const emailError = errors.email ?? emailFormatError;

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
        <FormErrorBanner
          variant={state.ok ? "success" : "error"}
          message={state.message}
        />
      ) : null}

      {fieldErrorCount >= 2 && state.message ? (
        <FormErrorBanner
          message={state.message}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <FormField
        id="email"
        label="Email address"
        required
        error={emailError}
        showError={formFields.shouldShowError("email", emailError)}
        onBlur={() => formFields.markTouched("email")}
      >
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>

      <FormSubmitButton pendingLabel="Sending…" className="w-full">
        Send reset link
      </FormSubmitButton>
    </form>
  );
}
