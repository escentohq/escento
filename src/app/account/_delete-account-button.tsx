"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  deleteAction: () => Promise<void>;
};

export function DeleteAccountButton({ deleteAction }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete() {
    setMessage(null);
    const confirmed = window.confirm(
      "Delete your account? All your data will be permanently removed. This cannot be undone.",
    );
    if (!confirmed) return;

    setPending(true);
    try {
      await deleteAction();
    } catch (error) {
      console.error(error);
      setMessage("Account deletion could not finish. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {message ? (
        <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {message}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#FF3366] px-4 py-2.5 text-sm font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "Deleting…" : "Delete Account"}
      </button>
    </div>
  );
}
