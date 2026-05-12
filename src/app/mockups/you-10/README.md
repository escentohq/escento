# Landing Design 10 - **Portfolio Grid**

> I have art-directed portfolios for composers, instrumentalists, and film students, and the biggest failure is hiding the work. Portfolio Grid starts with the work as the interface. The signature is a light museum-gallery room in Three.js, with portfolio tiles floating at different depths like a student exhibition. Hovering a tile flips it to reveal contact details. The page is a gallery that knows how to become a directory.

---

## 1. The Concept

Pale gallery-gray page. The hero pairs a strong headline with a 3D white gallery room containing six floating portfolio tiles. Each tile is a pastel rectangle with a profile category on the front and direct contact detail on the back. Camera drift gives the feeling of stepping into an exhibition. Below, a simpler grid repeats the same portfolio categories for accessibility and mobile.

The vibe is creative, visual, and polished without becoming luxury-dark.

## 2. Why This Direction

Musicians are easier to trust when you can inspect their work. Portfolio Grid makes portfolio links the center of the landing experience. It says GigForge is not a resume database. It is a curated wall of student work, with email one flip away.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F2F5F8` | Pale gallery gray |
| `room.floor` | `#E7ECF1` | 3D gallery floor |
| `room.wall` | `#FAFBFC` | Gallery walls |
| `tile.green` | `#C4F1BE` | Composer/music tiles |
| `tile.peach` | `#FFD6A5` | Voice/session tiles |
| `tile.sky` | `#BDE7FF` | Game/audio tiles |
| `tile.lavender` | `#DCD2FF` | Experimental tiles |
| `tile.back` | `#FFFFFF` | Contact side |
| `ink.primary` | `#111111` | Headlines |
| `ink.secondary` | `#5C6470` | Body |
| `ink.muted` | `#8A94A1` | Labels |
| `accent.violet` | `#7C3AED` | CTA, active marker |
| `border.tile` | `#CBD5DF` | Tile borders |
| `shadow.gallery` | `rgba(17,17,17,0.10)` | Floating tile shadow |

This should feel like a white gallery with colorful student work on the walls.

## 4. Typography

- **Display:** Inter 800, `clamp(44px, 6vw, 84px)`, leading `1.0`, tracking `-0.035em`.
- **Kicker:** Inter 800 12px uppercase tracking `+0.18em`, `accent.violet`.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Tile titles:** Inter 800, 20px.
- **Tile metadata:** `font-mono` 11px uppercase.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
LEFT
PORTFOLIO-LED DISCOVERY
Hear enough to make the next move.
Profile links as the star.
[ Browse work ] [ Add profile ]

RIGHT
3D gallery room with six portfolio tiles

BELOW
Accessible 2D portfolio grid
How it works: Browse / Listen / Email
```

Desktop: split hero. Mobile: headline, 2D grid first, optional simplified room after.

## 6. The Signature: Three.js Gallery Room

**Room:**
- Floor: `PlaneGeometry(20, 24)`, rotated `-Math.PI / 2`, material `room.floor`.
- Back wall: `PlaneGeometry(20, 10)`, material `room.wall`, positioned `z = -9`.
- Side walls: two planes, subtle gray.
- Ambient light `0.65`; soft directional light from `[0, 7, 5]`.

**Tiles:**
- Six tile planes or shallow boxes, aspect `4:3`.
- Positions:
```text
[-2.2, 1.0, -1.0]
[ 1.6, 1.3, -1.7]
[-1.5, -0.5, -3.2]
[ 2.4, -0.2, -3.8]
[-2.8, 0.2, -5.4]
[ 0.8, -0.8, -6.0]
```
- Front labels:
  - Composer reel
  - Jazz trio
  - Game audio
  - Choir vocals
  - Synth score
  - Live keys

**Motion:**
- Camera starts at `z = 5`, eases to `z = 2.2` over 8 seconds.
- Pointer shifts camera X by `0.6`, Y by `0.3`.
- Tiles float subtly: `sin(t * 0.3 + phase) * 0.06`.
- Reduced motion: fixed camera, no tile float.

## 7. Tile Flip

Use DOM `motion.div` tiles over the gallery for interaction, or `<Html transform>` if matching 3D positions exactly.

Flip behavior:
```text
front: category + short label + plus marker
back: musician name + instrument + email link
```

Framer:
- `rotateY: 180` on hover/tap
- spring stiffness `220`, damping `24`
- `backfaceVisibility: hidden`

Mobile: tap to flip in a normal CSS grid.

## 8. Accessible 2D Grid

Below the hero, repeat six tiles in a responsive CSS grid. This ensures the design remains useful if the 3D scene is unavailable.

Each tile:
- fixed `aspect-ratio: 4 / 3`
- pastel fill
- 1px border
- plus marker top-left
- title bottom-left
- hover lifts `y: -4`

## 9. CTAs

**Primary - `Browse work`:**
```text
bg #7C3AED
text #FFFFFF
height 52px
radius 8px
padding x 28px
hover bg #5B21B6, shadow 0 12px 28px rgba(124,58,237,0.24)
```

**Secondary - `Add profile`:**
```text
bg #FFFFFF
text #7C3AED
border 1.5px #7C3AED
radius 8px
hover bg #EDE9FE
```

## 10. Stats

```text
142 musician profiles
24 active project briefs
12 campus collections
```

Numbers: Inter 800, 56px. Each stat gets a small color swatch matching one tile color.

## 11. How It Works

```text
01 Browse the gallery     Filter by instrument and genre.
02 Open a profile         Portfolio links show the work.
03 Email directly         No platform inbox required.
```

Use a clean gallery-label style: thin rule, mono number, bold title.

## 12. Implementation Notes

- `GalleryRoom.tsx` is client-only.
- Prefer Three.js for room depth and DOM/Framer for tile interaction.
- Keep all tile labels readable. If projection makes text too small, use the 2D grid as the primary interactive layer.
- Do not imply file uploads; copy should refer to portfolio links.
- Reduced motion should disable camera walk-in.

## 13. The Test

Hover a tile. If contact details appear quickly and clearly, the grid is doing its job. Then step back from the screen. If the right side reads as a spatial gallery rather than a flat set of cards, the depth is working. Portfolio Grid succeeds when discovery feels visual without hiding the email path.
