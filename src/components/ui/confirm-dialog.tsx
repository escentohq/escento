"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  /** When set, user must type this exact string (case-sensitive) to enable confirm. */
  confirmationPhrase?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pending = false,
  confirmationPhrase,
  onConfirm,
  onCancel,
}: Props) {
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const confirmationFieldId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const [confirmationInput, setConfirmationInput] = useState("");

  const requiresPhrase = Boolean(confirmationPhrase);
  const phraseMatches = !requiresPhrase || confirmationInput === confirmationPhrase;
  const confirmDisabled = pending || !phraseMatches;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        handleCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCancel is stable for this dialog session
  }, [open, pending]);

  useEffect(() => {
    if (!open || !requiresPhrase) return;

    const timer = window.setTimeout(() => confirmationInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, requiresPhrase]);

  function handleCancel() {
    if (pending) return;
    setConfirmationInput("");
    onCancel();
  }

  function handleConfirm() {
    if (confirmDisabled) return;
    onConfirm();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        onClick={handleCancel}
        disabled={pending}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-3xl border border-[#F1F5F9] bg-white p-6 text-[#0F172A] shadow-2xl"
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <h2 id={titleId} className="pr-10 text-xl font-black tracking-tight">
          {title}
        </h2>
        <p id={descriptionId} className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          {description}
        </p>

        {requiresPhrase ? (
          <div className="mt-5">
            <label htmlFor={confirmationFieldId} className="text-sm font-bold text-[#0F172A]">
              Type{" "}
              <span className="font-mono text-[#FF3366]">{confirmationPhrase}</span> to confirm
            </label>
            <Input
              ref={confirmationInputRef}
              id={confirmationFieldId}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              placeholder={confirmationPhrase}
              className="mt-2 font-mono"
              aria-describedby={descriptionId}
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#E2E8F0] px-6 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#FF3366] bg-white px-6 text-sm font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
