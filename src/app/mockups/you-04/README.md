# Landing Design 04 - **Poster Wall**

> I have spent too much time photographing campus bulletin boards because they are one of the last honest interfaces left. A poster wall has hierarchy, urgency, personality, and proof that people are doing things nearby. Poster Wall turns GigForge into that object: a sunlit corkboard where gig cards are pinned, lifted, inspected, and acted on. The page feels handmade, but the workflow is still structured.

---

## 1. The Concept

Warm paper page. The hero is a Three.js corkboard with six physical gig cards pinned at slight angles. Each card has depth, a pushpin, and a little shadow on the cork. Hovering tilts a card forward. Clicking expands a selected card into a readable gig detail overlay. Beneath the board: a huge poster-style headline, two blocky CTAs, and a three-column explanation section.

This is the most tactile direction. It feels like a campus wall at noon, not a web dashboard at midnight.

## 2. Why This Direction

Student gigs already spread through flyers, group chats, and hallway posters. Poster Wall respects that behavior but gives it structure. The corkboard makes listings feel immediate and local. The interaction makes browsing feel physical. GigForge becomes the organized version of the bulletin board everyone already understands.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFF3DE` | Sunlit poster paper |
| `cork.base` | `#C89B62` | Corkboard surface |
| `cork.dark` | `#9F6F3D` | Cork flecks and depth |
| `frame.wood` | `#6B4328` | Board frame |
| `card.white` | `#FFFDF6` | Main gig card |
| `card.yellow` | `#FFE176` | Highlight card |
| `card.green` | `#CFF08A` | Musician card |
| `card.blue` | `#A7D8FF` | Creator card |
| `pin.red` | `#D83A24` | Pushpins, tiny urgency accents |
| `ink.primary` | `#17120B` | Headlines and borders |
| `ink.secondary` | `#59422B` | Body copy |
| `ink.muted` | `#8B6D4A` | Metadata |
| `accent.sky` | `#57C7FF` | Secondary band and hover |
| `border.ink` | `#17120B` | Heavy poster borders |
| `shadow.hard` | `#17120B` | Offset shadows |

Keep the page bright and warm. Red is only for pins and one urgent label.

## 4. Typography

- **Display:** Archivo Black or Inter 900, uppercase, `clamp(48px, 8vw, 112px)`, leading `0.88`.
- **Kicker:** `font-mono` 12px uppercase tracking `+0.2em`.
- **Body:** Inter 500, 17/1.55, `ink.secondary`.
- **Card titles:** Inter 900, 22px, tight leading.
- **Card metadata:** `font-mono` 10px uppercase.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
TOP HERO
3D corkboard, 55vh min 420px
Six pinned gig cards

LOWER HERO
GIGFORGE CAMPUS BOARD
Projects need sound. Students need gigs.
A digital flyer wall for finding student musicians...
[ Post the gig ] [ Find talent ]

BELOW
01 Post clearly / 02 Browse locally / 03 Email directly
```

The board gets the top half of the first viewport. The headline sits immediately below, still visible without scrolling on desktop.

## 6. The Signature: Three.js Corkboard

**Board geometry:**
- Cork: `BoxGeometry(8.5, 5.2, 0.18)`, material `cork.base`, roughness `1`.
- Frame: four wood rails using `BoxGeometry`, color `frame.wood`.
- Cork flecks: 120 small flat circles or tiny planes randomly placed on the board surface using `InstancedMesh`, colors `cork.dark` and lighter cork.

**Cards:**
- Six card meshes: `BoxGeometry(1.8, 1.2, 0.035)`.
- Materials use the card palette.
- Positions: staggered grid, each with rotation Z between `-0.12` and `0.14`.
- Add a small cylinder or sphere pin at top center, `pin.red`.
- Each card has an `<Html transform>` overlay with title and metadata.

**Card content:**
```text
Composer for senior film / OPEN / Apr 18
Bassist for launch party / LIVE SET / Friday
Singer for podcast theme / REMOTE / Paid
Violin for game trailer / SCORE / 2 weeks
Pianist for recital / CAMPUS / Weekend
Producer for short doc / MIX / Remote
```

**Interaction:**
- Hovered card lifts toward camera by `z += 0.25`, rotates X by `-0.08`, shadow grows.
- Clicked card triggers a Framer DOM overlay beside the board with the full gig details.
- Reduced motion: no lift animation, clicked overlay still works.

## 7. Expanded Gig Overlay

Overlay is a flat DOM panel, not 3D:

```text
OPEN GIG
Composer for senior film
Needs: ambient strings, piano, subtle synth
Deadline: Apr 18
Contact: email creator
```

Style: `card.white`, `4px solid ink`, `10px 10px 0 shadow.hard`. It slides in from the right with spring stiffness `240`, damping `22`.

## 8. CTAs

**Primary - `Post the gig`:**
```text
bg #FFE176
text #17120B
border 3px #17120B
height 54px
radius 0
font weight 900 uppercase
hover translate -2px -2px, shadow 6px 6px 0 #17120B
```

**Secondary - `Find talent`:**
```text
bg #FFFFFF
text #17120B
border 3px #17120B
hover bg #A7D8FF
```

## 9. Poster Bands

Add two large flat color bands behind lower hero content:
- Red-orange `#FF5A3D`, rotated `-2deg`, behind the top of the headline.
- Sky `#57C7FF`, rotated `1deg`, behind the CTA row.

These are not gradients. They should look like paper strips pasted behind the layout.

## 10. Pitch Section

```text
01 / Post clearly
Project type, instruments, deadline, contact email.

02 / Browse locally
Musicians list campus, genre, availability, and links.

03 / Email directly
No platform DMs. No feed. No matching ritual.
```

Each column has a 4px top border and enters with Framer `y: 32` stagger.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `CorkBoard.tsx` is client-only via `dynamic(..., { ssr: false })`.
- Use `<Html transform>` for card text. Keep card text short to avoid tiny unreadable overlays.
- Use `InstancedMesh` for cork flecks to keep performance cheap.
- Mobile: replace the 3D board with a horizontally scrollable DOM stack of poster cards if canvas gets cramped.
- Keep all borders square. No soft SaaS cards.

## 13. The Test

Show the hero to someone and ask what it reminds them of. The desired answer is "bulletin board," "flyer wall," or "campus posters." If they say "cards," the physical board is not doing enough work. Increase cork texture, pin scale, and card rotation variety. Poster Wall succeeds when the page feels pinned up, not laid out.
