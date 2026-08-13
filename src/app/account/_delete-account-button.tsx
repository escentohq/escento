"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { DELETE_ACCOUNT_UNAVAILABLE } from "@/lib/account-deletion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormErrorBanner } from "@/components/ui/form-error-banner";

type Props = {
  deleteAction: () => Promise<void>;
};

export function DeleteAccountButton({ deleteAction }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setMessage(null);
    setPending(true);
    try {
      await deleteAction();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error && error.message === DELETE_ACCOUNT_UNAVAILABLE
          ? DELETE_ACCOUNT_UNAVAILABLE
          : "Account deletion could not finish. Try again in a moment.",
      );
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {message ? <FormErrorBanner message={message} /> : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#FF3366] px-4 py-2.5 text-sm font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {pending ? "Deleting…" : "Delete Account"}
      </button>

      {open ? (
        <ConfirmDialog
          open
          title="Delete your account?"
          description="All your data will be permanently removed. This cannot be undone."
          confirmLabel="Delete account"
          confirmationPhrase="delete my account"
          pending={pending}
          onConfirm={() => void handleConfirm()}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
