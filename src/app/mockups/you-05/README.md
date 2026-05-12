# Landing Design 05 — **Clean Directory**

> I'm a product designer who's shipped search-first interfaces at two marketplaces and a research tool. The best search interfaces don't explain themselves — they invite you in. Clean Directory makes the landing page the product. The Three.js piece is subtle but devastating: musician profile cards float in 3D space at different Z-depths behind the search panel, a real depth-of-field blur making the far cards soft and the near ones sharp — like looking through a lens at a deep stack of profiles. Framer Motion handles the search results streaming in. You feel the directory before you read a word.

---

## 1. The Concept

Pure white page. The hero is split: left column is the value prop and CTAs, right column is a fully interactive search interface that works right on the landing page — type anything, filter chips respond, musician cards stream in. Behind the search panel, three additional cards float in 3D Z-space via Three.js, depth-of-field blur making the background rows soft. The search is the hero. The directory is already open.

## 2. Why This Direction

Most landing pages tell you what the product does. Clean Directory shows you the product operating. The visitor can search "guitar" or "film composer" and see real results — without signing in, without friction. This is the most conversion-optimized concept in the series: people who search are people who are already in purchase mode. The 3D depth-of-field effect behind the panel communicates "there is more here — a lot more." The depth IS the value proposition.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Clean white |
| `bg.panel` | `#F7F8FA` | Search panel background |
| `bg.card` | `#FFFFFF` | Result cards |
| `bg.card.hover` | `#F0F7FF` | Card hover |
| `bg.chip` | `#F0F0F0` | Filter chip default |
| `bg.chip.active` | `#E0EDFF` | Active filter chip |
| `depth.far` | `rgba(180,190,210,0.6)` | Far depth cards in Three.js (blurred) |
| `depth.mid` | `rgba(210,220,235,0.8)` | Mid depth cards |
| `ink.primary` | `#0D1117` | All primary text |
| `ink.secondary` | `#4B5563` | Body, metadata |
| `ink.muted` | `#9CA3AF` | Labels, placeholders |
| `accent.teal` | `#0D9488` | Active chip, OPEN badge, CTA fill |
| `accent.teal.light` | `#CCFBF1` | Teal light — chip active bg, badge bg |
| `accent.teal.dark` | `#0F766E` | CTA hover |
| `border.panel` | `rgba(0,0,0,0.06)` | Panel border |
| `border.card` | `rgba(0,0,0,0.08)` | Card border |
| `status.available` | `#10B981` | Available dot |

White + teal. Every pixel defers to the search interface.

## 4. Typography

