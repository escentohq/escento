import Link from "next/link";

export function Hero() {
  return (
    <header className="px-6 py-24 sm:py-40">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>gig-forge / v0.1 - live</span>
        </div>
        <h1 className="mt-8 text-4xl leading-tight sm:text-6xl">
          $ book_band <span className="text-emerald-400">--local</span>
          <span className="ml-1 inline-block h-[1em] w-[0.5ch] animate-pulse bg-emerald-400 align-middle" />
        </h1>
        <p className="mt-8 text-neutral-400">
          // Direct discovery. No feeds. No middlemen.
        </p>
        <p className="mt-2 text-neutral-400">
          // Built for student creators + musicians who need to ship.
        </p>
        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <Link
            href="/signin"
            className="rounded border border-emerald-400 px-4 py-2 text-emerald-400 transition hover:bg-emerald-400 hover:text-neutral-950"
          >
            [&nbsp;sign in&nbsp;]
          </Link>
          <Link
            href="/musicians"
            className="rounded border border-neutral-700 px-4 py-2 text-neutral-300 transition hover:border-neutral-300"
          >
            [&nbsp;browse&nbsp;]
          </Link>
        </div>
      </div>
    </header>
  );
}
