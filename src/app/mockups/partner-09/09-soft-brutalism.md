# Landing Design 09 — **Blueprint**

> I'm a senior product designer trained in technical illustration and information architecture. The most underused aesthetic in product design is the engineering blueprint — precise, confident, structured, and paradoxically beautiful. Blueprint takes GigForge's directory logic and renders it like a technical drawing: pale azure paper, indigo ink, real grid lines, a 3D wireframe perspective view in the hero. This looks like a site built by people who ship things.

---

## 1. The Concept

A pale blueprint-blue page with indigo structural lines forming the grid. The hero contains a Three.js wireframe of the GigForge UI — a 3D "exploded view" of a musician profile card, like a technical product diagram — slowly rotating above the fold. Type is set in a wide geometric sans. Real data populates the directory cells below. The aesthetic says: *we designed this exactly right, and we can prove it.*

## 2. Why This Direction

Architecture firms, engineering consultancies, and design studios all use the blueprint aesthetic to communicate precision and craft. GigForge is a precision tool — it does one thing, deliberately, without noise. Blueprint's visual language matches the product's actual philosophy. It also looks completely unlike anything else in the student-app ecosystem, which is entirely the point.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#EEF4FF` | Blueprint paper — pale azure, not white |
| `bg.card` | `#FFFFFF` | Profile and gig cards |
| `bg.cell` | `rgba(255,255,255,0.6)` | Directory cells |
| `bg.cta` | `#2D3FDB` | Primary CTA — rich indigo |
| `grid.line` | `rgba(45,63,219,0.12)` | Blueprint grid lines |
| `grid.line.heavy` | `rgba(45,63,219,0.30)` | Heavy structural rules |
| `mesh.wire` | `rgba(45,63,219,0.45)` | Three.js wireframe |
| `mesh.fill` | `rgba(238,244,255,0.9)` | Three.js face fill — barely visible |
| `ink.primary` | `#0F172A` | Deep navy-black — the ink color |
| `ink.secondary` | `#334155` | Subheads, body |
| `ink.muted` | `#64748B` | Labels, metadata |
| `accent.indigo` | `#2D3FDB` | All active UI — CTAs, numbers, links |
| `accent.indigo.hover` | `#1E2BA6` | Hover state |
| `accent.cyan` | `#06B6D4` | The one warm accent — used ONLY on the availability dot and "OPEN" labels |

A palette that looks like a Letraset technical drawing from 1982 rendered in a modern browser.

## 4. Typography

- **Display:** DM Sans 800 or **Space Grotesk 700**, `clamp(60px, 9vw, 128px)`, tracking `-0.04em`, leading `0.88`. Wide, geometric, confident. Not rounded.
- **Body:** Space Grotesk 400, 16/26.
- **Technical labels:** `font-mono` 11px uppercase tracking `+0.2em`, `ink.muted` — for the blueprint annotation style.
- **Card name:** Space Grotesk 600, 19px.
- **Grid coordinates:** `font-mono` 9px, `grid.line.heavy` color, positioned as blueprint coordinate markers at major grid intersections.

```bash
npm install @fontsource/space-grotesk
```

## 5. Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [grid lines visible across full page at 80px intervals]    │
│                                                              │
│  GIGFORGE                                      SIGN IN →    │
│  ─── · ─── · ─── · ─── · ─── · ─── · ─── · ──            │  ← dashed blueprint rule
├──────────────────────────────────────────────────────────── │
│                                                              │
│  [3D WIREFRAME EXPLODED CARD — Three.js — slow rotation]   │  ← hero visual
│                                                              │
│  FIG. 01 — MUSICIAN PROFILE COMPONENT                       │  ← blueprint annotation
│                                                              │
│  STUDENT MUSICIANS.                                         │
│  STUDENT CREATORS.                                          │  ← display headline
│  ONE DIRECTORY.                                             │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  142             │  │  24              │  │  12        ││  ← stat cells
│  │  MUSICIANS       │  │  OPEN GIGS       │  │  CAMPUSES  ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│                                                              │
│  ┌──────────────────────────────────┐  ┌────────────────┐  │
│  │  A professional directory.        │  │ BROWSE MUSICIANS│  │  ← CTA plate
│  │  Not a social network.            │  │              → │  │
│  └──────────────────────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

The background grid lines are CSS `background-image: linear-gradient(rgba(45,63,219,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(45,63,219,0.12) 1px, transparent 1px)` at 80px intervals. They persist across all sections.

## 6. The Signature: Three.js Wireframe Exploded View

```bash
npm install three @react-three/fiber @react-three/drei leva
```

**What it is:** A 3D "exploded diagram" of a GigForge musician profile card — a box geometry deconstructed into floating planes, each labeled like a CAD drawing. It looks like the card is being assembled in real-time.

**Implementation:**

A `@react-three/fiber` `<Canvas>` at `position: relative`, height `40vh`, centered above the headline.

Components:
- **Background plane** (card body): `BoxGeometry(4, 2.4, 0.04)`, `MeshBasicMaterial({ color: 0xEEF4FF, wireframe: false })` — barely visible fill.
- **Wireframe overlay**: Same geometry, `MeshBasicMaterial({ color: 0x2D3FDB, wireframe: true, opacity: 0.45, transparent: true })`.
- **Floating label planes** (name row, bio row, tag row): Three smaller `PlaneGeometry` cards offset along the Z-axis by `0`, `-0.5`, `-1.0` — exploded apart. Each has its own wireframe.
- **Annotation lines**: `<Line>` from `@react-three/drei` — thin lines from each plane's corner to a `<Html>` text label: `NAME · INTER 700`, `INSTRUMENTS · TAGS`, `CONTACT LINK`.
- **Rotation**: The entire group has `useFrame((state) => { groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3; groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1; })` — slow, rocking rotation.
- **Mouse influence**: `useFrame` also adds `groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05` where `targetRotY` comes from normalized `pointermove` — the card tilts toward your cursor.

