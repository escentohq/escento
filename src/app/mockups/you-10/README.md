# Landing Design 10 — **Portfolio Grid**

> I've art-directed portfolio sites for twelve working musicians and three film composers. The consistent failure mode: portfolios hide the work behind navigation. Portfolio Grid inverts this. The Three.js piece is a 3D gallery space — profile tiles floating in a deep room at varying Z-depths and heights, the camera slowly drifting forward as if you're walking into an exhibition. Each tile is a musician's portfolio preview. Framer Motion handles the tile hover flip: front shows the preview thumbnail, back shows the contact info. The page is the portfolio. You walk into it.

---

## 1. The Concept

Pale cool gray page. The entire right column (and below the fold, the full width) is a Three.js gallery space: a deep room perspective with musician portfolio tiles floating at different depths, the camera gliding slowly toward them. Each tile has a genre label, a color-coded background, and a portfolio link. Hover any tile — Framer Motion flips it on the Y-axis to reveal contact info and an email button on the back. Left column: the value prop and CTAs. The gallery IS the product. You browse it here, on the landing page.

## 2. Why This Direction

Musicians are visual people who judge a platform by how well it presents work. Portfolio Grid takes that seriously: the tiles are not mockups or illustrations, they're real musician entries with real color identity and real portfolio links. The 3D gallery perspective communicates depth — "there are many musicians here, arranged in space for you to discover." The flip reveal on hover is the perfect interaction for a first-impression page: it rewards curiosity without requiring a click-through.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F2F3F6` | Pale cool gray |
| `room.floor` | `#E4E6EC` | Gallery floor plane |
| `room.back` | `#D8DAE2` | Gallery back wall (far) |
| `room.ceiling` | `#ECF0F6` | Gallery ceiling |
| `tile.green` | `#D4EDD0` | Composer reel tile |
| `tile.peach` | `#FAE0D4` | Jazz trio tile |
| `tile.sky` | `#D0E8F5` | Game audio tile |
| `tile.lavender` | `#E8E0F5` | Choir vocals tile |
| `tile.butter` | `#FAF0D4` | Synth score tile |
| `tile.mint` | `#D4F0E8` | Live keys tile |
| `tile.back` | `#1A1A2C` | Card back (dark) — contact info |
| `back.text` | `#FFFFFF` | Text on dark card back |
| `plus.mark` | `rgba(0,0,0,0.25)` | Plus marker on each tile |
| `ink.primary` | `#111827` | Headlines, body |
| `ink.secondary` | `#4B5563` | Subheads, metadata |
| `ink.muted` | `#9CA3AF` | Labels, captions |
| `accent.violet` | `#7C3AED` | Primary CTA, active tile mark |
| `accent.violet.light` | `#EDE9FE` | CTA hover bg, chip active |
| `accent.violet.dark` | `#5B21B6` | CTA hover fill |
| `border.tile` | `rgba(0,0,0,0.06)` | Tile edges |

Cool gray + six pastel tile colors + one violet accent. The gallery's variety IS the design.

## 4. Typography

- **Display:** Inter 700, `clamp(36px, 5vw, 64px)`, tracking `-0.025em`, leading `1.06`.
- **Kicker:** Inter 500 11px uppercase tracking `+0.18em` `accent.violet`: `PORTFOLIO-LED DISCOVERY`.
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **Tile label:** Inter 700 14px `ink.primary`.
- **Tile sub:** `font-mono` 11px `ink.secondary`.
- **Back-of-card name:** Inter 700 18px `back.text`.
- **Back-of-card meta:** Inter 400 13px `rgba(255,255,255,0.7)`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GigForge                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                   │
│  PORTFOLIO-LED           │  [Three.js 3D gallery room]      │
│  DISCOVERY               │  — tiles floating at Z depths    │
│                          │  — camera drifts forward          │
│  Hear enough             │  — floor + ceiling + back wall    │
│  to make the             │                                   │
│  next move.              │                                   │
│                          │                                   │
│  Browse musicians.       │                                   │
│  Each profile links      │                                   │
│  to real work.           │                                   │
│                          │                                   │
│  [ Browse work ]         │                                   │
│  [ Add profile ]         │                                   │
│                          │                                   │
└──────────────────────────┴─────────────────────────────────┘

