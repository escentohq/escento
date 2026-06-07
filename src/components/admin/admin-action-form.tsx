"use client";

import { useState, useTransition } from "react";
import { ShieldAlert } from "lucide-react";

import { moderateTargetAction } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAction, AdminTargetType } from "@/lib/api/admin";

type Props = {
  targetType: AdminTargetType;
  targetId: string;
  action: AdminAction;
  label: string;
  destructive?: boolean;
  needsReason?: boolean;
  needsText?: boolean;
  confirmationPhrase?: string;
};

export function AdminActionForm({
  targetType,
  targetId,
  action,
  label,
  destructive = false,
  needsReason = false,
  needsText = false,
  confirmationPhrase,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [replacementText, setReplacementText] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    const formData = new FormData();
    formData.set("targetType", targetType);
    formData.set("targetId", targetId);
    formData.set("action", action);
    formData.set("reason", reason);
    formData.set("replacementText", replacementText);

    startTransition(async () => {
      await moderateTargetAction(formData);
      setOpen(false);
      setReason("");
      setReplacementText("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${
          destructive
            ? "border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366]/10"
            : "border-[#E2E8F0] text-[#0F172A] hover:border-[#0055FF] hover:text-[#0055FF]"
        }`}
      >
        {label}
      </button>

      <ConfirmDialog
        open={open}
        title={`${label} item`}
        description="Confirm this moderation action. It will be written to the admin audit log."
        confirmLabel={label}
        pending={isPending}
        confirmationPhrase={confirmationPhrase}
        onCancel={() => setOpen(false)}
        onConfirm={submit}
      />

      {open && (needsReason || needsText) ? (
        <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md rounded-2xl border border-[#F1F5F9] bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
            <ShieldAlert className="h-4 w-4 text-[#FFB000]" aria-hidden />
            Moderation note
          </div>
          {needsReason ? (
            <label className="block text-xs font-bold text-[#475569]">
              Optional reason
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Inappropriate bio, spam, fake profile, harassment, offensive content, other"
                className="mt-2 min-h-20"
              />
            </label>
          ) : null}
          {needsText ? (
            <label className="mt-3 block text-xs font-bold text-[#475569]">
              Replacement text
              <Textarea
                value={replacementText}
                onChange={(event) => setReplacementText(event.target.value)}
                placeholder="Leave blank to clear the text."
                className="mt-2 min-h-20"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
