import Link from "next/link";

const rows = [
  ["Project", "Short film score", "Open"],
  ["Needs", "Cello, ambient synth", "3 matches"],
  ["Deadline", "April 18", "Direct email"],
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#eef1f3] text-[#111827]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-7xl px-6 py-8">
        <nav className="flex items-center justify-between border-b border-[#cbd5df] pb-4">
          <span className="text-lg font-semibold">GigForge</span>
          <Link href="/signin" className="border border-[#111827] px-4 py-2 text-sm font-semibold">Sign in</Link>
        </nav>
        <div className="grid gap-10 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#466173]">Built for student projects</p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight sm:text-7xl">
              A calmer way to find collaborators before the deadline.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#51606d]">
              Structured profiles and gig listings replace group-chat chaos with clear filters, portfolio links, and direct contact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/gigs" className="bg-[#111827] px-5 py-3 text-sm font-semibold text-white">Browse gigs</Link>
              <Link href="/profile/create" className="border border-[#111827] px-5 py-3 text-sm font-semibold">Create profile</Link>
            </div>
          </div>
          <div className="border border-[#b8c3ce] bg-white">
            <div className="grid grid-cols-3 border-b border-[#d8e0e7] bg-[#f8fafc] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              <span>Field</span><span>Example</span><span>Status</span>
            </div>
            {rows.map((row) => (
              <div key={row[0]} className="grid grid-cols-3 border-b border-[#e5ebf0] px-4 py-5 text-sm last:border-b-0">
                <span className="font-semibold">{row[0]}</span><span>{row[1]}</span><span className="text-[#047857]">{row[2]}</span>
              </div>
            ))}
            <div className="grid gap-4 border-t border-[#d8e0e7] p-5 sm:grid-cols-3">
              {[
                ["01", "Filter people"],
                ["02", "Post briefs"],
                ["03", "Contact directly"],
              ].map(([number, label]) => (
                <div key={label} className="bg-[#eef1f3] p-4">
                  <span className="mb-4 block text-sm font-bold text-[#466173]">{number}</span>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
