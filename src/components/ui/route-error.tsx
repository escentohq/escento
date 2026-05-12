"use client";

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-6 py-24">
      <div className="w-full rounded-3xl border border-[#F1F5F9] bg-white p-10 text-center shadow-sm">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
          Something broke
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
          We dropped a beat.
        </h2>
        <p className="mt-3 font-medium leading-relaxed text-[#475569]">
          Try again. If it keeps happening, the route needs a closer look.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}

