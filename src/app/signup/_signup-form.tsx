"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { validateSignUp, type SignUpValidationResult } from "./actions";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [state, setState] = useState<SignUpValidationResult>({ ok: false });
  const [pending, setPending] = useState(false);
  const errors = state.fieldErrors ?? {};

  async function submit(formData: FormData) {
    setState({ ok: false });
    setPending(true);
    try {
      const validated = await validateSignUp(formData);
      if (!validated.ok) {
        setState(validated);
        return;
      }

      const email = String(formData.get("email") ?? "").trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      const name = String(formData.get("name") ?? "").trim();

      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const next =
        callbackUrl.startsWith("/") ? callbackUrl : "/onboarding/role";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            full_name: name || undefined,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          setState({
            ok: false,
            fieldErrors: {
              email:
                "An account already exists for this email. Sign in instead.",
            },
          });
          return;
        }
        setState({
          ok: false,
          message: error.message,
        });
        return;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }

      setState({
        ok: false,
        message:
          "Check your email to confirm your account, then sign in to continue.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-5">
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

      <button type="submit" disabled={pending} className="btn-primary w-full">
        <span>{pending ? "Creating..." : "Create account"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
