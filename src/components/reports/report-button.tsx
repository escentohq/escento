"use client";

import { Flag, X } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
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
  const titleId = useId();
  const subjectId = useId();
  const descriptionId = useId();
  const evidenceId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#475569] transition-colors hover:border-[#FF3366] hover:text-[#FF3366] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
      >
        <Flag className="h-4 w-4" aria-hidden />
        Report
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close report dialog"
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            disabled={pending}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#F1F5F9] bg-white p-6 text-[#0F172A] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 id={titleId} className="pr-10 text-xl font-black tracking-tight">
              Report this {targetType === "gig" ? "gig" : "profile"}
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
              Tell the Escento team what happened. Your report is not shown publicly or sent to the reported user.
            </p>
            <p className="mt-3 rounded-2xl bg-[#F8FAFC] p-3 text-xs font-bold text-[#64748B]">
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
                  placeholder="Paste links, screenshots URLs, message context, or any other supporting details."
                  className="mt-2"
                />
              </div>

              {state.message ? (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
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
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#E2E8F0] px-6 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#0F172A] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
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
