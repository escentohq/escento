import Link from "next/link";

const tiles = ["Composer reel", "Jazz trio", "Game audio", "Choir vocals", "Synth score", "Live keys"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#f2f5f8] text-[#111111]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7c3aed]">Portfolio-led discovery</p>
            <h1 className="mt-5 text-5xl font-bold leading-tight sm:text-7xl">Hear enough to make the next move.</h1>
            <p className="mt-6 text-lg leading-8 text-[#5c6470]">
              This concept treats profile links as the star, making the site feel like a curated wall of student work.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/musicians" className="bg-[#111111] px-5 py-3 text-sm font-bold text-white">Browse work</Link>
              <Link href="/profile/create" className="border border-[#111111] px-5 py-3 text-sm font-bold">Add profile</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((tile, index) => (
              <article key={tile} className={`aspect-[4/3] p-4 ${index % 3 === 0 ? "bg-[#c4f1be]" : index % 3 === 1 ? "bg-white" : "bg-[#ffd6a5]"} border border-[#cbd5df]`}>
                <div className="flex h-full flex-col justify-between">
                  <span aria-hidden="true">+</span>
                  <h2 className="text-xl font-bold">{tile}</h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
