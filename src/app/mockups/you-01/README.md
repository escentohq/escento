# Landing Design 01 — **Bold Editorial**

> I'm a creative director who's done editorial identities for three independent music labels and two art-school publications. The web is drowning in soft gradients and rounded corners. Brutalist editorial refuses that entirely — it uses the grid itself as the design, type at sizes that feel physically loud, and the one place no other landing page goes: a Three.js 3D typographic sculpture where genre words exist as extruded physical letterforms floating in space. You don't see a marketing page. You see a statement.

---

## 1. The Concept

Off-white newsprint page. A Three.js scene fills the entire hero background: the word `JAZZ` extruded 40 pixels deep, tumbling slowly in 3D space — behind it, `INDIE`, `SOUL`, `FOLK`, receding in Z-depth, each a different neutral gray. They drift and rotate at different speeds. Over this: a massive serif headline, a bold subline, two rectangular CTAs. Below: a full-bleed Framer Motion genre marquee in black with white oversized italic text, then a brutal 3-column pitch section separated by thick rules. The page looks like a magazine cover and a sculpture simultaneously.

## 2. Why This Direction

Every music platform looks the same: dark gradient, glowing CTA, dancing waveform. Bold Editorial refuses all of it. It borrows the visual language of the music press — NME, Pitchfork's print era, The Wire — and makes it interactive. The 3D type sculpture does what no static editorial page can: it communicates that the musicians on this platform have dimension, weight, and physical presence. GigForge is not a feed. It's a record.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F2EFE8` | Warm newsprint — aged, intentional, not SaaS white |
| `bg.black` | `#0E0D0B` | Marquee band, nav hover, CTA fill |
| `type3d.near` | `#D8D3CA` | Closest 3D letterforms — warm light gray |
| `type3d.mid` | `#B8B0A4` | Mid-depth letterforms |
| `type3d.far` | `#8A8278` | Farthest letterforms — receding |
| `type3d.face` | `#E8E4DC` | Front face of each letter — slightly lighter than page |
| `ink.primary` | `#0E0D0B` | Headlines, body |
| `ink.secondary` | `#5A5650` | Subheads, italic secondary line |
| `ink.muted` | `#8A8278` | Metadata, kicker |
| `accent.red` | `#C8331C` | ONE accent — issue number, the OPEN dot, the primary CTA hover |
| `border.rule` | `#0E0D0B` | All editorial rules — 1px, 2px, 4px |
| `marquee.bg` | `#0E0D0B` | Genre marquee band |
| `marquee.text` | `#F2EFE8` | Genre text in marquee |

Black, newsprint, one red. The red is used exactly three times. Any more and it becomes decoration.

## 4. Typography

- **Display:** Playfair Display 900 Italic, `clamp(72px, 10vw, 144px)`, tracking `-0.02em`, leading `0.92`. The size is the design.
- **Subline:** Same Playfair, Regular Italic, 60% scale, `ink.secondary` — `Skip the middleman.` The contrast between 900 and 400 weight is the personality.
- **Kicker:** `font-mono` 11px uppercase tracking `+0.18em`, `ink.muted`: `ISSUE NO. 01 · SPRING ·`
- **Body:** Inter 400, 17/1.6, `ink.secondary`.
- **Marquee:** Playfair Display 700 Italic, 180px desktop / 96px mobile, `marquee.text`.
- **Pitch numbers:** `font-mono` 13px `ink.muted`.
- **Pitch headlines:** Inter 700 22px `ink.primary`.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                               Sign in · Issue 01  │  ← nav, thin bottom rule
├════════════════════════════════════════════════════════════╡  ← 4px rule
│                                                              │
│  [[[[ 3D extruded type — JAZZ INDIE SOUL — floating ]]]]    │  ← Three.js full-hero
│                                                              │
│  ISSUE NO. 01 · SPRING ·                                    │  ← kicker
│                                                              │
│  Book the band.                                              │  ← 144px serif 900
│  Skip the middleman.                                         │  ← 86px serif italic 400
│                                                              │
│  GigForge connects student musicians with student creators.  │
│  Browse free. Email directly. No agents. No feeds.          │
│                                                              │
│  [ Sign in ]   Browse musicians →                            │
│                                                              │
╠════════════════════════════════════════════════════════════╡  ← 4px rule
│  JAZZ ★ INDIE ★ HIP-HOP ★ FOLK ★ ELECTRONIC ★ CLASSICAL  │  ← Framer marquee
╠════════════════════════════════════════════════════════════╡  ← 4px rule
│                                                              │
│  01 / For creators │  02 / For musicians │ 03 / For the    │  ← pitch cols
│                    │                      │     scene        │
└────────────────────────────────────────────────────────────┘
```

Max-width `1280px`. No centering on the hero headline — left-aligned, flush to the column. The type fills the container edge-to-edge on desktop.

## 6. The Signature: Three.js 3D Typographic Sculpture

```bash
npm install three @react-three/fiber @react-three/drei
```

Each genre word is a three-dimensional extruded text object using `TextGeometry` from `three/addons/geometries/TextGeometry.js` with a loaded typeface JSON (Playfair Display converted via facetype.js):

**Word placement:**
```
JAZZ     — position [0, 0.5, 0],   rotation [0.04, 0.02, -0.03],   depth 0.4
INDIE    — position [-1.2, -0.8, -3], rotation [-0.05, 0.12, 0.02], depth 0.3
SOUL     — position [2.1, 1.2, -6],  rotation [0.08, -0.06, 0.04],  depth 0.25
FOLK     — position [-2.4, 0.2, -9], rotation [-0.03, 0.08, -0.06], depth 0.2
CLASSIC  — position [1.0, -1.5, -12], rotation [0.06, 0.03, 0.07],  depth 0.18
```

**Materials:**
- Front face: `MeshStandardMaterial` `type3d.face` — the warm off-white face catches the key light
- Side extrusion: `MeshStandardMaterial` `type3d.near` (darkened by 20% for far-depth words) — the depth reads as shadow
- `roughness: 0.9`, `metalness: 0.0` — matte paper texture, not plastic

**Lighting:**
- `ambientLight` intensity `0.5` color `#FFF8F0`
- `directionalLight` from `[3, 6, 4]` intensity `0.8` color `#FFFBF4` — warm key from top-right
- `directionalLight` from `[-4, -2, 2]` intensity `0.15` color `#E8E0D0` — soft fill from bottom-left

