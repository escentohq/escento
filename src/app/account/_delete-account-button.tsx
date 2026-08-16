"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormErrorBanner } from "@/components/ui/form-error-banner";

type Props = {
  /** Resolves with a message when the deletion did not finish; redirects on success. */
  deleteAction: () => Promise<{ ok: false; message: string } | void>;
};

export function DeleteAccountButton({ deleteAction }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setMessage(null);
    setPending(true);
    try {
      const result = await deleteAction();
      // A finished deletion redirects, so anything returned here is a failure
      // the action has already described accurately.
      if (result && !result.ok) {
        setMessage(result.message);
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      setMessage("Account deletion could not finish. Try again in a moment.");
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
        className="inline-flex items-center gap-2 border border-coral px-4 py-2.5 text-control text-coral transition-colors hover:bg-coral hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {pending ? "Deleting…" : "Delete account"}
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
