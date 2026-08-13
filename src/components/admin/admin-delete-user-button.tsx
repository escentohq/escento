"use client";

import { useState, useTransition } from "react";

import { adminDeleteUserAction } from "@/app/admin/actions";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
};

export function AdminDeleteUserButton({ userId, userEmail, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const displayName = userName || userEmail || userId;

  function submit() {
    setError(null);
    const formData = new FormData();
    formData.set("targetId", userId);
    formData.set("targetEmail", userEmail ?? "");
    formData.set("reason", reason);
    formData.set("confirmation", confirmation);

    startTransition(async () => {
      try {
        await adminDeleteUserAction(formData);
        setOpen(false);
        setReason("");
        setConfirmation("");
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "User could not be deleted.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-9 items-center  border border-[#FF3366]/40 px-3 text-xs font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
      >
        Delete account
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0F172A]/50"
            aria-label="Close delete account dialog"
            onClick={() => setOpen(false)}
            disabled={isPending}
          />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-lg  border border-[#F1F5F9] bg-white p-6 shadow-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
              Permanent delete
            </span>
            <h2 className="mt-2 text-xl font-black text-[#0F172A]">Delete this account?</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
              This permanently deletes the auth user, app account, profiles, gigs, messages, requests, blocks, and profile picture files for <span className="font-bold text-[#0F172A]">{displayName}</span>. This cannot be undone.
            </p>

            <label className="mt-5 block text-sm font-bold text-[#0F172A]">
              Optional reason
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Spam, requested deletion, test account cleanup, other"
                className="mt-2 min-h-24"
              />
            </label>

            <label htmlFor={`delete-confirm-${userId}`} className="mt-4 block text-sm font-bold text-[#0F172A]">
              Type DELETE to confirm
              <input
                id={`delete-confirm-${userId}`}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-2 w-full  border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] outline-none transition-colors focus:border-[#0055FF] focus:ring-4 focus:ring-[#0055FF]/10"
                autoComplete="off"
              />
            </label>

            {error ? <p className="mt-4 text-sm font-bold text-[#B42318]" role="alert">{error}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="inline-flex min-h-11 items-center justify-center  border-2 border-[#E2E8F0] px-5 text-sm font-bold text-[#0F172A] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isPending || confirmation !== "DELETE"}
                className="inline-flex min-h-11 items-center justify-center  bg-[#FF3366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#D92D57] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
