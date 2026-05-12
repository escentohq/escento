import Link from "next/link";

const commands = ["find vocalist genre:r&b", "post gig project:podcast", "browse cello remote:true"];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#101010] text-[#f4f1e8]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3a3a3a] px-3 py-1 text-xs text-[#9ee493]">
            <span aria-hidden="true">*</span> live campus listings
          </div>
          <h1 className="mt-7 text-5xl font-semibold leading-tight sm:text-7xl">
            A command center for creative collaboration.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#b9b4a8]">
            Dark, utility-driven, and fast: ideal if GigForge should feel like an efficient tool for deadline-driven creators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gigs" className="inline-flex items-center gap-2 bg-[#9ee493] px-5 py-3 text-sm font-bold text-[#101010]">Open gigs <span aria-hidden="true">+</span></Link>
            <Link href="/musicians" className="border border-[#57534e] px-5 py-3 text-sm font-bold">Musicians</Link>
          </div>
        </div>
        <div className="border border-[#333] bg-[#171717] p-4 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#333] pb-3 text-sm text-[#b9b4a8]">cmd GigForge finder</div>
          <div className="mt-5 grid gap-3 font-mono text-sm">
            {commands.map((command) => (
              <div key={command} className="border border-[#333] bg-[#0d0d0d] p-4">
                <span className="text-[#9ee493]">$</span> {command}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Anonymous browsing", "Structured profiles", "Email handoff"].map((item) => (
              <div key={item} className="bg-[#232323] p-4 text-sm text-[#d9d3c5]">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
