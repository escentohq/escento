"use client";

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full border-y border-rule py-10">
        <h2 className="text-section-heading text-ink">
          This page could not load.
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Try again. If it still fails, contact support.
        </p>
        <button type="button" onClick={reset} className="control-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}
