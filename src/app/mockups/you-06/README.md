# Landing Design 06 - **Indie Magazine**

> I have art-directed small-run music publications, and the good ones never feel like content templates. They feel like somebody chose every rule, every margin, every caption. Indie Magazine makes GigForge feel like a campus arts periodical: local, curated, useful, and alive. The signature is a Three.js rotating magazine object, not because print is nostalgic, but because it turns student work into something worth publishing.

---

## 1. The Concept

Very light warm page. A 3D magazine floats in the hero, slowly rotating just enough to reveal cover, spine, and page block. The headline sits beside it like a feature story. A right-side column lists "Now listing" items as editorial blurbs. Below, article-style cards show project categories and direct actions.

This design frames GigForge as the publication of a campus creative scene.

## 2. Why This Direction

GigForge is not only a utility. It is also a way to reveal the creative life already happening around campus. Indie Magazine gives the platform taste and cultural context while keeping the workflow simple. It is softer and more literary than Bold Editorial, but still structured.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFDF7` | Warm editorial paper |
| `bg.page.alt` | `#F6EFE3` | Section bands |
| `mag.cover` | `#F2D6C9` | 3D magazine cover |
| `mag.spine` | `#B23B2E` | Magazine spine accent |
| `mag.pages` | `#FFF8EC` | Page block |
| `ink.primary` | `#1B1712` | Headlines |
| `ink.secondary` | `#655D52` | Body |
| `ink.muted` | `#9A8F80` | Captions |
| `accent.red` | `#B23B2E` | Kicker, issue labels |
| `accent.gold` | `#D6A84C` | Highlight rules |
| `border.rule` | `#1B1712` | Editorial rules |
| `shadow.paper` | `rgba(76,50,24,0.16)` | Magazine shadow |

The palette should feel like cream paper, red ink, and sunlit page edges.

## 4. Typography

- **Display:** Playfair Display 700, `clamp(54px, 7vw, 104px)`, leading `0.96`, tracking `-0.02em`.
- **Masthead:** Playfair Display Italic 28px.
- **Kicker:** Inter 800 11px uppercase tracking `+0.24em`, `accent.red`.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Listing headings:** Playfair Display 600, 30px.
- **Captions:** `font-mono` 11px uppercase.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
MASTHEAD: GigForge Review

LEFT
A DIRECTORY FOR CAMPUS SOUND
The next collaborator is probably three buildings away.
Editorial support copy
[ Read the directory ] [ Submit a gig ]

CENTER/RIGHT
3D magazine object
Now listing sidebar with 3 feature blurbs

BELOW
This week cards: Short films / Indie games / Campus events
```

Desktop can use a 60/40 split or three-column editorial grid. Mobile stacks masthead, headline, magazine, listings.

## 6. The Signature: Three.js Magazine Object

**Geometry:**
- Cover: `BoxGeometry(2.6, 3.6, 0.06)`, material `mag.cover`.
- Back cover: same size, slight Z offset.
- Page block: `BoxGeometry(2.5, 3.45, 0.28)`, material `mag.pages`.
- Spine: `BoxGeometry(0.18, 3.6, 0.36)`, material `mag.spine`.
- Add 12 thin page-line planes along the right edge, color `#E8DCC8`.

**Cover content:**
- Use `<Html transform>` on the cover:
```text
GIGFORGE REVIEW
Campus Sound Issue
142 musicians / 24 open gigs
```

**Motion:**
- Magazine floats at `[0, 0, 0]`.
- Rotate Y slowly: `Math.sin(t * 0.25) * 0.16`.
- Cursor tilts X/Y by up to `5deg`.
- Shadow ellipse beneath the magazine via a translucent plane.
- Reduced motion: static three-quarter angle.

## 7. Editorial Listings

Sidebar heading: `Now listing`.

Entries:
```text
Feature 01 / Short films seeking score
Feature 02 / Indie games needing texture
Feature 03 / Campus events booking live sets
```

Each has a top rule, red feature label, serif heading, and one sentence: `Browse anonymously, contact by email, keep the project moving.`

Framer entrance: opacity 0, `y: 18`, stagger `0.12`.

## 8. Article Cards

Three below-fold cards:
```text
Short films
Composers, string players, ambient producers.

Podcasts
Theme music, editing help, voice-friendly instrumentals.

Games
Loops, textures, UI sounds, trailer scoring.
```

Cards should be unrounded or 4px radius max, with thin editorial rules. Hover: underline title and shift image/magazine swatch by 4px.

## 9. CTAs

**Primary - `Read the directory`:**
```text
bg #1B1712
text #FFFDF7
height 52px
radius 0
padding x 26px
hover bg #B23B2E
```

**Secondary - `Submit a gig`:**
```text
bg transparent
text #1B1712
border-bottom 1px #1B1712
hover color #B23B2E, border-color #B23B2E
```

## 10. Stats

Set stats like a magazine contents line:

```text
142 musicians / 24 open gigs / 12 universities
```

Use inline editorial separators, not dashboard cards. Numbers can count up once in view, but keep animation understated.

## 11. Required Libraries

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `MagazineObject.tsx` is client-only via `dynamic(..., { ssr: false })`.
- Use `<Html transform>` sparingly for cover typography.
- Use a static DOM fallback card on mobile if the canvas text gets too small.
- Keep body text generous and readable. This concept lives or dies by editorial spacing.
- Avoid stock photography. The 3D magazine is the visual asset.

## 13. The Test

Print the hero screenshot in grayscale. It should still feel designed because the grid, type, and rules carry the identity. Then view it in color. The red spine and labels should feel intentional, not decorative. Indie Magazine succeeds when GigForge feels like the place campus work gets published and found.
