"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  value,
  onChange,
  showStrength = false,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#0F172A]">
        {label} <span className="text-[#FF3366]">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="input-base pr-14"
          required
          {...(isControlled
            ? {
                value,
                onChange: (event) => onChange(event.target.value),
              }
            : {})}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {showStrength && (value?.length ?? 0) > 0 ? (
        <PasswordStrengthIndicator password={value ?? ""} />
      ) : null}
      {error ? <p className="mt-2 text-sm font-medium text-[#FF3366]">{error}</p> : null}
    </div>
  );
}
