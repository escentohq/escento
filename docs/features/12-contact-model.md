# Direct Email Contact Model

## Feature Summary
Escento's contact model is deliberately simple: detail pages expose `mailto:` links. There is no in-app messaging, no inbox, no notifications, and no application workflow.

## Product Intent
- Minimize MVP complexity.
- Shorten the path from discovery to real-world collaboration.
- Avoid building social-network mechanics.

## Routes and Source
- Musician contact: `/musicians/[id]`
- Creator contact: `/gigs/[id]`

```tsx
// Musician profile contact
{profile.contactEmail ? (
  <a href={`mailto:${profile.contactEmail}`} className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400">
    Contact Musician
  </a>
) : null}
```

```tsx
// Gig detail contact
{gig.creator?.email ? (
  <a href={`mailto:${gig.creator.email}?subject=${encodeURIComponent(`Escento: ${gig.title}`)}`}>
    Contact Creator
  </a>
) : null}
```

## How It Works
Musicians provide a `contactEmail` in their profile. Creators use the email from their authenticated account. The app renders email addresses visibly and provides a mailto CTA. The gig route includes a subject line with the gig title; the musician route uses a plain mailto link.

## Implementation Details for an LLM
When extending contact, do not accidentally add messaging. Safer incremental improvements include subject/body templates, copy-email buttons, or contact visibility controls. Any user-to-user communication stored in the app would be a major scope change.

## Issues and Improvements
- Exposing raw email addresses can invite scraping.
- Musician and gig contact experiences are inconsistent; one has a subject, one does not.
- No contact tracking or analytics exist.
- No abuse reporting or moderation layer exists.