```tsx
// Minimal scaffold:
<Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[4, 6, 4]} intensity={0.8} color="#2D3FDB" />
  <directionalLight position={[-4, -2, 2]} intensity={0.3} color="#06B6D4" />
  <ExplodedCard />
  <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
</Canvas>
```

The indigo directional light + cyan fill light gives depth without shadows — feels like a technical illustration.

`prefers-reduced-motion`: group rotation locked at `[0, -0.15, 0]`, no animation.

## 7. The Grid System

Every layout decision is grid-aligned. The page uses `display: grid` with `gap: 2px` everywhere — borders emerge from the gap, not from `border` properties. This creates flush, aligned grid joints that look machined.

Stat blocks, directory cells, CTA plates: all `border-radius: 0`. Blueprint precision — nothing rounds.

**Blueprint coordinate markers**: At major grid intersections, tiny `font-mono` 9px labels in `grid.line.heavy` — `A1`, `B3`, `C2` etc. These are decorative (`aria-hidden`), purely architectural.

## 8. The Stat Blocks

```
┌──────────────────┐
│  142             │  ← Space Grotesk 800, 80px, accent.indigo
│  MUSICIANS       │  ← mono 11px, ink.muted
└──────────────────┘
```

**Framer Motion count-up** via `useInView` + `animate()`:
```tsx
animate(0, 142, {
  duration: 1.6,
  ease: [0.16, 1, 0.3, 1],  // easeOutExpo
  onUpdate: v => setCount(Math.floor(v)),
});
```

On hover: Framer `whileHover={{ backgroundColor: "#2D3FDB", color: "#FFFFFF" }}` + `transition={{ duration: 0.08 }}`. Near-instant — blueprint snap, not consumer softness.

## 9. CTAs as Plates

**Primary plate** — `Browse musicians`:
```
bg: #2D3FDB
text: #EEF4FF
border: 2px grid.line.heavy
height: fills adjacent block
font: Space Grotesk 700, 20px uppercase
arrow: → at bottom-right
hover: bg #1E2BA6
Framer: whileHover={{ scale: 1.01, boxShadow: "0 8px 32px rgba(45,63,219,0.35)" }}
```

**Secondary plate** — `Post a gig`:
```
bg: #EEF4FF
border: 2px grid.line.heavy
text: ink.primary
hover: Framer whileHover={{ backgroundColor: "#2D3FDB", color: "#EEF4FF" }}
transition: { duration: 0.08 }
```

## 10. Directory Cells Strip

Four live profile cells in a full-bleed grid row, each separated by `2px gap`:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  ◉ Maya C.   │  ◉ Jordan L. │  ◉ Sam P.    │  → 142 total │
│  Guitar      │  Cello       │  Piano       │              │
│  UT Austin   │  USC         │  Berklee     │  browse all  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

The `◉` is `accent.cyan` — the only cyan on the page. It makes availability status unmissable.

Cell hover: Framer `whileHover={{ backgroundColor: "#2D3FDB" }}` + text color flip. `transition={{ duration: 0.06 }}`.

## 11. Framer Entrance: The Page Assembles

On load, the page doesn't appear — it **assembles**. Each section is a `motion.div`:

```tsx
// Row by row, column by column
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}}
// Container: staggerChildren: 0.06
// Each element: transition: { type: "spring", stiffness: 280, damping: 24 }
```

The effect: grid cells appear in reading order, like a blueprint being plotted by a CNC machine. The Three.js canvas fades in simultaneously with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}`.

## 12. How It Works

Three labeled rows in a bordered grid:

```
┌──────┬──────────────────────────────────────────────────────┐
│ 01   │  Browse the directory — no account needed.           │
├──────┼──────────────────────────────────────────────────────┤
│ 02   │  Find someone you like — email is right there.       │
├──────┼──────────────────────────────────────────────────────┤
│ 03   │  Contact them — that is the whole product.           │
└──────┴──────────────────────────────────────────────────────┘
```

Number cells: `accent.indigo` background, `bg.card` text. Text cells: `bg.page`. All borders: `2px gap` from CSS grid.

## 13. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/space-grotesk
```

## 14. Implementation Notes

- Blueprint grid: CSS `background-image` grid on `body` element. No SVG, no canvas.
- Three.js canvas: `alpha: true`, `transparent` background so the blueprint paper shows.
- `<Html>` from `@react-three/drei` for the annotation labels — renders as real DOM text positioned in 3D space.
- Coordinate markers: `aria-hidden="true"` divs absolutely positioned at grid intersections.
- `prefers-reduced-motion`: Three.js frozen, Framer entrance instant, hover flips still work (they're direct, not animated).

## 15. The Test

Screenshot the hero. Remove all the text. If the Three.js diagram still reads as "a professional tool" and not "a 3D screensaver," the lighting and camera angle are right. The wireframe must be legible as a *card* — not abstract geometry. If a non-technical person can't identify it as a UI component within 5 seconds, your explosion offset is too large — bring the planes closer together.
