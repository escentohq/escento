"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { createAccount, type SignUpResult } from "./actions";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SignUpResult>({ ok: false });
  const errors = state.fieldErrors ?? {};

  function submit(formData: FormData) {
    setState({ ok: false });

    startTransition(async () => {
      const result = await createAccount(formData);
      if (!result.ok) {
        setState(result);
        return;
      }

      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (signInResult?.error) {
        setState({
          ok: false,
          message: "Account created. Sign in with your new password.",
        });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {state.message ? (
        <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
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
        {errors.email ? <p className="mt-2 text-sm font-medium text-[#FF3366]">{errors.email}</p> : null}
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

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        <span>{isPending ? "Creating..." : "Create account"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

