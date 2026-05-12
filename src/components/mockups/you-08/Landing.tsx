import Link from "next/link";

export function Landing() {
  return (
    <main className="min-h-screen bg-[#f6f9fb] text-[#24313d]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d9f0e3] px-4 py-2 text-sm font-semibold text-[#176346]">
              <span aria-hidden="true">+</span> Built for students helping students
            </div>
            <h1 className="mt-7 text-5xl font-bold leading-tight sm:text-7xl">
              Make campus collaboration feel less awkward.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#60707e]">
              A friendly landing page direction for making first contact feel approachable without turning GigForge into a social network.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signin" className="rounded-full bg-[#24313d] px-5 py-3 text-sm font-bold text-white">Get started</Link>
              <Link href="/musicians" className="rounded-full border border-[#b8c6d1] px-5 py-3 text-sm font-bold">Browse first</Link>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              ["Creator", "I need a warm piano theme for a documentary cut."],
              ["Musician", "I play keys, score shorts, and can meet Thursdays."],
              ["GigForge", "Portfolio link found. Email contact ready."],
            ].map(([label, text]) => (
              <article key={label} className="rounded-[8px] border border-[#d6e0e8] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-[#176346]">+ {label}</div>
                <p className="mt-3 text-xl leading-8">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