**Animation:**
- Each word rotates independently on all three axes with unique speed seeds: `rotation.x += 0.0003 * speedX; rotation.y += 0.0004 * speedY; rotation.z += 0.0001 * speedZ`
- Camera auto-orbits: `camera.position.x = sin(t * 0.06) * 1.2, camera.position.y = cos(t * 0.04) * 0.4` — barely perceptible drift that gives the scene depth parallax
- **Cursor parallax:** on `pointermove`, camera target shifts `±0.6` units in X/Y toward cursor, eased by `0.05` per frame — the type field drifts to follow your eye

**Canvas:** `position: absolute, inset: 0, pointer-events: none`. Background: `bg.page` color (not transparent — the Three.js bg matches the page).

`prefers-reduced-motion`: no rotation, no camera drift, static sculpture.

## 7. Genre Marquee — Framer Motion

Full-bleed `bg.black` band, 160px tall desktop / 100px mobile. Content:

```
JAZZ ★ INDIE ★ HIP-HOP ★ FOLK ★ ELECTRONIC ★ CLASSICAL ★ PUNK ★ SOUL ★
```

`★` separators at 40px, `accent.red`. Text at Playfair 700 Italic 180px in `marquee.text`.

```tsx
const controls = useAnimation();
// onHoverStart: controls.stop()
// onHoverEnd: controls.start({ x: ["0%", "-50%"] })
```

Speed: 45s for a full loop. On hover: marquee pauses, `AnimatePresence` fades in `(paused)` pill at right edge in `accent.red` on `bg.black`.

## 8. Pitch Section — Three Columns

Heavy 4px `border.rule` above each column, then:

```
01 / For creators
Browse musicians, post a gig brief, receive direct replies by email.
No platform cut. No DMs.

02 / For musicians
Build a profile. List your instruments, your campus, your availability.
Clients contact you directly.

03 / For the scene
Every campus music department deserves infrastructure.
This is that infrastructure.
```

Column entrance via Framer on scroll:
```tsx
const pitchVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};
// staggerChildren: 0.15
// transition: { type: "spring", stiffness: 140, damping: 20 }
```

## 9. CTAs

**Primary** — `Sign in`:
```
bg: #0E0D0B
text: #F2EFE8
height: 52px, px: 28px
radius: 0px (NO rounding — this is editorial)
font: Inter 600, 15px
hover: bg #C8331C (the red swap — the one chromatic moment)
transition: 200ms
```

**Secondary** — `Browse musicians →`:
```
No button shape. Inter 600 #0E0D0B with 1px underline.
Arrow in accent.red. Advances 6px on Framer whileHover.
```

## 10. Stats — Newspaper Numbers

```
142        24 open gigs        12
musicians  posted this week    universities
```

Numbers in Playfair Display 900 72px `ink.primary`. Labels `font-mono` 11px uppercase `ink.muted`. Framer `animate()` count-up on `useInView`, 1.6s `ease: "easeOut"`. Between stat blocks: 2px vertical `border.rule` rules.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/playfair-display
```

## 12. Implementation Notes

- `TypeSculpture.tsx` — Three.js scene, always `dynamic(..., { ssr: false })`. Loads the Playfair typeface JSON async on mount.
- `TextGeometry` import: `import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'`. Extend: `extend({ TextGeometry })` in the R3F component.
- Typeface JSON: generate at `gero3.github.io/facetype.js` from the woff2. Host as `/public/fonts/playfair.json`. Size: ~180KB.
- The scene canvas `position: absolute` in the hero causes the hero to need `position: relative, overflow: hidden, min-height: 80vh`.
- Hero content (`z-index: 1, position: relative`) sits above the canvas (`z-index: 0`).
- Genre marquee: duplicate content 3× inside the `motion.div` — using 2 copies causes a visible seam at certain viewport widths.

## 13. The Test

Print the hero at A3. Pin it to a wall. Walk 5 meters back. If you can read the headline and feel the genre words' presence without walking forward — the type size is correct. If the 3D sculpture reads as "logo" rather than "sculpture," reduce the front-face brightness by 8% so the extruded depth registers more clearly. The subline must be legible against the 3D type at all viewport widths — test at 1280px, 768px, and 375px.
