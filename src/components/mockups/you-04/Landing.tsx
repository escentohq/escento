import Link from "next/link";

const cards = ["Composer for senior film", "Bassist for launch party", "Singer for podcast theme", "Violin for game trailer"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#f8efe1] text-[#17120b]">
      <section className="relative min-h-[calc(100vh-49px)] overflow-hidden px-6 py-10">
        <div className="absolute inset-x-0 top-28 -z-0 h-28 rotate-[-2deg] bg-[#ff5a3d]" />
        <div className="absolute inset-x-0 bottom-20 -z-0 h-24 rotate-[1deg] bg-[#57c7ff]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="border-4 border-[#17120b] bg-[#f8efe1] p-6 shadow-[12px_12px_0_#17120b] sm:p-10">
              <p className="font-mono text-sm uppercase tracking-[0.24em]">GigForge campus board</p>
              <h1 className="mt-5 text-6xl font-black uppercase leading-[0.9] sm:text-8xl">
                Projects need sound. Students need gigs.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8">
                A digital flyer wall for finding student musicians, listing creative gigs, and jumping straight to contact.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/gigs/create" className="border-2 border-[#17120b] bg-[#f8e44f] px-5 py-3 font-black uppercase">Post the gig</Link>
                <Link href="/musicians" className="border-2 border-[#17120b] bg-white px-5 py-3 font-black uppercase">Find talent</Link>
              </div>
            </div>
            <div className="grid rotate-1 gap-4">
              {cards.map((card, index) => (
                <article key={card} className={`border-4 border-[#17120b] p-5 shadow-[7px_7px_0_#17120b] ${index % 2 ? "bg-[#b8ef7d]" : "bg-white"}`}>
                  <span className="font-mono text-xs">OPEN GIG 0{index + 1}</span>
                  <h2 className="mt-3 text-2xl font-black">{card}</h2>
                  <p className="mt-2 text-sm">Remote or campus / portfolio links welcome</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
