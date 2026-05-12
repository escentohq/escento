# Gig Directory and Filters

## Feature Summary
The gig directory lets anyone browse currently open creative opportunities and filter by project type, instrument, and genre. It is the main discovery route for musicians.

## Product Intent
- Let musicians find opportunities without signing in.
- Keep only open gigs in the browsing surface.
- Use structured filters that match the gig creation form.

## Route and Files
- `/gigs`
- `src/app/gigs/page.tsx`
- `src/app/gigs/_ui.tsx`

## Relevant Source Code

```tsx
const PROJECT_TYPES = ["FILM", "LIVE_EVENT", "PODCAST", "GAME", "YOUTUBE", "OTHER"] as const;

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectType?: string; instrument?: string; genre?: string }>;
}) {
  const { projectType, instrument, genre } = await searchParams;

  const [instruments, genres, gigs] = await Promise.all([
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.gig.findMany({
      where: {
        ...(projectType ? { projectType: projectType as never } : {}),
        ...(instrument ? { instruments: { some: { instrument: { name: instrument } } } } : {}),
        ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
        status: "OPEN",
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
}
```

```tsx
<form method="GET" className="grid gap-3 sm:grid-cols-4" action="/gigs">
  <select name="projectType" defaultValue={projectType ?? ""} className="select-base">
    <option value="">All types</option>
    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
  </select>
  <select name="instrument" defaultValue={instrument ?? ""} className="select-base" />
  <select name="genre" defaultValue={genre ?? ""} className="select-base" />
  <button type="submit" className="btn-primary w-full">Apply</button>
</form>
```

```tsx
<Link key={g.id} href={`/gigs/${g.id}`} className="card-hover group block p-5">
  <h3>{g.title}</h3>
  <p>{g.projectType.replace("_", " ")}</p>
  <span>{g.compensationType}</span>
  <p>{g.isRemote ? "Remote" : g.location ? g.location : "Location TBD"}</p>
  <p>{clampText(g.description, 170)}</p>
  <span>View Gig →</span>
</Link>
```

## How It Works
The page builds a Prisma `where` object from optional query parameters, always adding `status: "OPEN"`. It loads filter options from shared tag tables and renders card results. If no gigs match, the empty state changes copy depending on whether filters are active.

The session is checked only to decide whether the `Post a Gig` CTA should appear. Anonymous users and creators see it; signed-in musicians do not.

## Implementation Details for an LLM
Keep the open-only invariant in the directory. Closed gigs should remain directly reachable by ID but should not appear in `/gigs`.

## Issues and Improvements
- `projectType` query values are cast with `as never`; invalid params should be ignored or rejected.
- No compensation filter even though compensation is important to musicians.
- No remote/in-person filter, search, deadline sorting, or pagination.
- Tag truncation has no `+N more`.
- Uses legacy dark card styling.

