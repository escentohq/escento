"use client";

import { Flag, X } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  submitContentReport,
  type ReportFormState,
} from "@/app/reports/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  targetType: "musician_profile" | "gig";
  targetId: string;
  targetLabel: string;
};

const initialState: ReportFormState = { ok: false };

export function ReportButton({ targetType, targetId, targetLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitContentReport, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const subjectId = useId();
  const descriptionId = useId();
  const evidenceId = useId();

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setOpen(false);
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, pending]);

  useEffect(() => {
    if (state.ok) {
      const timer = window.setTimeout(() => setOpen(false), 1400);
      return () => window.clearTimeout(timer);
    }
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center justify-center gap-2 border border-rule bg-surface px-4 text-control text-muted transition-colors hover:border-coral hover:text-coral focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        <Flag className="h-4 w-4" aria-hidden />
        Report
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close report dialog"
            className="absolute inset-0 bg-[#0F172A]/50"
            onClick={() => setOpen(false)}
            disabled={pending}
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="surface-overlay relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-ink bg-surface p-6 text-ink"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-[#F1F5F9] hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 id={titleId} className="pr-10 text-item-heading">
              Report this {targetType === "gig" ? "gig" : "profile"}
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
              Tell us what happened. The reported user will not see your report.
            </p>
            <p className="mt-3 border-y border-rule py-3 text-meta uppercase text-muted">
              Reporting: {targetLabel}
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="targetType" value={targetType} />
              <input type="hidden" name="targetId" value={targetId} />

              <div>
                <label htmlFor={subjectId} className="text-sm font-bold text-[#0F172A]">
                  Subject
                </label>
                <Input
                  id={subjectId}
                  name="subject"
                  maxLength={140}
                  required
                  placeholder="Spam, harassment, fake listing, unsafe request"
                  className="mt-2"
                />
              </div>

              <div>
                <label htmlFor={descriptionId} className="text-sm font-bold text-[#0F172A]">
                  What happened?
                </label>
                <Textarea
                  id={descriptionId}
                  name="description"
                  rows={6}
                  maxLength={4000}
                  required
                  placeholder="Share the details the Escento team should review."
                  className="mt-2"
                />
              </div>

              <div>
                <label htmlFor={evidenceId} className="text-sm font-bold text-[#0F172A]">
                  Evidence or links
                  <span className="ml-1 font-medium text-[#64748B]">(optional)</span>
                </label>
                <Textarea
                  id={evidenceId}
                  name="evidence"
                  rows={3}
                  maxLength={2000}
                placeholder="Add links, screenshot URLs, or relevant message details."
                  className="mt-2"
                />
              </div>

              {state.message ? (
                <p
                  className={`border-l-4 px-4 py-3 text-secondary font-semibold ${
                    state.ok
                      ? "bg-[#0055FF]/10 text-[#0055FF]"
                      : "bg-[#FF3366]/10 text-[#B42318]"
                  }`}
                  role="alert"
                >
                  {state.message}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="control-secondary h-12 px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="control-primary h-12 px-6 disabled:cursor-wait"
                >
                  {pending ? "Sending..." : "Send report"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
