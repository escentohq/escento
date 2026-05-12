const STEPS = [
  { cmd: "> post_gig", out: "creator defines: project, deadline, instruments, email" },
  { cmd: "> filter", out: "musicians are browsed by instrument and genre" },
  { cmd: "> contact", out: "conversation moves directly to email" },
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
