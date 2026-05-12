# Gig Detail and Contact

## Feature Summary
The gig detail page displays full listing information and lets musicians contact the creator by email with a prefilled subject.

## Product Intent
- Make each listing understandable enough for direct outreach.
- Keep contact out of the platform and in email.
- Preserve closed gigs as directly reachable records.

## Route and Files
- `/gigs/[id]`
- `src/app/gigs/[id]/page.tsx`
- `src/app/gigs/_ui.tsx`

## Relevant Source Code

```tsx
const gig = await db.gig.findUnique({
  where: { id },
  include: {
    creator: { select: { name: true, email: true } },
    instruments: { include: { instrument: true } },
    genres: { include: { genre: true } },
  },
});

if (!gig) notFound();
```

```tsx
<span className={gig.status === "CLOSED" ? "badge-status-closed" : "badge-status-open"}>
  {gig.status}
</span>
<span>{gig.projectType.replace("_", " ")}</span>
<span>{gig.isRemote ? "Remote option" : gig.location ? gig.location : "Location TBD"}</span>
<span>{gig.compensationType}</span>
```

```tsx
{gig.creator?.email ? (
  <a
    href={`mailto:${gig.creator.email}?subject=${encodeURIComponent(`GigForge: ${gig.title}`)}`}
    className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
  >
    Contact Creator
  </a>
) : null}
```

## How It Works
The route validates the ID by length, fetches the gig with its creator and tags, and returns 404 if missing. Unlike the directory, it does not filter out `CLOSED` gigs. This allows old manage links or shared URLs to keep working.

The contact button is a `mailto:` link to the creator's account email. The subject is URL-encoded as `GigForge: <gig title>`.

## Implementation Details for an LLM
Do not add messaging or applications to this page without explicit scope change. If adding richer contact behavior, preserve a direct-email fallback. Keep creator email selected explicitly instead of including the full user object.

## Issues and Improvements
- `status` displays raw `CLOSED`; product copy should probably display `Filled`.
- Deadline uses `toLocaleDateString()` without a fixed locale/time-zone strategy.
- No owner controls appear on the detail page for the creator who owns the gig.
- No report/spam controls or moderation states exist.

