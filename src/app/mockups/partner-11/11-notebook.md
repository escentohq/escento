# Landing Design 11 — **Mosaic**

> I'm a senior product designer who's worked on gallery platforms, creator portfolios, and two community marketplaces. The most interesting landing pages I've built share one property: they look different every time you load them. Mosaic is a living collage — profile cards with bold individual color identities float in a 3D space above the fold, and the grid below reassembles with staggered spring physics on every visit. The page isn't designed once. It's designed to be alive.

---

## 1. The Concept

Off-white page. In the hero: a Three.js scene of a 3D bulletin board — musician profile cards floating at different depths, each with its own bold pastel background color, gently drifting in 3D space. Below: a ground-level grid of the same cards rendered flat, with staggered spring entrance animations. Each card's color is deterministic from the musician's ID — Maya is always coral, Jordan is always sage. The page is a mosaic. Every musician has an identity, not just a slot.

## 2. Why This Direction

Student musicians are visual people. Designers, filmmakers, and musicians all respond to color as identity. Every other musician directory looks like a spreadsheet. Mosaic treats each musician like they have a color — because they do. The floating 3D board in the hero communicates: *there are real, different people here*. The spring-physics entrance animations communicate: *this is crafted with care*. Together they make the directory feel like a gallery, not a database.

## 3. Color System

**Page base:**

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FAFAF8` | Off-white base — warm, not stark |
| `bg.section` | `#F2F1EE` | Alternating section background |
| `ink.primary` | `#1A1A18` | All primary text |
| `ink.secondary` | `#5C5C55` | Subheads, body |
| `ink.muted` | `#9B9B8E` | Metadata, timestamps |
| `accent.blue` | `#2563EB` | CTAs, links |
| `accent.blue.hover` | `#1D4ED8` | Hover |
| `accent.green` | `#16A34A` | Availability dot only |

**Card identity palette (assigned by musician ID mod 6):**

| Slot | Name | Hex | Paired ink |
|---|---|---|---|
| 0 | Coral | `#FEE2E2` | `#991B1B` |
| 1 | Sage | `#DCFCE7` | `#166534` |
| 2 | Sky | `#DBEAFE` | `#1E40AF` |
| 3 | Butter | `#FEF9C3` | `#854D0E` |
| 4 | Lavender | `#EDE9FE` | `#5B21B6` |
| 5 | Peach | `#FFEDD5` | `#9A3412` |

The color system is the identity system. No two musicians look the same. The page is the proof.

## 4. Typography

- **Display headline:** Fraunces 700 (optical size variable), `clamp(52px, 7vw, 96px)`, tracking `-0.02em`, leading `1.0`. A warm serif with personality — not cold editorial, not precious. It looks like it was chosen by a person.
- **Body:** DM Sans 400, 16/27.
- **Label:** `font-mono` 11px uppercase tracking `+0.16em`, `ink.muted`.
- **Card name:** DM Sans 700, 18px.
- **Card color label:** DM Sans 600, 12px, in the card's paired ink color.

```bash
npm install @fontsource-variable/fraunces @fontsource/dm-sans
```

The Fraunces variable axis lets the headline weight shift on scroll — heavier at the top, lighter as you scroll. Set `wght` via `useScroll` → `useTransform`.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [FLOATING PROFILE CARDS — Three.js — 50vh]          │  │
│  │                                                        │  │
│  │  [coral]        [sage]      [sky]                     │  │
│  │      [butter]       [lavender]    [peach]             │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  A directory where every                                    │
│  student musician has a voice.                              │  ← Fraunces display
│                                                              │
│  Browse free. Email directly. No middleman.                 │
│                                                              │
│  [ Browse musicians ]   [ Post a gig ]                     │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──┐ │  ← card grid
│  │coral │  │sage  │  │sky   │  │butter│  │laven.│  │peach│ │     (Framer stagger)
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──┘ │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## 6. The Signature: Three.js Floating Card Board

```bash
npm install three @react-three/fiber @react-three/drei
```

**What it is:** A 3D bulletin board — 8 musician cards floating at different depths, each a `<mesh>` with the card's identity color, gently drifting.

**Implementation:**

```tsx
// Each card is a BoxGeometry(2.2, 1.3, 0.06)
// Material: MeshStandardMaterial({ color: cardColor, roughness: 0.7, metalness: 0.02 })
// Position: randomized seed (deterministic from card ID) within bounds [-6, 6] x [-2.5, 2.5]
// Z-depth: -1.0 to +0.5 — back cards recede, front cards protrude
```

**Motion:**
Each card has an independent drift orbit via `useFrame`:
```glsl
// Per-card offset from unique seed:
mesh.position.x = baseX + Math.sin(time * speed + phaseX) * 0.4;
mesh.position.y = baseY + Math.cos(time * speed + phaseY) * 0.25;
mesh.rotation.z = Math.sin(time * 0.3 + phaseZ) * 0.06;
```

Cards drift slowly and independently — like notes pinned to a board by imperfect pins, gently swaying.

**Mouse parallax:**
```tsx
// Mouse moves the camera slightly:
useFrame(({ camera, pointer }) => {
  camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.04;
  camera.position.y += (pointer.y * 0.8 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);
});
```

The whole board shifts with your cursor — parallax depth becomes apparent as the Z-positions separate.

**`<Html>` overlays:**
Each card mesh has a `@react-three/drei` `<Html transform>` child rendering the card name and instrument. The text is real DOM, color-coordinated to the card's paired ink.