- **Display:** Inter 700, `clamp(36px, 5vw, 64px)`, tracking `-0.025em`, leading `1.06`.
- **Kicker:** Inter 500 11px uppercase tracking `+0.18em`, `accent.teal`: `SEARCH-FIRST · BROWSE WITHOUT SIGNING IN`.
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **Search input:** Inter 400 16px `ink.primary`, placeholder `ink.muted`.
- **Card name:** Inter 600 16px `ink.primary`.
- **Card meta:** Inter 400 13px `ink.secondary`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GigForge                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├───────────────────────┬────────────────────────────────────┤
│                       │                                      │
│  SEARCH-FIRST ·       │  ┌──────────────────────────────┐  │
│  BROWSE WITHOUT       │  │ 🔍  Search musicians...        │  │  ← live search
│  SIGNING IN.          │  │ ─────────────────────────────  │  │
│                       │  │ [+ Instrument][+ Genre][+ City]│  │  ← filter chips
│  Start with who       │  │ ─────────────────────────────  │  │
│  you need.            │  │ ● Maya C.  Guitar · UT Austin  │  │  ← result stream
│                       │  │ ● Theo L.  Film score · Remote │  │
│  GigForge is          │  │ ● Nina P.  Violin · NYC        │  │
│  the directory        │  │ ● Sam K.   Cello · Berklee     │  │
│  open right now.      │  │   + 138 more musicians         │  │
│                       │  └──────────────────────────────┘  │
│  [ Explore directory ]│                                      │
│  [ View open gigs ]   │  [[[[ depth cards behind — 3D ]]]]] │
│                       │                                      │
└───────────────────────┴────────────────────────────────────┘
```

## 6. The Signature: Three.js Depth-of-Field Card Stack

Behind the search panel, a Three.js scene renders 6 additional profile cards at varying Z depths. The canvas is positioned `absolute, z-index: 0` behind the `position: relative, z-index: 1` search panel.

**Cards in 3D:**
- Each card: `PlaneGeometry(2.8, 1.6)` with `MeshBasicMaterial` and a canvas-drawn texture showing a musician profile mockup (name, instrument, school — drawn via `CanvasTexture` or `<Html>` overlay with `occlude`).
- Depths: `z = [0, -1.8, -3.5, -5.2, -6.8, -8.4]` — a stack receding into the screen.
- Positions: slight horizontal and vertical offsets per card so they don't perfectly overlap.
- Subtle rotation: each card tilts `±4deg` on Y, `±2deg` on X — a random but seeded orientation.

**Depth of field:**
- Post-processing via `@react-three/postprocessing` (or manual): `DepthOfField` effect. `focusDistance: 0, focalLength: 0.02, bokehScale: 3` — the nearest card is sharp, the farthest cards are visibly blurred.
- The blur gradient is what makes this feel like a lens, not a flat graphic.

```bash
npm install @react-three/postprocessing
```

**Animation:**
- Cards drift slowly upward: `position.y += 0.0008` per frame. When a card exits the top of the frame, it repositions at the bottom — the stack scrolls infinitely upward, like browsing through results.
- Camera: fixed orthographic. No cursor interaction — the camera is a peephole into the directory.

`prefers-reduced-motion`: cards frozen, no upward drift.

## 7. Live Search — Framer Motion

The search input is functional (client-side filter on a hardcoded dataset of 20 musicians). Results update immediately as the user types.

**Filter chip animation:**
```tsx
// Chip becomes active:
animate={{ backgroundColor: "#E0EDFF", scale: 1.04 }}
transition={{ type: "spring", stiffness: 380, damping: 28 }}
```

**Result stream — on search change:**
```tsx
const rowVariants = {
  hidden: { opacity: 0, x: -8, height: 0 },
  visible: { opacity: 1, x: 0, height: "auto" },
  exit: { opacity: 0, x: 8, height: 0 },
};
// AnimatePresence mode="sync"
// staggerChildren: 0.05
```

Each result entering/exiting is individually animated — feels like a real search autocomplete, not a page reload.

**Card hover:**
```tsx
whileHover={{ backgroundColor: "#F0F7FF", x: 4 }}
transition={{ type: "spring", stiffness: 400, damping: 30 }}
```

The email button on each card:
```tsx
whileHover={{ scale: 1.08, backgroundColor: "#0D9488", color: "#FFFFFF" }}
```

## 8. Filter Chips

Chips: `[+ Instrument]  [+ Genre]  [+ Campus]  [+ Remote]  [+ Available]`

On click, each expands into a dropdown via Framer `AnimatePresence`:
```tsx
initial={{ height: 0, opacity: 0 }}
animate={{ height: "auto", opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 28 }}
```

Active chip color shifts to `bg.chip.active` with a `accent.teal` text color and a small `×` to clear.

## 9. CTAs

**Primary** — `Explore directory`:
```
bg: #0D9488
text: #FFFFFF
height: 50px, px: 28px
radius: 8px
font: Inter 600, 15px
hover: bg #0F766E, shadow 0 4px 20px rgba(13,148,136,0.3)
transition: spring stiffness 280 damping 22
```

**Secondary** — `View open gigs`:
```
bg: transparent
border: 1.5px #0D9488
text: #0D9488
radius: 8px
hover: bg #CCFBF1
```

## 10. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 56px `ink.primary`. Below each: a teal `● LIVE` badge. Framer count-up on `useInView`, 1.2s.

## 11. How It Works

```
01  Search the directory     No account. Filter by anything.
02  Find who you need        Their profile is the pitch.
03  Email them directly      One click. Their inbox, directly.
```

Teal `01/02/03` `font-mono` labels. Inter 600 headlines. Framer stagger on scroll.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @react-three/postprocessing
```

## 13. Implementation Notes

- `DepthStack.tsx` — Three.js scene, `dynamic(..., { ssr: false })`. Canvas absolutely positioned behind the search panel.
- `CanvasTexture` for card face: use `document.createElement('canvas')`, draw name/instrument/school with `ctx.fillText`, then `new THREE.CanvasTexture(canvas)`. Update when musician data changes.
- `@react-three/postprocessing` `DepthOfField`: wrap scene in `<EffectComposer><DepthOfField focusDistance={0} focalLength={0.015} bokehScale={2.5} /></EffectComposer>`. Adjust `bokehScale` until far cards look pleasantly blurred (not pixelated).
- Live search: `useDeferredValue(query)` to prevent input lag during Framer animation.
- Result `AnimatePresence`: use `key={musician.id}` on each `motion.div` — not index — so Framer correctly identifies entering vs. exiting items during search filter changes.

## 14. The Test

Type "guitar" into the search field. Results should filter in under 100ms, with each card streaming in over 400ms total stagger. If the filter feels sluggish, move the filter logic from a `useEffect` with `setState` to a `useMemo` on the query value. Then look at the depth stack behind the panel — the far cards should be visibly softer than the near ones. If they look identical, increase `bokehScale` from 2.5 to 4.0.
