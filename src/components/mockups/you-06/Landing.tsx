import Link from "next/link";

const stories = ["Short films seeking score", "Indie games needing texture", "Campus events booking live sets"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#fffdf7] text-[#1b1712]">
      <section className="mx-auto min-h-[calc(100vh-49px)] max-w-7xl px-6 py-10">
        <div className="border-b border-[#1b1712] pb-4 text-center font-serif text-2xl italic">GigForge Review</div>
        <div className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b23b2e]">A directory for campus sound</p>
            <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.94] sm:text-8xl">
              The next collaborator is probably three buildings away.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#655d52]">
              An editorial-feeling homepage that makes GigForge feel cultural, local, and human while keeping the actions direct.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/musicians" className="bg-[#1b1712] px-5 py-3 text-sm font-bold text-white">Read the directory</Link>
              <Link href="/gigs/create" className="border border-[#1b1712] px-5 py-3 text-sm font-bold">Submit a gig</Link>
            </div>
          </div>
          <aside className="border-l border-[#1b1712] pl-6">
            <p className="font-serif text-4xl italic">Now listing</p>
            <div className="mt-6 grid gap-5">
              {stories.map((story, index) => (
                <article key={story} className="border-t border-[#d6cec2] pt-5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b23b2e]">Feature 0{index + 1}</span>
                  <h2 className="mt-2 font-serif text-3xl">{story}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#655d52]">Browse anonymously, contact by email, keep the project moving.</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
