"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, isValidEmail } from "@/lib/form-utils";
import { signUpWithPasswordAction, type SignUpValidationResult } from "./actions";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const formFields = useFormFieldState();

  const [state, formAction] = useActionState(
    (prevState: SignUpValidationResult, formData: FormData) =>
      signUpWithPasswordAction(prevState, formData, callbackUrl),
    { ok: false, fieldErrors: {} },
  );

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const emailFormatError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const emailError = errors.email ?? emailFormatError;
  const confirmMismatch =
    confirmPassword.length > 0 && password !== confirmPassword
      ? "Passwords need to match."
      : undefined;
  const confirmError = errors.confirmPassword ?? confirmMismatch;
  const termsError = errors.termsAccepted;

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const successMessage = state.message?.startsWith("Check your email");
  const showSummaryBanner =
    Boolean(state.message) &&
    (successMessage || fieldErrorCount >= 2 || (fieldErrorCount === 0 && !successMessage));

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
      onSubmit={() => formFields.setSubmitAttempted(true)}
    >
      {showSummaryBanner ? (
        <FormErrorBanner
          variant={successMessage ? "success" : "error"}
          message={state.message ?? ""}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <FormField id="name" label="Name">
        <Input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Maya Singh"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>

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
        autoComplete="new-password"
        error={errors.password}
        showError={formFields.shouldShowError("password", errors.password)}
        onBlur={() => formFields.markTouched("password")}
        value={password}
        onChange={setPassword}
        showStrength
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={confirmError}
        showError={formFields.shouldShowError("confirmPassword", confirmError)}
        onBlur={() => formFields.markTouched("confirmPassword")}
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <div>
        <label
          htmlFor="termsAccepted"
          className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-bold leading-relaxed text-[#0F172A]"
        >
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            onBlur={() => formFields.markTouched("termsAccepted")}
            aria-invalid={formFields.shouldShowError("termsAccepted", termsError) && termsError ? true : undefined}
            aria-describedby="termsAccepted-error"
            className="mt-1 h-4 w-4 shrink-0 accent-[#0055FF]"
          />
          <span>
            I agree to Motivo&apos;s{" "}
            <Link href="/terms" className="text-[#0055FF] underline-offset-4 hover:underline">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="text-[#0055FF] underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/compliance" className="text-[#0055FF] underline-offset-4 hover:underline">
              Compliance Policy
            </Link>
            .
          </span>
        </label>
        <p
          id="termsAccepted-error"
          role={formFields.shouldShowError("termsAccepted", termsError) && termsError ? "alert" : undefined}
          className={`mt-2 min-h-5 text-sm font-medium text-[#B42318] ${
            formFields.shouldShowError("termsAccepted", termsError) && termsError ? "" : "invisible"
          }`}
          aria-hidden={!(formFields.shouldShowError("termsAccepted", termsError) && termsError)}
        >
          {termsError || "\u00A0"}
        </p>
      </div>

      <FormSubmitButton pendingLabel="Creating account…" className="w-full">
        Create account
      </FormSubmitButton>
    </form>
  );
}
