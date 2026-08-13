"use client";

import { Shield, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { blockUser, unblockUser } from "@/app/messages/actions";

export function BlockUserButton({
  userId,
  initiallyBlocked,
  compact = false,
}: {
  userId: string;
  initiallyBlocked: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const Icon = blocked ? ShieldOff : Shield;

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        if (blocked) {
          await unblockUser(userId);
          setBlocked(false);
        } else {
          await blockUser(userId);
          setBlocked(true);
        }
        router.refresh();
      } catch {
        setError(blocked ? "Could not unblock this user." : "Could not block this user.");
      }
    });
  }

  return (
    <div className={compact ? "space-y-1" : "mt-3 space-y-2"}>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-2  border-2 px-4 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${
          compact ? "min-h-10" : "min-h-11 w-full"
        } ${
          blocked
            ? "border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]"
            : "border-[#FF3366] text-[#FF3366] hover:bg-[#FF3366]/10"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {isPending ? "Working..." : blocked ? "Unblock" : "Block"}
      </button>
      {error ? <p className="text-sm font-medium text-[#B42318]" role="alert">{error}</p> : null}
    </div>
  );
}
