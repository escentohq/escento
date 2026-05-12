import Link from "next/link";

const roles = [
  { title: "I need music", text: "Post a film, podcast, event, or game brief and invite direct email replies." },
  { title: "I make music", text: "Publish one student profile with instruments, genres, portfolio links, and availability." },
];

export function Landing() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#15130f]">
      <section className="mx-auto grid min-h-[calc(100vh-49px)] max-w-7xl grid-cols-1 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 border border-[#15130f] bg-[#d7f275] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
            <span aria-hidden="true">GF</span> Student creative network
          </div>
          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.96] sm:text-7xl lg:text-8xl">
            Find the student musician your project is missing.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5c5549]">
            GigForge keeps discovery simple: browse musicians, post gigs, and move straight to email.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/musicians" className="inline-flex items-center gap-2 bg-[#15130f] px-5 py-3 text-sm font-bold text-white">
              Browse musicians <span aria-hidden="true">-&gt;</span>
            </Link>
            <Link href="/gigs/create" className="inline-flex items-center gap-2 border border-[#15130f] px-5 py-3 text-sm font-bold">
              Post a gig <span aria-hidden="true">+</span>
            </Link>
          </div>
        </div>
        <div className="mt-12 grid gap-4 lg:mt-0">
          <div className="border-2 border-[#15130f] bg-white p-5 shadow-[10px_10px_0_#15130f]">
            <div className="flex items-center gap-3 border-b border-[#d8d1c5] pb-4">
              <span aria-hidden="true">search</span>
              <span className="text-sm font-bold">Search: composer, cello, jazz keys</span>
            </div>
            <div className="mt-5 grid gap-3">
              {["Maya R. / Guitar + production / Chicago", "Theo L. / Film score / Remote", "Nina P. / Violin / Weekend shoots"].map((item) => (
                <div key={item} className="flex items-center justify-between border border-[#d8d1c5] bg-[#fbfaf6] p-3 text-sm">
                  <span>{item}</span>
                  <span className="font-bold">Email</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <article key={role.title} className="border border-[#15130f] bg-[#ffe178] p-5">
                <h2 className="text-xl font-black">{role.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#4d463b]">{role.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
