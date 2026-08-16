# BRAND.md — Escento

## Voice

Direct, concise, plainspoken, and specific. Write like a founder explaining the product to a user, not like a sales page.

[`/docs/COPY_STYLE.md`](../COPY_STYLE.md) is the canonical guide for all user-facing text. This document retains product vocabulary and status-label guidance.

## Tagline

Escento has no default tagline. Describe the product or the current action directly.

## Copy patterns

Short. High-confidence. Active voice. Names the next action.

### Do / don't

| Do | Don't |
|---|---|
| "Find musicians who fit the project." | "Discover top-tier student talent on our platform." |
| "Post a gig and say what you need." | "Welcome to Escento, your one-stop solution for music collaboration." |
| "Musicians" | "Now playing" |
| "Browse musicians" | "Click here to view available musicians" |
| "Post a gig" | "Create a new gig opportunity" |
| "Open" / "Filled" | "Active" / "Inactive" |
| "Three-week turnaround. Great for portfolio building." | "We are seeking a highly motivated composer for collaboration." |
| "UT Austin junior. Film scoring focus." | "Talented multi-instrumentalist with extensive experience." |

### Sentence shape

- Front-load the verb or the subject. ("Need someone who can write sparse orchestral cues.")
- Fragments are fine. ("Rough cut ready. Three-week turnaround.")
- Specifics over adjectives. ("Tracked on four student shorts this semester" beats "very experienced".)
- Numbers stay numerals when small and concrete. ("3 weeks", "$200", "10-minute short").

## Eyebrow and label vocabulary

Eyebrows should identify the section: `Musicians`, `Open gigs`, `Messages`, `Settings`, `Support`, or `Admin`. Do not use music metaphors as a default label pattern.

Status labels remain `Available`, `Open`, and `Filled` (not `Closed` in UI).

Style: `font-mono text-xs font-bold uppercase tracking-[0.2em]`. See [`DESIGN.md`](./DESIGN.md) §Typography.

## Forbidden phrases

Do not generate copy containing these words or constructions:

- "leverage", "synergy", "ecosystem", "solution", "robust", "seamless", "cutting-edge", "next-gen", "world-class", "best-in-class", "revolutionize", "unlock", "empower"
- "Welcome to [Product]"
- Em dashes in user-facing copy
- Forced music metaphors such as "soundcheck," "backstage," "quiet room," or "lost in the mix"
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

Pattern: **One short sentence describing the empty state, then one CTA with the next concrete action.**

- `/musicians` empty after filter: "No musicians match." + `Clear filters`
- `/musicians` empty cold: "No musician profiles yet." + `Create profile` (when signed in as a musician)
- `/gigs` empty: "No open gigs right now." + `Post a gig` (when signed in as a creator)
- `/gigs/manage` empty: "No gigs posted yet." + `Post a gig`

Never: "Oops!", "It looks like…", "Sorry, no results found."

## Microcopy for forms

See [`FORMS.md`](./FORMS.md) for full patterns. Error copy table:

| Situation | Copy pattern | Example |
|---|---|---|
| Empty required | `Add a {field}.` | "Add a title." |
| Invalid email | `Enter a valid email address.` | |
| Invalid URL | `Enter a valid URL starting with https://` | |
| Length | `Keep the {field} under {n} characters.` | |
| Password rules | Mirror `getPasswordRequirements()` labels | |
| Auth failure | `That email or password isn't right.` | |
| Multi-field submit | `Fix {n} fields to continue.` | |
| Server failure | Name the failed action and offer a next step. | Never raw Supabase strings |

Forbidden for field errors: "ERROR", "Invalid input", "Wrong", "Failed validation", "Oops".

- Submit labels: `Save`, `Publish gig`, `Update gig`, `Create profile`, `Mark filled`, `Delete`.
- Pending: append `…` (`Saving…`, `Publishing…`).
- Cancel link reads `Cancel` and routes back to the relevant index.
- Required-field marker: a small `*` after the label, not the word "required".

## Messaging Request Copy

- Gig contact: use a connection request with context like `Reached out about your gig: <title>`.
- Musician contact: use a connection request from the public profile. Do not create separate gig-specific threads.

## Meta / SEO copy (when adding `<Metadata>`)

- Title pattern: `<Page> | Escento`.
- Description: ≤ 155 characters, ends with a period, and describes the page plainly. Example: *"Find musicians, post gigs, and message people directly on Escento."*