**Click:** Clicking a floating card triggers a Framer `AnimatePresence` overlay that expands the clicked card's content into a full-screen profile preview with a spring expand animation. `layoutId` on the card ensures a shared-element transition between the 3D card and the overlay.

**Camera:** `PerspectiveCamera` at `[0, 0, 7]`, `fov: 60`. `ambientLight` 0.7, `directionalLight` soft from top-right.

`prefers-reduced-motion`: all cards static, camera fixed, no drift, no mouse parallax.

## 7. The Card Grid — Spring Stagger

Below the Three.js hero, 6 profile cards in a 3-column grid (2-column tablet, 1-column mobile).

Each card uses its identity color as background. Framer entrance:

```tsx
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const card = {
  hidden: { opacity: 0, y: 32, scale: 0.94, rotate: -1 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};
```

Cards enter with a slight rotation snap — like photos being tossed onto a table.

**Hover:**
```tsx
whileHover={{
  y: -8,
  scale: 1.02,
  rotate: 1,
  boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
}}
transition={{ type: "spring", stiffness: 280, damping: 18 }}
```

The hover lifts and leans — like picking up a photo. Every card's shadow is slightly warm-tinted to match its identity color.

**The card anatomy:**
```
┌──────────────────────────────┐
│  bg: coral (#FEE2E2)          │
│                               │
│  MUSICIAN · UT AUSTIN        │  ← mono 11px, ink.muted
│  Maya Chen                   │  ← DM Sans 700 18px, #991B1B
│  Guitar · Vocals · Indie     │  ← DM Sans 400 14px, ink.secondary
│  ● Open to collaborate       │  ← green dot + Outfit 500 13px
│                               │
│  [guitar] [vocals] [indie]   │  ← bg: white/40%, text: #991B1B
│  ─────────────────────────   │
│  Contact →                   │  ← link in card's ink color
└──────────────────────────────┘
```

The skill tags use `rgba(255,255,255,0.45)` background on the card color — they're legible but not harsh.

## 8. Variable Font Scroll Effect

The Fraunces headline uses its variable `wght` axis to get heavier as you scroll down (inverse of typical scroll fade):

```tsx
const { scrollY } = useScroll();
const fontWeight = useTransform(scrollY, [0, 400], [600, 900]);
// Applied as: style={{ fontVariationSettings: `"wght" ${fontWeight}` }}
```

It's subtle — the headline gets more confident as you commit to reading. A detail only designers notice.

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #2563EB
text: #FFFFFF
height: 52px, px: 28px
radius: 10px
font: DM Sans 700, 15px
hover: bg #1D4ED8, scale 1.02
shadow: 0 6px 20px rgba(37,99,235,0.3)
Framer: whileHover spring stiffness 280 damping 20
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #2563EB
text: #2563EB
radius: 10px
hover: bg rgba(37,99,235,0.06)
```

## 10. Open Gigs Strip

Three gig cards below the musician grid, each also with an identity color (drawn from the posting organization's ID):

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ bg: sky (#DBEAFE)    │  │ bg: butter (#FEF9C3) │  │ bg: sage (#DCFCE7)  │
│                      │  │                      │  │                      │
│ GIG · COMPOSER       │  │ GIG · GUITARIST      │  │ GIG · VOCALIST      │
│ Thesis Short Film    │  │ Indie EP Recording   │  │ Podcast Intro       │
│ UT Austin · PAID     │  │ Remote · UNPAID      │  │ Remote · NEGOTIABLE │
│ Apply via email →    │  │ Apply via email →    │  │ Apply via email →   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

Same hover lift animation as musician cards.

## 11. How It Works

Three rows, each with a small colored square (the identity palette at 24px) as a visual bullet:

```
█ coral   Browse the directory.      No account. Fully open.
█ sage    Find who you need.         Filter, browse, explore.
█ sky     Email them directly.       No DMs. No platform fee.
```

The colored squares cycle through the card palette — a subtle callback to the mosaic theme.

## 12. Stats

Three centered stats above the card grid, on `bg.page`:

```
  142           24           12
musicians    open gigs    universities
```

Numbers in Fraunces 800 64px `ink.primary`. On `useInView`, Framer `animate()` counts up with `ease: [0.16, 1, 0.3, 1]` over 1.4s.

## 13. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource-variable/fraunces @fontsource/dm-sans
```

## 14. Implementation Notes

- Card color assignment: a deterministic `colorFromId(id: string): CardColor` function — `id.charCodeAt(0) % 6`. Same color every page load, every session.
- Three.js drift: each card has a `phase` object seeded from its ID using a simple LCG. Fully deterministic — the board looks the same on every load, not random each render.
- `<Html transform>` in Three.js: set `occlude` to the other card meshes so front cards occlude back ones — adds depth.
- Framer `layoutId` for click-expand: the card's `layoutId` must match between the Three.js overlay and the grid card below. Use the musician's ID string.
- Variable font: only `wght` axis used. Include only the `wght` 400–900 range in the woff2 subset to keep font size under 40KB.
- `prefers-reduced-motion`: Three.js static, all card enters instant, scroll weight effect disabled, hover lifts still work at `duration: 0.15`.

## 15. The Test

Load the page. Scroll the Three.js hero slowly. If the cards clearly separate in Z-depth (you can see which is in front) the parallax is working. If they look flat, increase the camera parallax multiplier from `1.5` to `2.2`.

Then look at the card grid. Every card should feel like a different person — not a slot in a list. If you can cover the names and still distinguish the cards by color and feel, the identity system is working. If they all feel the same despite the colors, the typography within each card is too uniform — vary the bio length or instrument count.
