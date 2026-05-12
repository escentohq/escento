# Landing Design 06 — **Indie Magazine**

> I spent seven years in independent music publishing. Music editorial at its best is alive: pages that feel like the record is playing while you read. Indie Magazine takes that literally. The Three.js piece is a slowly rotating 3D magazine — real geometry, a spine, two covers, inner pages that fan slightly as it turns — like finding a copy of the magazine on a coffee table. Framer Motion handles the article entrances: each card folds in from the spine, as if the magazine is opening in front of you. The page doesn't reference music culture. It IS music culture.

---

## 1. The Concept

Very light warm white page. A Three.js 3D magazine object slowly rotates in the hero center — a real book geometry with visible spine, cover image area, and inner pages visible when the angle catches them. The magazine turns on a gentle Y-axis rotation, hovering slightly above a shadow on the surface below it. The cursor tilts it slightly on X. Over and below: editorial serif content, muted red accent, a sidebar with three active gig listings, and article-style card entrances via Framer. The page is a periodical. GigForge is the publication.

## 2. Why This Direction

Independent music culture is delivered through publications — zines, college papers, record store newsletters. Every student musician reads them. By making the landing page feel like one — in visual language, in article structure, AND in the physical presence of a rotating 3D magazine — Indie Magazine earns trust from the audience most likely to use GigForge. The 3D magazine is not a gimmick: it communicates that GigForge takes the work of student musicians seriously enough to publish it.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FAF8F2` | Very light warm white — aged paper tint |
| `bg.surface` | `#FFFFFF` | Cards, article blocks |
| `bg.sidebar` | `#F4F0E8` | Sidebar background |
| `mag.cover` | `#1A1410` | Magazine cover — ink black |
| `mag.spine` | `#2C2418` | Spine — slightly lighter dark |
| `mag.page` | `#FDFAF4` | Inner pages — warm white |
| `mag.title` | `#FAF8F2` | Cover title text |
| `mag.accent` | `#C8331C` | Cover accent stripe |
| `border.rule` | `#1A1410` | All editorial rules |
| `ink.primary` | `#1A1410` | Body, headlines |
| `ink.secondary` | `#4A4440` | Subheads |
| `ink.muted` | `#8A8278` | Metadata, section labels |
| `accent.red` | `#C8331C` | Kicker, links, "OPEN" dot, CTA hover |
| `accent.red.wash` | `#F8EAE6` | Sidebar border, active article highlight |

Warm white + ink black + editorial red. Three colors. Magazine discipline.

## 4. Typography

- **Display:** Playfair Display 700 Italic, `clamp(48px, 6.5vw, 96px)`, tracking `-0.01em`, leading `1.02`.
- **Masthead:** Playfair Display 900, 28px centered, `GIGFORGE REVIEW`. Italic subline: `A directory for campus sound`.
- **Kicker:** Inter 500 11px uppercase tracking `+0.14em` `accent.red`: `A DIRECTORY FOR CAMPUS SOUND`.
- **Body:** Inter 400, 17/1.62, `ink.secondary`.
- **Sidebar label:** Inter 500 11px small-caps tracking `+0.12em`, `ink.muted`.
- **Article headline:** Playfair Display 700 24px.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│              GIGFORGE REVIEW                                 │  ← masthead centered
│              A directory for campus sound                    │
│  ──────────────────────────────────────────────────────    │  ← 2px rule
├────────────────────────────────────────────────────────────┤
│                                                              │
│                 [THREE.JS MAGAZINE OBJECT]                   │
│            spinning slowly, lit from upper left             │
│                                                              │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                   │  ← sidebar
│  A DIRECTORY FOR         │  NOW LISTING                     │
│  CAMPUS SOUND            │  ─────────────                  │
│                          │                                   │
│  The next collaborator   │  Feature 01 / Short films →      │
│  is probably three       │  Feature 02 / Indie games →      │
│  buildings away.         │  Feature 03 / Live events →      │
│                          │                                   │
│  [ Read the directory ]  │  142 musicians listed            │
│  Submit a gig →          │                                   │
│                          │                                   │
├──────────────────────────┴─────────────────────────────────┤
│                                                              │
│  THIS WEEK ON GIGFORGE   ← 3 article-style feature cards   │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## 6. The Signature: Three.js Rotating 3D Magazine

**Magazine geometry:**
- Cover: `BoxGeometry(2.2, 3.0, 0.08)` — the cover/back, slightly thick.
- Spine: `BoxGeometry(0.18, 3.0, 0.08)` positioned at the left edge, merged visually with the cover.
- Inner pages: 8 `PlaneGeometry(2.0, 2.9)` planes stacked at Z `0.005` apart, each at a slightly different color graduation from `#FDFAF4` (near) to `#EDE8DC` (back). They fan very slightly — `rotation.z` varies by `0.004 * index` — visible from the side as the magazine rotates.

