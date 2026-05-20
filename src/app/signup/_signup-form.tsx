"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { validateSignUp, signUpWithPasswordAction, type SignUpValidationResult } from "./actions";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState(
    (prevState: SignUpValidationResult, formData: FormData) =>
      signUpWithPasswordAction(prevState, formData, callbackUrl),
    { ok: false, fieldErrors: {} }
  );
  
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
            state.message.startsWith("Check your email")
              ? "border-[#0055FF]/20 bg-[#0055FF]/10 text-[#0F172A]"
              : "border-[#FF3366]/20 bg-[#FF3366]/10 text-[#B42318]"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="text-sm font-bold text-[#0F172A]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="input-base"
          placeholder="Maya Singh"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-bold text-[#0F172A]">
          Email <span className="text-[#FF3366]">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input-base"
          required
        />
        {errors.email ? (
          <p className="mt-2 text-sm font-medium text-[#FF3366]">{errors.email}</p>
        ) : null}
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        error={errors.password}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <button type="submit" className="btn-primary w-full">
        <span>Create account</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
