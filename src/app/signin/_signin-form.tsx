"use client";

import { useActionState, useEffect, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, isValidEmail } from "@/lib/form-utils";
import { signInWithPasswordAction, type SignInState } from "./actions";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const formFields = useFormFieldState();

  const [state, formAction] = useActionState(
    (prevState: SignInState, formData: FormData) =>
      signInWithPasswordAction(prevState, formData, callbackUrl),
    { ok: false, fieldErrors: {} },
  );

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const emailFormatError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const emailError = errors.email ?? emailFormatError;
  const passwordError = errors.password;

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when server validation returns
  }, [state]);

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
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

      <FormField
        id="email"
        label="Email"
        required
        error={emailError}
        showError={formFields.shouldShowError("email", emailError)}
        onBlur={() => formFields.markTouched("email")}
      >
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        error={passwordError}
        showError={formFields.shouldShowError("password", passwordError)}
        onBlur={() => formFields.markTouched("password")}
        value={password}
        onChange={setPassword}
      />

      <FormSubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </FormSubmitButton>
    </form>
  );
}