**Cover design:**
- Cover face: `MeshStandardMaterial` with a canvas texture drawn on load. The canvas renders: black background, `GIGFORGE REVIEW` in large text (Inter 900), a horizontal `#C8331C` rule stripe, and `Spring '26` in `#FAF8F2` mono.
- Spine face: separate material, `mag.spine` color. Small vertical text via canvas texture: `GIGFORGE · VOL. 01`.
- Back cover: plain `#FAF8F2` — the back is boring, realistic.

**Lighting:**
- `ambientLight` 0.4 color `#FFF8F4`.
- `directionalLight` from `[-4, 6, 5]` intensity `0.8` — upper left, casts shadow on the surface below.
- `PointLight` from `[2, 2, 4]` intensity `0.3` — a soft rim light on the right edge.

**Animation:**
- Auto Y-rotation: `mesh.rotation.y += 0.005` — the magazine completes one rotation every ~20 seconds.
- Hover: cursor X position → lerp `rotation.y` speed ±0.003; cursor Y → `rotation.x` ±4deg.
- Levitation: `mesh.position.y = sin(t * 0.5) * 0.04` — gentle breathing float above the implied surface.
- Ground shadow: a blurred `PlaneGeometry` beneath the magazine with `MeshBasicMaterial` at `rgba(26,20,16,0.12)` — a soft elliptical shadow that scales with Y position.

`prefers-reduced-motion`: rotation frozen at 15-degree angle (good view of cover), no float.

## 7. Article Entrances — Framer Motion

The three "THIS WEEK" cards enter as if pages are opening:

```tsx
const articleVariants = {
  hidden: { opacity: 0, rotateY: -15, x: -20 },
  visible: { opacity: 1, rotateY: 0, x: 0 },
};
// transformPerspective: 1000 on parent
// staggerChildren: 0.14
// transition: { type: "spring", stiffness: 160, damping: 20 }
```

Each card rotates from -15deg on Y to 0 — as if a page is being turned toward you. The stagger makes the three cards open in sequence like flipping pages.

**Article card hover:**
```tsx
whileHover={{ y: -2, borderTopColor: "#C8331C" }}
transition={{ duration: 0.2 }}
```

The top border shifts from `ink.muted` to `accent.red` — the "active article" signal.

## 8. Sidebar — Article Listings

Each sidebar entry:
```
──────────────────────────────
SHORT FILMS SEEKING SCORE
Browse anonymously. Contact by email. Keep the project moving.
                                                              →
```

Small-caps category label in `ink.muted`. Headline Playfair 700 18px. Body Inter 400 14px. Arrow `→` in `accent.red`.

Framer entrance from right on scroll:
```tsx
initial={{ opacity: 0, x: 24 }}
whileInView={{ opacity: 1, x: 0 }}
transition={{ staggerChildren: 0.1 }}
```

Row hover: `whileHover={{ borderLeftWidth: "3px", borderLeftColor: "#C8331C", paddingLeft: "12px" }}`.

## 9. CTAs

**Primary** — `Read the directory`:
```
bg: #1A1410
text: #FAF8F2
height: 52px, px: 28px
radius: 2px (editorial — not a SaaS pill)
font: Inter 500, 15px
hover: bg #C8331C (ink to red — the masthead moment)
transition: 220ms
```

**Secondary** — `Submit a gig →`:
```
No button. Playfair Display 400 Italic #C8331C, 1px underline.
Arrow nudges 6px right on Framer whileHover.
```

## 10. Stats — Pull Quotes

Instead of a stat grid, stats are formatted as editorial pull quotes with large Playfair numbers:

```
"142 musicians.
 24 open gigs.
 12 universities."
```

Centered, Playfair Display 700 80px `ink.primary`, quotation marks in `accent.red` at 120px. The numbers are in the text, not separate — they're a pull quote from an article the reader hasn't read yet.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/playfair-display
```

## 12. Implementation Notes

- `MagazineObject.tsx` — Three.js scene, `dynamic(..., { ssr: false })`. Canvas: `400px × 500px` centered in the hero, `pointer-events: auto`.
- Cover canvas texture: `useMemo` — create once. `const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 720`. Draw text with `ctx.font = "bold 64px Inter, sans-serif"` — fonts available via system fallback.
- Page fan: the inner `PlaneGeometry` sheets require `side: THREE.FrontSide` and must be rendered with slight Z fighting prevention: `renderer.polygonOffset = true`, `material.polygonOffsetFactor = -1 * index`.
- The ground shadow ellipse: `<mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.52, 0]}>`. Scale it inversely with `position.y` so it "lifts" as the magazine floats.
- On mobile: rotate the magazine to portrait orientation (no change needed — the geometry is already portrait). Scale to 75% of desktop size.

## 13. The Test

Find a physical magazine. Place it on a table. Look at the page. The 3D magazine should feel like you could reach forward and pick it up. If it feels flat, increase `directionalLight` intensity from 0.8 to 1.1 and add a second fill light from `[4, -2, 3]` at 0.2 intensity — the interplay of two light sources gives the cover its depth. The articles below the magazine should feel like the inside of the magazine spilled out onto the page.
