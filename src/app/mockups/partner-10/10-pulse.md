# Landing Design 10 — **Stage**

> I'm a senior product designer with a background in event branding and talent platforms. Every gig-economy product defaults to blue. Stage doesn't. It takes the physical experience of a venue — velvet curtain, warm spotlight, the moment before a performer walks out — and builds a landing page around that feeling. The palette is violet and gold. The hero is a lit stage. The musician IS the content.

---

## 1. The Concept

A soft lavender-white page with a concert venue feeling — warm, anticipatory, alive. The hero is a Three.js "stage scene": a deep violet curtain backdrop with a single point-light source (the spotlight) casting real-time soft shadows on a 3D profile card floating center stage. The card breathes. The light moves gently. The musician's name is the headline. Below: scroll away from the stage into the "lobby" — a lighter section with gig listings and how-it-works.

The entire experience is designed around one question: *what does it feel like to be discovered?*

## 2. Why This Direction

Musicians go to GigForge to be found. Creators go to hire. Stage makes the central act of discovery visceral — you are the audience, the musician is on stage, the spotlight reveals them. It's the most emotionally honest version of what this product does. And it's unmistakable. No other student-app landing page looks like this.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.stage` | `#F5F0FF` | Hero section — soft lavender white |
| `bg.lobby` | `#FFFBF0` | Below-fold sections — warm ivory |
| `bg.card` | `#FFFFFF` | The hero profile card |
| `bg.pill` | `#EDE9FF` | Skill tag backgrounds |
| `curtain.deep` | `#2E1065` | Three.js curtain color — deep violet |
| `curtain.mid` | `#4C1D95` | Curtain fold mid-tone |
| `spotlight.warm` | `#FDE68A` | Three.js point light color — warm amber |
| `gold` | `#D97706` | Headlines, CTA primary, star separators |
| `gold.hover` | `#B45309` | Hover on gold elements |
| `violet` | `#7C3AED` | Secondary CTAs, links, tags |
| `violet.light` | `#8B5CF6` | Hover on violet elements |
| `ink.primary` | `#1C0A3C` | Deep violet-black — warm, not cold |
| `ink.secondary` | `#4B3B6B` | Subheads, body |
| `ink.muted` | `#9D8CB0` | Metadata, timestamps |
| `accent.green` | `#15803D` | Availability dot only |

A palette that belongs on a theater program: violet, gold, warm white. Nothing sterile.

## 4. Typography

- **Musician name (the visual headline):** Cormorant Garamond 700 Italic, `clamp(48px, 6.5vw, 88px)`, tracking `-0.01em`. A serif that belongs on a venue marquee.
- **Display subhead:** Outfit 600, `clamp(20px, 2.5vw, 32px)`, tracking `-0.01em`. Clean contrast to the serif.
- **Body:** Outfit 400, 16/27.
- **Mono label:** `font-mono` 11px uppercase tracking `+0.16em`, `ink.muted`.
- **Stage labels:** Cormorant Garamond 400 Italic 14px, `ink.muted` — for contextual annotations.

```bash
npm install @fontsource/cormorant-garamond @fontsource/outfit
```

The serif/sans mix is intentional: Cormorant is the stage, Outfit is the lobby.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │  ← bg.stage
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │  │  ← Three.js stage scene
│  │    [CURTAIN]    [SPOTLIGHT]    [CURTAIN]              │  │     (40vh canvas)
│  │                                                        │  │
│  │           ┌──────────────────────────┐                │  │
│  │           │  ● OPEN TO WORK          │                │  │  ← profile card floating
│  │           │  *Maya Chen*             │                │  │     in the spotlight
│  │           │  Guitar · Vocals         │                │  │
│  │           │  UT Austin · Music '25   │                │  │
│  │           └──────────────────────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  *Find the musician*                                        │  ← italic serif subhead
│  *your project needs.*                                      │
│                                                              │
│  A directory for student creators. Browse free.            │
│                                                              │
│  [ Browse musicians ]   [ Post a gig ]                     │
│                                                              │
│  ← 1 / 12 →                                               │
├────────────────────────────────────────────────────────────┤  ← bg.lobby begins
│  Three real gigs  ·  How it works  ·  Footer               │
└────────────────────────────────────────────────────────────┘
```

## 6. The Signature: Three.js Stage Scene

```bash
npm install three @react-three/fiber @react-three/drei
```

This is the centerpiece. A concert stage rendered in WebGL.

**Scene components:**

**1. The Curtain:**
Two `PlaneGeometry(3, 4, 1, 32)` panels — left and right. Material: `MeshStandardMaterial({ color: 0x2E1065 })`. The planes have simple vertex displacement (via `useFrame`) that creates a slow wave: `vertex.y += sin(vertex.x * 3 + time * 0.4) * 0.05` — the curtain breathes like fabric.

**2. The Spotlight:**
A `PointLight` at position `[0, 3, 2]`, color `#FDE68A`, intensity `3.0`, decay `1.5`. This is a *real Three.js light* that casts on the card mesh. Gentle oscillation via `useFrame`: `light.position.x = Math.sin(time * 0.2) * 0.5` — the beam drifts, exactly like a follow-spot in a real venue.

