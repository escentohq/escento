"use client";

import { useState, useTransition } from "react";

import { adminModerationAction } from "@/app/admin/actions";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAction, AdminTargetType } from "@/lib/api/admin-dashboard";

type Props = {
  targetType: AdminTargetType;
  targetId: string;
  action: AdminAction;
  label: string;
  tone?: "neutral" | "danger";
  needsText?: boolean;
};

export function AdminActionButton({
  targetType,
  targetId,
  action,
  label,
  tone = "neutral",
  needsText = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [replacementText, setReplacementText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    const formData = new FormData();
    formData.set("targetType", targetType);
    formData.set("targetId", targetId);
    formData.set("action", action);
    formData.set("reason", reason);
    formData.set("replacementText", replacementText);

    startTransition(async () => {
      try {
        await adminModerationAction(formData);
        setOpen(false);
        setReason("");
        setReplacementText("");
      } catch {
        setError("Action failed. Confirm the admin migration is applied and try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-9 items-center border px-3 text-control transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
          tone === "danger"
            ? "border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366]/10"
            : "border-[#E2E8F0] text-[#0F172A] hover:border-[#0055FF] hover:text-[#0055FF]"
        }`}
      >
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0F172A]/40"
            aria-label="Close moderation dialog"
            onClick={() => setOpen(false)}
            disabled={isPending}
          />
          <div role="dialog" aria-modal="true" className="surface-overlay relative w-full max-w-lg border border-ink bg-surface p-6">
            <h2 className="text-item-heading text-ink">{label}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#475569]">
              Confirm this admin action. It is isolated to admin metadata and will be logged.
            </p>

            <label className="mt-5 block text-sm font-bold text-[#0F172A]">
              Optional reason
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Spam, inappropriate bio, fake profile, offensive content, other"
                className="mt-2 min-h-24"
              />
            </label>

            {needsText ? (
              <label className="mt-4 block text-sm font-bold text-[#0F172A]">
                Replacement text
                <Textarea
                  value={replacementText}
                  onChange={(event) => setReplacementText(event.target.value)}
                  placeholder="Leave blank to clear the text."
                  className="mt-2 min-h-24"
                />
              </label>
            ) : null}

            {error ? <p className="mt-4 text-sm font-bold text-[#B42318]" role="alert">{error}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="control-secondary min-h-11 px-5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="control-primary min-h-11 px-5 disabled:opacity-50"
              >
                {isPending ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