[Full-width 3D gallery below the fold — more tiles at greater depth]
```

## 6. The Signature: Three.js 3D Gallery Walk

**Room geometry:**
- Floor: `PlaneGeometry(20, 24)` rotated `-π/2` on X. Material `room.floor`, `roughness: 1.0`.
- Back wall: `PlaneGeometry(20, 10)` positioned at `z = -12`. Material `room.back`.
- Ceiling: `PlaneGeometry(20, 24)` at `y = 4.5` rotated `π/2`. Material `room.ceiling`.
- Side walls: two `PlaneGeometry(24, 10)` planes.
- Lighting: `ambientLight` 0.6, `DirectionalLight` from `[0, 8, 6]` intensity 0.5 — gallery top-light. A second `DirectionalLight` from `[0, 8, -4]` at 0.3 — back-lit fill.

**Tile placement (6 tiles):**
- Positions distributed in 3D space: two columns, three rows, Z values: `[0, -2.5, -5]`.
- Example: `{x: -1.8, y: 0.4, z: 0}`, `{x: 1.8, y: 0.8, z: 0}`, `{x: -2.2, y: 0.1, z: -2.5}`, etc.
- Each tile: `BoxGeometry(2.4, 3.2, 0.04)` — portrait aspect, slight extrusion.
- Front material: `MeshStandardMaterial` with one of six pastel tile colors, `roughness: 0.9`, `metalness: 0`.
- `<Html>` overlay (front face): genre label, sub-label, `+` marker.
- Back material: `MeshStandardMaterial` `tile.back`, same geometry.
- `<Html>` overlay (back face): musician name, contact info, email button.

**Camera auto-drift:**
- `camera.position.z` starts at `4`, drifts toward `1.5` over 8 seconds on mount via `useFrame`. This gives the effect of "walking into" the gallery.
- After arriving at `z = 1.5`, slow ambient drift: `camera.position.z = 1.5 + sin(t * 0.15) * 0.3` — breathing depth.
- Camera Y: `camera.position.y = 0.8 + pointer.y * 0.4` — cursor controls look-up/down slightly.
- Camera X: `camera.position.x = pointer.x * 0.8` — cursor controls left/right gaze.

`prefers-reduced-motion`: camera fixed at `z = 2.5`, no drift, no cursor response.

## 7. Tile Flip — Framer Motion

The hover flip happens in the DOM (not Three.js) via a `motion.div` wrapper with 3D perspective. Each tile in Three.js has `pointerEvents` enabled; `onPointerOver` sets a `hoveredId` state in React, which triggers Framer on the `<Html>` overlay.

Actually: the tiles themselves are implemented as DOM elements positioned via CSS 3D transforms to match the Three.js camera projection. This is the cleaner approach for interaction:

**Alternative implementation (simpler, better interaction):**
- Three.js renders only the room geometry (floor, walls, ceiling, lighting). No tiles in Three.js.
- Tiles are absolutely-positioned DOM `motion.div` elements whose 3D positions are derived from the camera's projection matrix — updated each frame via `useFrame` + a shared ref.
- This gives full Framer Motion interactivity without `<Html>` complexity.

**Flip animation:**
```tsx
const [flipped, setFlipped] = useState(false);

<motion.div style={{ perspective: 1200 }}>
  <motion.div
    animate={{ rotateY: flipped ? 180 : 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 22 }}
    style={{ transformStyle: "preserve-3d", position: "relative" }}
  >
    {/* Front face */}
    <div style={{ backfaceVisibility: "hidden" }}>
      {/* tile label, plus marker */}
    </div>
    {/* Back face */}
    <div style={{ backfaceVisibility: "hidden", rotateY: 180 }}>
      {/* name, contact info, email button */}
    </div>
  </motion.div>
</motion.div>
```

The tile's back reveals contact info — no click-through needed for first discovery.

## 8. CTAs

**Primary** — `Browse work`:
```
bg: #7C3AED
text: #FFFFFF
height: 50px, px: 28px
radius: 8px
font: Inter 600, 15px
hover: bg #5B21B6, shadow 0 4px 24px rgba(124,58,237,0.35)
transition: spring stiffness 280 damping 22
```

**Secondary** — `Add profile`:
```
bg: transparent
border: 1.5px #7C3AED
text: #7C3AED
radius: 8px
hover: bg #EDE9FE
```

## 9. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 56px `ink.primary`. Below each: a small swatch of one of the tile colors (green, peach, sky) — the gallery palette carries through. Framer count-up on `useInView`, 1.4s.

## 10. How It Works

```
01  Browse the gallery       Filter by instrument, genre.
02  Find a profile           Link goes to their real portfolio.
03  Email them               One step. Direct.
```

Numbers in `accent.violet` `font-mono`. Framer stagger on scroll.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `GalleryRoom.tsx` — Three.js, `dynamic(..., { ssr: false })`. Renders only the room shell.
- Tile DOM elements: use `useThree().camera` + a `useFrame` hook to project 3D world coordinates to 2D screen positions. `camera.project(position)` gives NDC; multiply by `0.5 * canvas.width/height` for pixel position.
- Camera walk-in: `useSpring` from Framer (not react-spring) applied to `camera.position.z` with `stiffness: 30, damping: 15` — very slow spring for the approach feel.
- Tile flip: `onPointerEnter` on the tile DOM element sets `flipped: true`. `onPointerLeave` sets `false`. No click needed.
- The "back" face email button: `mailto:` link. `e.stopPropagation()` on the button to prevent flip-out while clicking.
- 6 tile positions hardcoded. Responsive: on mobile, tiles collapse to a 2-column CSS grid with flip-on-tap.
- `prefers-reduced-motion`: no camera drift, tiles static in 2D grid layout (CSS), flip still works.

## 13. The Test

Navigate to the page. Don't read anything. Hover a tile. If the flip reveals contact info clearly in under 200ms, the spring stiffness is correct. If it's sluggish, increase stiffness to `280`. Then walk away and look at the page from 2 meters. The gallery should read as depth — not as a flat grid. If it looks flat, increase the Z spread between the nearest and farthest tiles: bring nearest to `z = 0.5` and farthest to `z = -7`.
