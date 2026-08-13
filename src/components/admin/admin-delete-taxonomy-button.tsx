"use client";

import { useState, useTransition } from "react";

import { adminDeleteTaxonomyTermAction } from "@/app/admin/actions";
import type { TaxonomyKind } from "@/lib/api/admin-taxonomy";

type Props = {
  id: string;
  name: string;
  kind: TaxonomyKind;
  usageCount: number;
};

export function AdminDeleteTaxonomyButton({ id, name, kind, usageCount }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const confirmed = window.confirm(
      usageCount > 0
        ? `Remove "${name}" and detach it from ${usageCount} profile/gig tag links?`
        : `Remove "${name}"?`,
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", id);
    formData.set("kind", kind);
    setError(null);

    startTransition(async () => {
      try {
        await adminDeleteTaxonomyTermAction(formData);
      } catch {
        setError("Could not remove this term.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="inline-flex min-h-9 items-center  border border-[#FF3366]/40 px-3 text-xs font-bold text-[#FF3366] transition-colors hover:bg-[#FF3366]/10 disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
      {error ? <p className="text-xs font-bold text-[#B42318]" role="alert">{error}</p> : null}
    </div>
  );
}