A `SpotLight` helper (rendered as a `<mesh>` cone in `spotlight.warm` at 5% opacity) visualizes the beam.

**3. The Profile Card in 3D:**
A `BoxGeometry(2.4, 1.4, 0.04)` with `MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3, metalness: 0.05 })`. The spotlight's point light creates real soft shadows on it. The card *glows* where the light hits — this is physical rendering, not CSS tricks.

`<Html center>` from `@react-three/drei` renders the real card content (name, instrument, school) overlaid on the 3D box — the DOM card IS the 3D card.

**4. Camera:**
`PerspectiveCamera` at `[0, 0.5, 5]`, looking at `[0, 0.2, 0]`. `fov: 50`. Subtle parallax: `useFrame(() => { camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04; })`.

**5. Environment:**
`ambientLight` intensity `0.15` — very dark ambient, so the spotlight does all the work. The result: the card is warmly lit center-frame, the curtains recede into violet shadow. Exactly a stage.

`prefers-reduced-motion`: curtain wave frozen, spotlight locked center, card static.

## 7. Card Cycling with Framer Motion

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentCard.id}
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.97 }}
    transition={{ type: "spring", stiffness: 200, damping: 22 }}
  >
    <MusicianCard musician={currentCard} />
  </motion.div>
</AnimatePresence>
```

The card enters from below — like a performer walking onto a stage — and exits upward. The spring physics give it weight. When cycling, the HTML card and the Three.js `<Html>` content swap simultaneously via a shared state.

Navigation: `← 1 / 12 →` in Cormorant Garamond Italic 18px `gold`. Click arrows or swipe (Framer `drag="x"`).

## 8. Framer Scroll Transition: Stage → Lobby

As the user scrolls past the Three.js canvas, the background transitions from `bg.stage` (lavender) to `bg.lobby` (ivory) using Framer `useScroll` + `useTransform`:

```tsx
const { scrollYProgress } = useScroll();
const bgColor = useTransform(
  scrollYProgress,
  [0, 0.3],
  ["#F5F0FF", "#FFFBF0"]
);
// Applied to the page wrapper as motion.div style={{ backgroundColor: bgColor }}
```

The transition is silky — no hard cut between sections.

## 9. Gig Cards in the Lobby

Three gig cards on `bg.lobby`, each with a subtle golden top-border accent:

```
┌──────────────────────┐
│ ▔▔ COMPOSER          │  ← 3px gold top border
│ Thesis Short Film    │
│ UT Austin · PAID     │
│ Deadline: Jun 1      │
│ Apply via email →    │
└──────────────────────┘
```

Framer entrance: `staggerChildren: 0.1`, `initial={{ opacity: 0, x: -20 }}` → `animate={{ opacity: 1, x: 0 }}` on `useInView`. The cards slide in from the left like theater programs being handed out.

## 10. CTAs

**Primary** — `Browse musicians`:
```
bg: #D97706
text: #FFFFFF
height: 52px, px: 28px
radius: 8px
font: Outfit 700, 15px
hover: bg #B45309, scale 1.02
shadow: 0 8px 24px rgba(217,119,6,0.3)
Framer: whileHover spring stiffness 300 damping 20
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #7C3AED
text: #7C3AED
radius: 8px
hover: bg rgba(124,58,237,0.08), border #8B5CF6
```

The gold/violet split echoes the stage palette — gold is the spotlight, violet is the curtain.

## 11. How It Works

Three rows on `bg.lobby`, each introduced by a small italic serif Roman numeral (Cormorant Garamond Italic 20px in `gold`):

```
  i.   Browse the directory.     No account. Any device.
 ii.   Find who you need.        Filter by instrument, genre, school.
iii.   Email them directly.      No DMs. No platform. Just email.
```

Separated by 1px `rgba(217,119,6,0.2)` golden rules — faint, warm.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/cormorant-garamond @fontsource/outfit
```

## 13. Implementation Notes

- Three.js canvas: `height: 40vh`, full-width. `gl={{ antialias: true, alpha: false }}` — opaque background, `bg.stage` as `scene.background = new THREE.Color(0xF5F0FF)`.
- `<Html>` from `@react-three/drei` for card content — `transform` prop off, `occlude` prop off (card always visible).
- Framer `useScroll` scroll-linked background: apply to a `motion.div` wrapping the entire page, not the body.
- Card cycling: shared `currentIndex` state between the Framer card and the Three.js `<Html>` — one source of truth.
- Spotlight drift: keep within `x: [-0.6, 0.6]` range or the card exits the beam and looks broken.
- `prefers-reduced-motion`: `useReducedMotion()` from Framer — freeze Three.js, skip card entrance animation, scroll background transitions become instant `background-color` switch.

## 14. The Test

Load the page. Don't scroll. Watch for 15 seconds. The page should feel like waiting in the audience for a show to start — anticipatory, warm, slightly cinematic. If it feels like a dark club site, your ambient light is too low — raise it. If the card disappears into the curtains, raise `PointLight.intensity` by 0.5. If the spotlight drift feels annoying rather than alive, slow the oscillation frequency from `0.2` to `0.12`.
