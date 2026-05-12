# Shared Tags and Filtering

## Feature Summary
Instrument and genre tags power both musician discovery and gig discovery. They are created on demand from CSV input and queried through relation filters.

## Product Intent
- Let users describe themselves and needs in natural language.
- Avoid a rigid taxonomy during MVP discovery.
- Reuse tags across both sides of the marketplace.

## Source Code Patterns

```ts
// CSV parsing appears in profile and gig actions
function parseCsv(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " "));
}
```

```ts
// Ensure-or-create pattern
const ensuredInstruments = await Promise.all(
  instruments.map(async (name) => {
    const existing = await tx.instrument.findFirst({ where: { name } });
    return existing ?? tx.instrument.create({ data: { name } });
  }),
);
```

```tsx
// Directory relation filter
where: {
  ...(instrument ? { instruments: { some: { instrument: { name: instrument } } } } : {}),
  ...(genre ? { genres: { some: { genre: { name: genre } } } } : {}),
}
```

## How It Works
Users type comma-separated instruments and genres. Server actions trim and normalize whitespace, then look up exact tag names. Missing tags are created. Join rows connect tags to the profile or gig.

Directory pages fetch all tag names for filter dropdowns and use relation filters to find matching profiles or gigs.

## Implementation Details for an LLM
If improving tags, start with normalization. A common approach is to add a `slug` column with lowercase, trimmed, single-space text and a unique constraint. Display names can preserve casing while filters use slugs.

## Issues and Improvements
- Exact name matching creates duplicates.
- No autocomplete or suggestions.
- No tag usage counts.
- No cleanup for orphaned tags after gigs are deleted or profiles updated.
- No `+N more` indicator when cards truncate tags.

