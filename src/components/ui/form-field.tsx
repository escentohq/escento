"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { formErrorTextClass, formHintTextClass } from "@/lib/form-input-classes";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  showError?: boolean;
  onBlur?: () => void;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  required = false,
  error,
  hint,
  showError = false,
  onBlur,
  children,
}: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, showError && error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const control =
    isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id,
          required: false,
          "aria-required": required ? true : undefined,
          "aria-invalid": showError && error ? true : undefined,
          "aria-describedby": describedBy || undefined,
          onBlur: (event: React.FocusEvent<HTMLElement>) => {
            onBlur?.();
            const childOnBlur = (children as ReactElement<{ onBlur?: (event: React.FocusEvent<HTMLElement>) => void }>).props.onBlur;
            childOnBlur?.(event);
          },
          invalid: showError && Boolean(error),
        })
      : children;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#0F172A]">
        {label}{" "}
        {required ? <span className="text-[#FF3366]">*</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className={formHintTextClass}>
          {hint}
        </p>
      ) : null}
      {control}
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
