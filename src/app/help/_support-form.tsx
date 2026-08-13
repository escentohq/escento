"use client";

import { useActionState, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, isValidEmail } from "@/lib/form-utils";
import { submitHelpRequest, type HelpFormState } from "./actions";

const initialState: HelpFormState = { ok: false, fieldErrors: {} };
const fallbackEmail = "support@escento.com";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function SupportForm() {
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(submitHelpRequest, initialState);
  const [name, setName] = useState(stringValue(state.values?.name));
  const [email, setEmail] = useState(stringValue(state.values?.email));
  const [subject, setSubject] = useState(stringValue(state.values?.subject));
  const [message, setMessage] = useState(stringValue(state.values?.message));

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const emailFormatError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const emailError = errors.email ?? emailFormatError;

  useEffect(() => {
    setName(stringValue(state.values?.name));
    setEmail(stringValue(state.values?.email));
    setSubject(stringValue(state.values?.subject));
    setMessage(stringValue(state.values?.message));

    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        noValidate
        className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm sm:p-8"
        onSubmit={() => formFields.setSubmitAttempted(true)}
      >
        <div className="space-y-5">
          {state.message ? (
            <FormErrorBanner
              variant={state.ok ? "success" : "error"}
              message={state.message}
              fieldErrorCount={fieldErrorCount}
              onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
            />
          ) : null}

          <FormField id="name" label="Name" hint="Optional">
            <Input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </FormField>

          <FormField
            id="email"
            label="Email Address"
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

          <FormField
            id="subject"
            label="Subject"
            required
            error={errors.subject}
            showError={formFields.shouldShowError("subject", errors.subject)}
            onBlur={() => formFields.markTouched("subject")}
          >
            <Input
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </FormField>

          <FormField
            id="message"
            label="Message"
            required
            error={errors.message}
            showError={formFields.shouldShowError("message", errors.message)}
            onBlur={() => formFields.markTouched("message")}
          >
            <Textarea
              name="message"
              rows={7}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </FormField>

          <FormSubmitButton pendingLabel="Sending..." className="w-full sm:w-auto">
            Submit
          </FormSubmitButton>
        </div>
      </form>

      {state.deliveryFailed ? (
        <section className="rounded-3xl border border-[#F1F5F9] bg-[#F8FAFC] p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Still need help?
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#475569]">
            Automatic delivery is not available right now. You can email{" "}
            <a
              href={`mailto:${fallbackEmail}`}
              className="font-bold text-[#0055FF] underline-offset-2 hover:underline"
            >
              {fallbackEmail}
            </a>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}

