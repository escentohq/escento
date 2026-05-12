const STEPS = [
  { cmd: "> post_gig", out: "venue defines: date, genre, budget, capacity" },
  { cmd: "> match", out: "musicians within radius apply directly" },
  { cmd: "> book", out: "venue locks lineup. payment flows direct." },
];

export function Steps() {
  return (
    <section className="border-t border-neutral-800 px-6 py-20">
      <div className="mx-auto max-w-3xl space-y-6">
        {STEPS.map((s, i) => (
          <div key={i} className="border-l-2 border-emerald-400 pl-4">
            <p className="text-emerald-400">{s.cmd}</p>
            <p className="mt-1 text-neutral-400">{s.out}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
