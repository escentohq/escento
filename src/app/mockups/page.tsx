import Link from "next/link";

type Mockup = {
  slug: string;
  title: string;
  author: "you" | "partner";
  blurb: string;
  status: "wip" | "ready" | "draft";
};

const MOCKUPS: Mockup[] = [
  { slug: "you-01", title: "Bold Editorial", author: "you", blurb: "Big serif, brutalist grid", status: "ready" },
  { slug: "you-02", title: "Campus Signal", author: "you", blurb: "Focused marketplace, split role paths", status: "ready" },
  { slug: "you-03", title: "Studio Ledger", author: "you", blurb: "Operational, dense, trust-forward", status: "ready" },
  { slug: "you-04", title: "Poster Wall", author: "you", blurb: "Campus flyer energy with structured CTAs", status: "ready" },
  { slug: "you-05", title: "Clean Directory", author: "you", blurb: "Search-first product surface", status: "ready" },
  { slug: "you-06", title: "Indie Magazine", author: "you", blurb: "Editorial music culture with sharp cards", status: "ready" },
  { slug: "you-07", title: "Finder Console", author: "you", blurb: "Fast command-center for projects", status: "ready" },
  { slug: "you-08", title: "Soft Campus", author: "you", blurb: "Warm approachable student network", status: "ready" },
  { slug: "you-09", title: "Tape Deck", author: "you", blurb: "Analog music motif, modern funnel", status: "ready" },
  { slug: "you-10", title: "Portfolio Grid", author: "you", blurb: "Visual creator-first discovery", status: "ready" },
  { slug: "you-11", title: "Black Box", author: "you", blurb: "Premium minimalist, stage-lit", status: "ready" },
  { slug: "partner-01", title: "Dark Minimal", author: "partner", blurb: "Monospace, single-column", status: "draft" },
  { slug: "partner-02", title: "Studio Console", author: "partner", blurb: "Pitch-dark studio console, single warm accent", status: "ready" },
  { slug: "partner-03", title: "Paper & Ink", author: "partner", blurb: "Warm editorial broadsheet with a rotating headline", status: "ready" },
  { slug: "partner-04", title: "Stagelight", author: "partner", blurb: "Single CSS spotlight, theater metaphor", status: "ready" },
  { slug: "partner-07", title: "Campus Network", author: "partner", blurb: "LinkedIn-grade professional, 2-col mini-directory hero", status: "ready" },
  { slug: "partner-05", title: "Profile Stack", author: "partner", blurb: "LinkedIn-style professional card stack", status: "ready" },
  { slug: "partner-06", title: "Open to Collaborate", author: "partner", blurb: "LinkedIn-style trust signal with an open-profile hero", status: "ready" },
  { slug: "partner-08", title: "Signal", author: "partner", blurb: "3D waveform mesh hero, electric orange marquee", status: "ready" },
  { slug: "partner-09", title: "Blueprint", author: "partner", blurb: "Technical drawing grid with a 3D exploded profile card", status: "ready" },
  { slug: "partner-10", title: "Stage", author: "partner", blurb: "Concert venue Three.js scene, violet & gold, Cormorant serif", status: "ready" },
  { slug: "partner-11", title: "Mosaic", author: "partner", blurb: "3D floating bulletin board, 6-slot color identity, Fraunces variable font", status: "ready" },
];

export default function MockupGallery() {
  const grouped = {
    you: MOCKUPS.filter((m) => m.author === "you"),
    partner: MOCKUPS.filter((m) => m.author === "partner"),
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Landing Page Mockups</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Competing directions. Open any to view full-page. Each lives in its own folder — zero
        cross-contamination. Promote winner via the migration steps in <code className="rounded bg-neutral-200 px-1">README.md</code>.
      </p>

      {(["you", "partner"] as const).map((author) => (
        <section key={author} className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            {author === "you" ? "Your mockups" : "Partner mockups"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[author].map((m) => (
              <Link
                key={m.slug}
                href={`/mockups/${m.slug}`}
                className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-500">{m.slug}</span>
                  <StatusBadge status={m.status} />
                </div>
                <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{m.blurb}</p>
                <span className="mt-4 text-sm font-medium text-neutral-900 group-hover:underline">
                  View →
                </span>
              </Link>
            ))}
            <NewMockupCard author={author} nextIndex={grouped[author].length + 1} />
          </div>
        </section>
      ))}
    </main>
  );
}

function StatusBadge({ status }: { status: Mockup["status"] }) {
  const styles = {
    draft: "bg-neutral-100 text-neutral-600",
    wip: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
  }[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>{status}</span>;
}

function NewMockupCard({ author, nextIndex }: { author: "you" | "partner"; nextIndex: number }) {
  const slug = `${author}-${String(nextIndex).padStart(2, "0")}`;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">
      <code className="font-mono text-xs">{slug}</code>
      <p className="mt-2">Copy <code className="rounded bg-neutral-100 px-1">_template/</code> →{" "}
        <code className="rounded bg-neutral-100 px-1">{slug}/</code>
      </p>
    </div>
  );
}
