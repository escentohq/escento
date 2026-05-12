# Landing Design 02 — **Campus Signal**

> I've shipped campus-facing tools at three universities and two edtech startups. The most successful ones feel like the place they live — the campus, the studio, the music building. Campus Signal takes the campus literally: a Three.js low-poly campus quad rendered from a 45-degree bird's-eye view, buildings glowing when they have active musicians. Below it: a brutally clear split-hero with a product preview that looks exactly like the real app. Students land here and know in three seconds whether GigForge is for them. It is.

---

## 1. The Concept

Warm parchment page. The top third of the hero is a Three.js low-poly campus scene — a stylized bird's-eye quad with 8 buildings rendered as simple geometric volumes, casting real shadows on a ground plane. Two or three buildings pulse with a soft yellow-green glow: those are the active music buildings. Below the campus: a two-column hero with a bold headline on the left and a real product-preview search panel on the right. The campus IS the opening argument. Your musicians are physically here.

## 2. Why This Direction

GigForge is spatially grounded — it's not remote-first, it's campus-first. Most directory tools ignore that. Campus Signal makes the campus the hero. The low-poly style signals technical craft without feeling cold. The glowing buildings answer "is anyone here?" before a word is read. Then the search panel on the right answers "how does it work?" in one glance. The two questions every new visitor has — answered in the first viewport, without copy.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FAF6EE` | Warm parchment — campus map paper |
| `bg.card` | `#FFFFFF` | Product preview card |
| `bg.row.hover` | `#F5F1E6` | Search result row hover |
| `building.base` | `#D8CEBC` | Default building face |
| `building.active` | `#A8C456` | Active music building fill — yellow-green |
| `building.glow` | `rgba(168,196,86,0.25)` | Glow halo around active building |
| `ground.plane` | `#EAE3D0` | Campus quad ground |
| `shadow.soft` | `rgba(60,44,20,0.12)` | Building shadows on ground |
| `ink.primary` | `#1A1510` | Headlines, body |
| `ink.secondary` | `#6B5B3E` | Subheads, metadata |
| `ink.muted` | `#A89070` | Timestamps, labels |
| `accent.green` | `#5D8C1E` | CTA fill, OPEN badge, active state |
| `accent.yellow` | `#E8C44A` | Secondary CTA, kicker pill bg |
| `border.card` | `#1A1510` | Hard black card borders — flat, graphic |
| `shadow.offset` | `#1A1510` | Hard offset shadow on preview card |
| `tag.bg` | `#EEF5DA` | Role card / filter chip background |

Parchment + yellow-green + hard black. Looks like a campus map marker system.

## 4. Typography

- **Display:** Inter 900, `clamp(40px, 6vw, 80px)`, tracking `-0.03em`, leading `0.96`.
- **Kicker:** Inter 700 11px uppercase tracking `+0.16em` in `accent.green`, in a tight `accent.yellow` pill — `GF · STUDENT CREATIVE NETWORK`.
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **Preview labels:** `font-mono` 12px `ink.muted`.
- **Preview result names:** Inter 600 15px `ink.primary`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│   [campus low-poly Three.js scene — full width, 35vh]       │
│   Buildings glow green where musicians are active          │
│   Bird's-eye 45° view, slow auto-rotate                    │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                   │
│  [GF · STUDENT CREATIVE] │  ┌──────────────────────────┐  │  ← preview card
│                          │  │ ▸ Search musicians...      │  │    black border
│  Find the student        │  │ ─────────────────────────  │  │    hard offset shadow
│  musician your           │  │ Maya R.  Guitar + prod    │  │
│  project is missing.     │  │ Theo L.  Film score       │  │
│                          │  │ Nina P.  Violin            │  │
│  Browse free. Post gigs. │  │ ──────── + 139 more ───── │  │
│  Email directly.         │  └──────────────────────────┘  │
│                          │                                   │
│  [ Browse musicians → ]  │  ┌──────────┐  ┌──────────┐    │
│  [ Post a gig + ]        │  │ I need   │  │ I make   │    │  ← role cards
│                          │  │ music    │  │ music    │    │
└──────────────────────────┴─────────────────────────────────┘
```

## 6. The Signature: Three.js Low-Poly Campus

**Scene:**
- `OrthographicCamera` at `[0, 12, 8]` looking at `[0, 0, 0]`. 45-degree bird's-eye view.
- Ground plane: `PlaneGeometry(16, 12)`, `MeshStandardMaterial` `ground.plane`, `receiveShadow: true`.
- 8 buildings: `BoxGeometry` at varying heights (1.2–3.5 units). Each has a unique footprint. Positions hardcoded to form a recognizable quad layout — two rows of 4, with a central path gap.
- Building materials: `MeshStandardMaterial` `building.base`, `roughness: 0.95`, `metalness: 0`, `castShadow: true`, `receiveShadow: true`.
- Shadows: `<Canvas shadows>`, `DirectionalLight` at `[6, 10, 5]` with `castShadow: true`, `shadow-mapSize: [1024, 1024]`.

**Active buildings (2–3):**
- Music buildings get `building.active` (`#A8C456`) material color.
- A `PointLight` inside each active building at intensity `2`, color `#A8C456`, `decay: 2` — light bleeds through the top and sides slightly.
- A `CircleGeometry` halo at ground level below each active building, `building.glow` material, `transparent: true` — the soft pool of green light.
- Pulse: `haloMesh.material.opacity = 0.1 + 0.15 * sin(t * 1.8 + phaseOffset)` — the glow breathes.

