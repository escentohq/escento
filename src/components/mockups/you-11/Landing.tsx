import Link from "next/link";

export function Landing() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#c6ff4a]">GigForge</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.92] sm:text-8xl">
            Put the right musician in the room.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-400">
            A premium, stage-lit direction for positioning GigForge as simple, serious infrastructure for student creative work.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/musicians" className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-black">Find musicians <span aria-hidden="true">-&gt;</span></Link>
            <Link href="/gigs/create" className="border border-neutral-700 px-5 py-3 text-sm font-bold">Post a gig</Link>
          </div>
        </div>
        <div className="relative min-h-[420px] border border-neutral-800 bg-[#080808] p-6">
          <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#c6ff4a] opacity-20 blur-3xl" />
          <div className="relative grid h-full content-end gap-4">
            {["Open gig", "Matched profile", "Direct email"].map((item, index) => (
              <div key={item} className="flex items-center justify-between border border-neutral-800 bg-black/70 p-4">
                <span className="flex items-center gap-3"><span className="text-[#c6ff4a]" aria-hidden="true">*</span> {item}</span>
                <span className="text-sm text-neutral-500">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
