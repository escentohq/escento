# Musician Public Profile and Contact

## Feature Summary
The public musician profile displays a musician's identity, bio, instruments, genres, experience, availability, portfolio links, contact email, and work preferences. Contact happens through direct `mailto:`.

## Product Intent
- Give creators a complete but skimmable musician profile.
- Keep the MVP out of messaging: email is the handoff.
- Make portfolio links visible without hosting files.

## Route and Files
- `/musicians/[id]`
- `src/app/musicians/[id]/page.tsx`
- `src/app/musicians/_ui.tsx`

## Relevant Source Code

```tsx
// src/app/musicians/[id]/page.tsx
function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

const profile = await db.musicianProfile.findUnique({
  where: { id },
  include: {
    instruments: { include: { instrument: true } },
    genres: { include: { genre: true } },
  },
});

if (!profile) notFound();
```

```tsx
const links: Array<{ label: string; url: string }> = [
  ...(profile.websiteUrl ? [{ label: "Website", url: profile.websiteUrl }] : []),
  ...(profile.youtubeUrl ? [{ label: "YouTube", url: profile.youtubeUrl }] : []),
  ...(profile.soundcloudUrl ? [{ label: "SoundCloud", url: profile.soundcloudUrl }] : []),
  ...(profile.spotifyUrl ? [{ label: "Spotify", url: profile.spotifyUrl }] : []),
  ...(profile.instagramUrl ? [{ label: "Instagram", url: profile.instagramUrl }] : []),
];
```

```tsx
// Contact card
<SectionCard title="Contact">
  <p className="text-sm text-zinc-300">Interested in working together?</p>
  <div className="mt-4 space-y-3">
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2">
      <div className="text-xs text-zinc-500">Email</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100 break-all">
        {profile.contactEmail ?? "Not provided"}
      </div>
    </div>
    {profile.contactEmail ? (
      <a href={`mailto:${profile.contactEmail}`} className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400">
        Contact Musician
      </a>
    ) : null}
  </div>
</SectionCard>
```

## How It Works
The route validates the dynamic ID with a simple length check, fetches the profile and joined tags, and returns `notFound()` if the ID is invalid or the profile does not exist.

Portfolio links are constructed from optional URL fields on the profile. The contact card displays the contact email if present and renders a plain `mailto:` link.

## Implementation Details for an LLM
Keep this page public. Do not add auth checks for viewing. If adding richer portfolio data, use the existing `PortfolioItem` relation and render it in the portfolio section. Preserve direct outbound links with `target="_blank"` and `rel="noreferrer"`.

## Issues and Improvements
- URL fields are not validated or normalized before rendering.
- `contactEmail` is nullable in Prisma but required in the current form, so older or seeded data can still lack it.
- There is no owner-only edit shortcut on the public profile.
- No profile visibility/privacy setting exists.
- The page does not include portfolio item records even though the schema has `PortfolioItem`.

