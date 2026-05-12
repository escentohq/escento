import { Section } from "@/components/mockups/_shared/Section";

const COLS = [
  {
    n: "01",
    title: "For venues",
    body: "Post gigs in 60 seconds. Filter by genre, budget, distance. Lock the lineup.",
  },
  {
    n: "02",
    title: "For musicians",
    body: "One profile. Real gigs. Direct payment. No commissions skimmed.",
  },
  {
    n: "03",
    title: "For the scene",
    body: "Local-first discovery. Surface working artists, not influencer rosters.",
  },
];

export function Pitch() {
  return (
    <Section>
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
        {COLS.map((c) => (
          <div key={c.n} className="border-t-2 border-neutral-900 pt-6">
            <span className="font-mono text-sm text-neutral-500">{c.n}</span>
            <h3 className="mt-3 text-2xl font-bold">{c.title}</h3>
            <p className="mt-3 leading-relaxed text-neutral-700">{c.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
