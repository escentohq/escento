import Link from "next/link";

export default function MockupsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Mockup Winner</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Only the selected direction has been promoted into this branch.
      </p>

      <div className="mt-10">
        <Link
          href="/mockups/partner-04"
          className="group flex max-w-xl flex-col rounded-xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-neutral-500">partner-04</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              winner
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold">Stagelight</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Social-first performance landing with cinematic 3D stage lighting.
          </p>
          <span className="mt-4 text-sm font-medium text-neutral-900 group-hover:underline">
            View →
          </span>
        </Link>
      </div>
    </main>
  );
}
