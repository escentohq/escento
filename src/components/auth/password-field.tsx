"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import {
  formErrorTextClass,
  formInputBaseClass,
  formInputInvalidClass,
} from "@/lib/form-input-classes";

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  showError = false,
  value,
  onChange,
  onBlur,
  showStrength = false,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  showError?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const isControlled = value !== undefined && onChange !== undefined;
  const errorId = `${id}-error`;
  const describedBy = [showStrength && (value?.length ?? 0) > 0 ? `${id}-strength` : null, showError && error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#0F172A]">
        {label} <span className="text-[#FF3366]">*</span>
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${formInputBaseClass.replace("mt-2 ", "")} pr-14 ${showError && error ? formInputInvalidClass : ""}`}
          aria-required
          aria-invalid={showError && error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onBlur={onBlur}
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
        <div id={`${id}-strength`}>
          <PasswordStrengthIndicator password={value ?? ""} />
        </div>
      ) : null}
      <p
        id={errorId}
        role={showError && error ? "alert" : undefined}
        className={`${formErrorTextClass} ${showError && error ? "" : "invisible"}`}
        aria-hidden={!(showError && error)}
      >
        {error || "\u00A0"}
      </p>
    </div>
  );
}
