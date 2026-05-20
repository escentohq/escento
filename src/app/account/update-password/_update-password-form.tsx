"use client";

import { useActionState, useTransition } from "react";
import { updatePasswordAction } from "./actions";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, {
    ok: false,
    message: "",
    fieldErrors: {},
  });
  const [isPending, startTransition] = useTransition();

  return (
    <form action={(fd) => startTransition(() => formAction(fd))} className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-[#0F172A] mb-2">
          New password <span className="text-[#FF3366]">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-2xl text-base font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-[#FF3366] mt-2 font-medium">{state.fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-bold text-[#0F172A] mb-2">
          Confirm password <span className="text-[#FF3366]">*</span>
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-[#E2E8F0] rounded-2xl text-base font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        />
        {state.fieldErrors?.confirm && (
          <p className="text-sm text-[#FF3366] mt-2 font-medium">{state.fieldErrors.confirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 rounded-full bg-[#0F172A] text-white text-sm font-bold tracking-wide hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>

      {state.message && (
        <div
          className={`rounded-3xl border p-6 text-sm font-medium ${
            state.ok
              ? "border-[#0055FF]/20 bg-[#0055FF]/5 text-[#0055FF]"
              : "border-[#FF3366]/20 bg-[#FF3366]/5 text-[#FF3366]"
          }`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
