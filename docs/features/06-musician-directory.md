# Musician Directory and Filters

## Feature Summary
The musician directory lets anyone browse public musician profiles and filter by instrument or genre. It is anonymous by design and serves as the main discovery surface for creators.

## Product Intent
- Make student musicians discoverable without requiring visitors to sign in.
- Keep filters simple and shareable via query params.
- Show just enough profile information to decide whether to open the detail page.

## Route and Files
- `/musicians`
- `src/app/musicians/page.tsx`
- `src/app/musicians/_ui.tsx`

## Relevant Source Code

```tsx
// src/app/musicians/page.tsx
export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<{ instrument?: string; genre?: string }>;
}) {
  const { instrument, genre } = await searchParams;

  const [instruments, genres, profiles] = await Promise.all([
    db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.genre.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.musicianProfile.findMany({
      where: {
        ...(instrument ? { instruments: { some: { instrument: { name: instrument } } } } : {}),
        ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
      },
      include: {
        instruments: { include: { instrument: true } },
        genres: { include: { genre: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
```

```tsx
// Filter form
<form method="GET" className="grid gap-3 sm:grid-cols-3" action="/musicians">
  <select name="instrument" defaultValue={instrument ?? ""} className="select-base">
    <option value="">All instruments</option>
    {instruments.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
  </select>
  <select name="genre" defaultValue={genre ?? ""} className="select-base">
    <option value="">All genres</option>
    {genres.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
  </select>
  <button type="submit" className="btn-primary w-full">Apply filters</button>
</form>
```

```tsx
// Result card shape
<Link key={p.id} href={`/musicians/${p.id}`} className="card-hover group block p-5">
  <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white">{p.displayName}</h3>
  <p className="mt-1 text-xs text-zinc-500">{p.location ? p.location : "Location not specified"}</p>
  <span>{p.isRemote ? "Remote" : "In-person"}</span>
  {p.instruments.map((x) => x.instrument.name).slice(0, 3).map((name) => <Chip key={name}>{name}</Chip>)}
  {p.genres.map((x) => x.genre.name).slice(0, 3).map((name) => <Chip key={name}>{name}</Chip>)}
  <p>{p.bio ? clampText(p.bio, 160) : "No bio yet."}</p>
</Link>
```

## How It Works
The page reads `instrument` and `genre` from `searchParams`. It fetches filter options and profile results in parallel. The Prisma query conditionally adds relation filters only when query params exist.

The page also checks the session only to decide whether to show a create-profile CTA. Browsing itself does not require auth.

## Implementation Details for an LLM
Filters are GET-based and should remain bookmarkable. If adding more filters, extend the `searchParams` type, the Prisma `where` clause, and the form. Avoid introducing client-side filtering unless data is already fully loaded and small.

## Issues and Improvements
- Uses `<select>` for free-form tag lists; this may become unwieldy with many tags.
- Silently truncates tags to three without a `+N more` indicator.
- Case-sensitive tag duplicates can fragment filter results.
- No keyword search, remote filter, paid/unpaid filter, or pagination.
- The page uses legacy dark styling while the design docs now recommend bright tokens.