**Auto-rotate:**
- Camera orbits the campus center: `camera.position.x = sin(t * 0.06) * 10, camera.position.z = cos(t * 0.06) * 8 + 8` — a slow 110-second orbit. The campus turns like a model on a turntable.

**Mouse interaction:**
- `onPointerMove` on the canvas → `raycaster` over buildings → hovered building temporarily lifts 0.3 units in Y (`position.y += (target - current) * 0.08`) and brightens slightly.
- Tooltip via `<Html>`: hovered building shows `"Music Building · 14 musicians"` in `font-mono` 10px.

`prefers-reduced-motion`: orbit paused, pulse frozen, no hover lift.

## 7. Product Preview Card — Framer Motion

The search preview card uses hard-border flat design. On page load, search results stream in via Framer stagger:

```tsx
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};
// staggerChildren: 0.08
// transition: { type: "spring", stiffness: 200, damping: 22 }
```

Each result row has a `motion.div` with:
```tsx
whileHover={{ backgroundColor: "#F5F1E6", x: 3 }}
transition={{ type: "spring", stiffness: 400, damping: 30 }}
```

The `Email` button on each row:
```tsx
whileHover={{ scale: 1.06, backgroundColor: "#5D8C1E", color: "#FFFFFF" }}
```

## 8. Role Cards

Two flat cards below the preview:

```
┌─────────────────┐    ┌─────────────────┐
│  I need music   │    │  I make music   │
│  ─────────────  │    │  ─────────────  │
│  Browse →       │    │  List yourself  │
└─────────────────┘    └─────────────────┘
```

Left card: `bg.card` with `border: 2px solid border.card`. Right card: `bg.tag.bg` with same border.

Framer hover:
```tsx
whileHover={{ y: -4, boxShadow: "4px 4px 0px #1A1510" }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

The hard shadow extends on hover — the card "lifts" off the page.

## 9. CTAs

**Primary** — `Browse musicians →`:
```
bg: #1A1510
text: #FAF6EE
height: 52px, px: 28px
radius: 0px (flat — campus-map aesthetic)
font: Inter 700, 15px
hover: bg #5D8C1E (black to green — the campus signal activating)
shadow: 3px 3px 0px #5D8C1E (yellow-green offset — graphic, not blurred)
transition: 180ms
```

**Secondary** — `Post a gig +`:
```
bg: #E8C44A
text: #1A1510
border: 2px solid #1A1510
radius: 0px
hover: bg #D4B03A, shadow 3px 3px 0px #1A1510
```

## 10. Stats

```
142 musicians      24 open gigs      12 campuses
```

Numbers in Inter 900 64px `ink.primary`. Framer count-up on `useInView`, 1.2s. Between each: a 2px vertical `border.card` rule. Below each number: a small `accent.green` arrow `→` link.

## 11. How It Works

```
01  Browse the directory       No account required.
02  Find who you need          Filter by instrument, campus.
03  Email them directly        That's the whole thing.
```

Step numbers in `font-mono` `accent.green`. Headlines Inter 700. Body Inter 400. Framer stagger on scroll.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 13. Implementation Notes

- `CampusScene.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas height: `35vh` min `280px`.
- Building positions: define as a constant array `BUILDINGS = [{ x, z, w, d, h, active }]`. `active: true` applies the green material + point light.
- The `DirectionalLight` shadow frustum: set `shadow.camera.near = 0.5, shadow.camera.far = 30, shadow.camera.left/right/top/bottom = ±10` — default frustum is too large and produces blurry shadows.
- Orbit: update camera position in `useFrame`. Look-at target stays `[0, 0, 0]` always. Use `camera.updateProjectionMatrix()` after any position change with OrthographicCamera.
- Preview card: server-rendered with first 3 musician results. The Framer entrance only runs once (row streaming on mount).
- `prefers-reduced-motion`: skip streaming stagger, show rows statically; skip orbit, freeze glow pulse.

## 14. The Test

Show the campus scene to a college student. Cover the headline. Ask: "What are you looking at?" If they say "a campus" or "a map," the low-poly buildings are reading correctly. Then ask: "What do the green ones mean?" If they say "something active" or "something happening there," the glow pulse is legible. Both reads should happen in under 5 seconds without prompting. If either fails, increase building contrast and pulse amplitude by 30%.
