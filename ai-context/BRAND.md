# BRAND.md — GigForge

## Voice

Confident. Cultural. Performance-energy. Talks like a senior music supervisor, not a sales page.

**Feels like:** a tour poster, a campus radio bumper, a late-night studio session.
**Does not feel like:** generic SaaS, enterprise marketing, crypto-dashboard, university IT.

## Tagline

> **Take the Stage.**

This is the canonical headline framing. Variations are fine for sub-pages but the verb-first, two-word, period-terminated rhythm should be preserved. Examples that fit:

- *Make Some Noise.*
- *Run the Set.*
- *Cue the Lights.*

## Copy patterns

Short. High-confidence. Active voice. Names the next action.

### Do / don't

| Do | Don't |
|---|---|
| "Find your next collaborator." | "Discover top-tier student talent on our platform." |
| "Take the Stage." | "Welcome to GigForge — your one-stop solution for music collaboration." |
| "Now playing" | "Featured users" |
| "Browse Musicians" | "Click here to view available musicians" |
| "Post a Gig" | "Create a new gig opportunity" |
| "Open" / "Filled" | "Active" / "Inactive" |
| "Three-week turnaround. Great for portfolio building." | "We are seeking a highly motivated composer for collaboration." |
| "UT Austin junior. Film scoring focus." | "Talented multi-instrumentalist with extensive experience." |

### Sentence shape

- Front-load the verb or the subject. ("Need someone who can write sparse orchestral cues.")
- Fragments are fine. ("Rough cut ready. Three-week turnaround.")
- Specifics over adjectives. ("Tracked on four student shorts this semester" beats "very experienced".)
- Numbers stay numerals when small and concrete. ("3 weeks", "$200", "10-minute short").

## Eyebrow / label vocabulary

Approved short labels for section eyebrows, status pills, and small headers. Use these before inventing new ones.

- `Live and loud`
- `Now playing`
- `Spotlight`
- `Connect`
- `Create`
- `Available` (musician availability)
- `Open` (gig status)
- `Filled` (gig status — replaces "Closed" in UI)
- `On stage`
- `Backstage`
- `Soundcheck`

Style: `font-mono text-xs font-bold uppercase tracking-[0.2em]`. See [`DESIGN.md`](./DESIGN.md) §Typography.

## Forbidden phrases

Do not generate copy containing these words or constructions:

- "leverage", "synergy", "ecosystem", "solution", "robust", "seamless", "cutting-edge", "next-gen", "world-class", "best-in-class", "revolutionize", "unlock", "empower"
- "Welcome to [Product]"
- "Click here"
- "Lorem ipsum" — write real placeholder copy instead, even for mocks
- Hashtags, `@`-handles as decoration, marketing emoji (🚀 🎵 ✨)

## Status labels (data → display)

| Enum / state | Display |
|---|---|
| `GigStatus = "OPEN"` | **Open** |
| `GigStatus = "CLOSED"` | **Filled** (not "Closed") |
| Musician available | **Available** |
| `CompensationType = "PAID"` | **Paid** |
| `CompensationType = "UNPAID"` | **Unpaid + Credit** |
| `CompensationType = "NEGOTIABLE"` | **Open to talk** |
| `ProjectType = "FILM"` | **Film** |
| `ProjectType = "LIVE_EVENT"` | **Live event** |
| `ProjectType = "PODCAST"` | **Podcast** |
| `ProjectType = "GAME"` | **Game** |
| `ProjectType = "YOUTUBE"` | **YouTube** |
| `ProjectType = "OTHER"` | **Other** |

## Empty-state copy patterns

Pattern: **One short sentence describing the void → one CTA labeled with the next concrete action.**

- `/musicians` empty after filter → "No one matches yet." + `Clear filters`
- `/musicians` empty cold → "Nobody on stage yet." + `Create Profile` (when authed musician)
- `/gigs` empty → "No open gigs right now." + `Post a Gig` (when authed creator)
- `/gigs/manage` empty → "You haven't posted anything yet." + `Post a Gig`

Never: "Oops!", "It looks like…", "Sorry, no results found."

## Microcopy for forms

- Submit labels: `Save`, `Publish Gig`, `Update Gig`, `Create Profile`, `Mark Filled`, `Delete`.
- Pending: append `…` (`Saving…`, `Publishing…`).
- Cancel link reads `Cancel` and routes back to the relevant index.
- Required-field marker: a small `*` after the label, not the word "required".

## Email subject for `mailto:` links

- Gig contact: `GigForge: <title>` (URL-encoded).
- Musician contact: no subject (let the user write their own).

## Meta / SEO copy (when adding `<Metadata>`)

- Title pattern: `<Page> · GigForge`.
- Description: ≤ 155 chars, ends with a period, uses the voice above. Example: *"Find student musicians for your next film, podcast, or live show. Post a gig in two minutes."*
