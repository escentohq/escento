# Landing Design 09 - **Tape Deck**

> I have designed visual identities for musicians who keep one foot in the physical world: liner notes, cassette labels, hand-numbered releases, studio receipts. Tape Deck gives GigForge a music-native object without going dark or nostalgic in a heavy way. It is a sunlit cassette on a desk, with project briefs as tracks and student musicians as the people who can play them.

---

## 1. The Concept

Cream page with coral and golden accents. A Three.js cassette object sits in the hero, angled in warm light. Its label reads `GIGFORGE MIX 01`, with track names that map to project needs: score, session, voice, strings, beats, live set. Left side has the headline and CTAs. Below, a tracklist section explains the workflow.

The page feels musical immediately, but remains light, usable, and modern.

## 2. Why This Direction

GigForge needs to communicate music without defaulting to waveforms or black stages. A cassette is a familiar music artifact with built-in information architecture: side A, side B, labels, tracks. Tape Deck turns that artifact into a product metaphor. Project briefs become tracks. Musicians are the players. Contact is pressing play.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFF6E8` | Warm cream desk surface |
| `cassette.shell` | `#F2D7B6` | Cassette body |
| `cassette.edge` | `#B9855B` | Cassette bevel and screws |
| `cassette.label` | `#FFFDF4` | Paper label |
| `cassette.window` | `#8B6A55` | Tape window |
| `reel.dark` | `#4A3328` | Reel rings |
| `ink.primary` | `#2A211B` | Headlines |
| `ink.secondary` | `#735C4C` | Body |
| `ink.muted` | `#A78670` | Captions |
| `accent.gold` | `#F5BF49` | Primary CTA, label marks |
| `accent.coral` | `#E9785F` | Track highlight |
| `accent.blue` | `#A8D8EA` | Secondary tags |
| `border.ink` | `#2A211B` | Card borders |
| `shadow.warm` | `rgba(92,61,35,0.18)` | Object shadow |

Keep the dominant field cream and peach. Avoid black-background music tropes.

## 4. Typography

- **Display:** Inter 900, `clamp(48px, 7vw, 96px)`, leading `0.96`, tracking `-0.04em`.
- **Label type:** `font-mono` 11px uppercase for cassette markings.
- **Body:** Inter 450, 17/1.6, `ink.secondary`.
- **Track names:** Inter 800, 18px.
- **CTA:** Inter 850, 15px uppercase optional.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei three-stdlib
```

## 5. Layout

```text
LEFT
PRESS PLAY ON THE PROJECT
Match the brief to the sound.
Analog-inspired product copy.
[ Post gig ] [ Browse musicians ]

RIGHT
3D cassette object, sunlit, cream/coral/gold

BELOW
Tracklist workflow:
01 Brief / 02 Browse / 03 Email / 04 Rehearse
```

Mobile stacks copy, then cassette, then tracklist.

## 6. The Signature: Three.js Cassette Object

**Geometry:**
- Main shell: `RoundedBoxGeometry(4.0, 2.45, 0.34, 5, 0.08)`, material `cassette.shell`.
- Label: `PlaneGeometry(2.9, 0.9)` placed on front, material `cassette.label`.
- Tape window: `PlaneGeometry(2.6, 0.55)`, material `cassette.window`, transparent opacity `0.8`.
- Reels: two `TorusGeometry` rings and inner cylinders, material `reel.dark`.
- Screws: four tiny cylinders in `cassette.edge`.
- Small horizontal line details in `accent.coral` and `accent.gold`.

**Cover label text via `<Html transform>`:**
```text
GIGFORGE MIX 01
Student musicians for real creative briefs
SIDE A / DIRECT EMAIL
```

**Motion:**
- Cassette slowly rotates Y between `-0.16` and `0.16`.
- Reels rotate gently at different speeds.
- Cursor tilt adds max `5deg`.
- Reduced motion: cassette static, reels stopped.

## 7. Track Tags

Tags around or beneath cassette:
```text
score / session / voice / strings / beats / live set
```

Use rounded outline pills, but keep radius modest: `999px` is acceptable here because cassette labels and music tags are soft. Hover fills with `accent.blue`.

## 8. Tracklist Workflow

```text
01 Brief the track
Describe the project, deadline, instruments, and mood.

02 Find the player
Browse profiles by genre, instrument, and availability.

03 Send the email
GigForge hands off to direct contact.

04 Make the thing
The collaboration happens off-platform.
```

Each row has a small cassette-track marker: a 3-bar motif in coral/gold.

## 9. CTAs

**Primary - `Post gig`:**
```text
bg #F5BF49
text #2A211B
height 52px
radius 6px
padding x 28px
border 2px #2A211B
hover shadow 5px 5px 0 #2A211B
```

**Secondary - `Browse musicians`:**
```text
bg #FFFDF4
text #2A211B
border 2px #2A211B
radius 6px
hover bg #A8D8EA
```

## 10. Stats

```text
142 musicians / 24 open gigs / 12 universities
```

Render as label-maker strips on cream paper. Numbers are bold, labels mono uppercase. Count-up is optional and subtle.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei three-stdlib
```

## 12. Implementation Notes

- `CassetteObject.tsx` is client-only.
- If `three-stdlib` is unavailable, use regular `BoxGeometry` with a simpler shape; do not block the concept on rounded geometry.
- Use `<Html transform>` for label text.
- Keep the cassette large enough that reels and label are recognizable.
- Do not add audio playback. This is a visual metaphor, not a media player.

## 13. The Test

Show only the object without the headline. If viewers say "cassette" or "tape," the geometry reads. Then show the full hero. If it feels like a retro music brand instead of a student collaboration tool, make the product copy and tracklist more explicit. Tape Deck succeeds when the artifact brings warmth, not confusion.
