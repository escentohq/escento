import Link from "next/link";

const tags = ["score", "session", "voice", "strings", "beats", "live set"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#231f20] text-[#f8f0df]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-[#f5bf49]">press play on the project</p>
          <h1 className="mt-5 text-5xl font-black leading-[0.96] sm:text-7xl">
            Match the brief to the sound.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#d9cab3]">
            An analog-inspired direction that feels musical without burying the practical marketplace workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gigs/create" className="inline-flex items-center gap-2 bg-[#f5bf49] px-5 py-3 text-sm font-black text-[#231f20]">Play Post gig</Link>
            <Link href="/musicians" className="inline-flex items-center gap-2 border border-[#f8f0df] px-5 py-3 text-sm font-black">Rewind Browse</Link>
          </div>
        </div>
        <div className="rounded-[8px] border-4 border-[#f8f0df] bg-[#3c3535] p-6">
          <div className="rounded-[8px] bg-[#171414] p-4">
            <div className="h-28 rounded-[8px] border border-[#f5bf49] bg-[#f8f0df] p-4 text-[#231f20]">
              <p className="font-mono text-xs">GIGFORGE MIX 01</p>
              <p className="mt-6 text-2xl font-black">Student musicians for real creative briefs</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="rounded-full border border-[#6d625c] px-3 py-1 text-sm">{tag}</span>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
