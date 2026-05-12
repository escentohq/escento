import Link from "next/link";

const musicians = ["Film composer", "Jazz vocalist", "Session drummer", "Cellist", "Beat producer", "Piano accompanist"];

export function Landing() {
  return (
    <main className="min-h-screen bg-white text-[#17202a]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-7xl px-6 py-8">
        <div className="grid gap-10 lg:grid-cols-[430px_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f766e]">Search-first landing</p>
            <h1 className="mt-5 text-5xl font-bold leading-tight sm:text-7xl">Start with who you need.</h1>
            <p className="mt-6 text-lg leading-8 text-[#5c6670]">
              GigForge turns the landing page into the product: filter student musicians and open gigs before signing in.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/musicians" className="bg-[#17202a] px-5 py-3 text-sm font-bold text-white">Explore directory</Link>
              <Link href="/gigs" className="border border-[#17202a] px-5 py-3 text-sm font-bold">View gigs</Link>
            </div>
          </div>
          <div className="border border-[#d5dde5] bg-[#f7fafc] p-4">
            <div className="flex items-center gap-3 border border-[#cbd5df] bg-white px-4 py-4">
              <span aria-hidden="true">search</span>
              <span className="text-sm text-[#66717d]">Search instruments, genres, or project types</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Instrument", "Genre", "Remote", "Deadline"].map((filter) => (
                <span key={filter} className="inline-flex items-center gap-2 border border-[#d5dde5] bg-white px-3 py-2 text-sm">+ {filter}</span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {musicians.map((name) => (
                <article key={name} className="border border-[#d5dde5] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold">{name}</h2>
                    <span className="text-[#0f766e]" aria-hidden="true">*</span>
                  </div>
                  <p className="mt-3 text-sm text-[#66717d]">Portfolio links / Availability / Contact email</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
