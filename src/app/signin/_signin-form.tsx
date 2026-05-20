"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { signInWithPasswordAction } from "./actions";

interface SignInState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction] = useActionState(
    (prevState: SignInState, formData: FormData) =>
      signInWithPasswordAction(prevState, formData, callbackUrl),
    { ok: false, message: "", fieldErrors: {} },
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message && !state.ok ? (
        <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {state.message}
        </div>
      ) : null}

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      <button type="submit" className="btn-primary w-full">
        <span>Sign in</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
