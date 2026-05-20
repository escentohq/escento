"use client";

import { useCallback, useState } from "react";

import { type FieldErrors, firstErrorFieldId } from "@/lib/form-utils";

export function useFormFieldState() {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const markTouched = useCallback((fieldId: string) => {
    setTouched((current) => (current[fieldId] ? current : { ...current, [fieldId]: true }));
  }, []);

  const shouldShowError = useCallback(
    (fieldId: string, error?: string) => Boolean(error && (touched[fieldId] || submitAttempted)),
    [submitAttempted, touched],
  );

  const scrollToFirstError = useCallback((fieldErrors?: FieldErrors) => {
    const fieldId = firstErrorFieldId(fieldErrors);
    if (!fieldId) return;

    requestAnimationFrame(() => {
      const element = document.getElementById(fieldId);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus({ preventScroll: true });
    });
  }, []);

  const handleInvalidSubmit = useCallback(
    (fieldErrors?: FieldErrors) => {
      setSubmitAttempted(true);
      scrollToFirstError(fieldErrors);
    },
    [scrollToFirstError],
  );

  return {
    touched,
    markTouched,
    submitAttempted,
    setSubmitAttempted,
    shouldShowError,
    scrollToFirstError,
    handleInvalidSubmit,
  };
}
