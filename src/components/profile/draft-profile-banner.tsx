import Link from "next/link";

/**
 * Shown on the owner's own `/musicians/[id]` when the profile is saved but not
 * yet launch-ready. Anonymous visitors never reach this page for a draft — they
 * get the branded 404 — so this is a preview, not a public listing.
 */
export function DraftProfileBanner() {
  return (
    <aside className="mb-8 flex flex-col gap-4 border-y border-rule bg-surface px-1 py-5 md:flex-row md:items-center md:justify-between md:px-4">
      <div className="min-w-0">
        <p className="text-meta uppercase text-brand">Not listed yet</p>
        <p className="mt-2 text-body text-ink">
          This is your draft. Creators cannot find it until you add an instrument or genre and a bit of context.
        </p>
      </div>
      <Link
        href="/profile/create"
        className="shrink-0 text-control text-brand transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        Continue setup
      </Link>
    </aside>
  );
}
