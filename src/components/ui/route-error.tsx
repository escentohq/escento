"use client";

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full border-y border-[#CBD5E1] py-10">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FF3366]">
          Page error
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#0F172A]">
          This page could not load.
        </h2>
        <p className="mt-3 leading-relaxed text-[#475569]">
          Try again. If it still fails, contact support.
        </p>
        <button type="button" onClick={reset} className="control-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}
