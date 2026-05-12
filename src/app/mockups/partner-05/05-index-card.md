# Landing Design 05 — **Profile Stack**

> I'm a product designer and creative technologist who worked at a professional network for three years before joining a music startup. The best professional directories lead with real people. But "lead with a person" is just a card on a white page — anyone can do that. Profile Stack goes further: the cards exist in 3D space, stacked at real angles, and a Three.js vinyl record spins in the background with the texture and weight of physical media. The stack IS the network. The record IS the music.

---

## 1. The Concept

Clean off-white page. A Three.js vinyl record rotates slowly behind the hero — matte black disc, subtle label detail, a warm specular highlight that shifts with camera angle. In front of it: a centered stack of three musician profile cards. The top card is fully visible and interactive, with a Framer Motion 3D tilt that tracks your cursor. The cards below it peek out at offset angles. Click a back card — it springs to the front with a physics-based swap. This is LinkedIn if LinkedIn cared about the physical artifact of music.

## 2. Why This Direction

Student musicians care deeply about physical media — vinyl, cassettes, liner notes. A spinning Three.js record in the background says "this platform understands what you make" without a single word of copy. The profile card stack says "you are the product, presented professionally." Together: professional credibility + musical authenticity. The combination no competitor can copy because it requires both skills to execute.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F3F2EF` | Warm off-white — the professional network standard |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.pill` | `#EEF3FB` | Skill tag backgrounds |
| `vinyl.disc` | `#0D0D0D` | Vinyl record surface |
| `vinyl.label` | `#E8DFD0` | Record center label — warm cream paper |
| `vinyl.groove` | `rgba(255,255,255,0.03)` | Groove highlight rings |
| `vinyl.spec` | `rgba(255,255,255,0.12)` | Specular highlight on disc |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.12)` | Section dividers |
| `ink.primary` | `#191919` | Headlines, names |
| `ink.secondary` | `#555555` | Subheads, instruments |
| `ink.muted` | `#888888` | Metadata, timestamps |
| `accent.blue` | `#0A66C2` | Primary CTA, active links |
| `accent.blue.hover` | `#004182` | Hover state |
| `status.available` | `#16A34A` | Availability dot |

Professional blue + warm off-white. The vinyl behind brings the depth.

## 4. Typography

- **Display headline:** Inter 700, `clamp(36px, 5vw, 68px)`, tracking `-0.025em`, `ink.primary`.
- **Subhead:** Inter 400, `clamp(16px, 1.5vw, 20px)`, leading `1.6`, `ink.secondary`.
- **Mono / metadata:** `font-mono` 11px uppercase tracking `+0.1em`, `ink.muted`.
- **Card name:** Inter 700, 22px.
- **Card meta:** Inter 400, 14px, `ink.secondary`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
│                                                              │
│  [[[[ vinyl record spinning — Three.js, behind stack ]]]]   │
│                                                              │
│    The professional network        ┌──────────────────────┐ │
│    for student musicians.          │  ● AVAILABLE          │ │
│                                    │  Maya Chen           │ │  ← top card, 3D tilt
│    Browse free. No account        │  Guitar · Vocals      │ │
│    needed to find someone.        │  UT Austin · '25      │ │
│                                    │                        │ │
│    [ Browse musicians ]            │  "Indie, folk, film." │ │
│    Post a gig                      │  [guitar] [vocals]    │ │
│                                    │  hello@maya.example → │ │
│                                    └──────────────────────┘ │
│                                 └──────────────────────┘    │  ← card 2 peek
│                              └──────────────────────┘       │  ← card 3 peek
│                                                              │
│         142 musicians · 24 open gigs · 12 universities      │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

Left/right 2-column on desktop. Stack occupies the right 55%. Vinyl is behind the stack, visible in the gap between cards.

## 6. The Signature: Three.js Vinyl Record

**The record:**
- `CylinderGeometry(3.2, 3.2, 0.06, 64)` — the disc. Material: `MeshStandardMaterial`, `color: #0D0D0D`, `roughness: 0.15`, `metalness: 0.6`.
- Groove rings: 24 concentric `THREE.RingGeometry` planes stacked 0.001 apart, each `MeshBasicMaterial` `rgba(255,255,255,0.03)` — the visual groove texture.
- Specular highlight: `DirectionalLight` from `[3, 8, 5]` — the highlight arc sweeps the disc as it rotates, physically correct.
- Center label: `CylinderGeometry(0.8, 0.8, 0.07, 32)`, `MeshStandardMaterial` `color: #E8DFD0`, `roughness: 0.9`, `metalness: 0`. A `<Html>` overlay shows "GIGFORGE" in JetBrains Mono 8px centered on the label.
- Rotation: `mesh.rotation.y += 0.004` per frame (33.3 RPM scaled to visual comfort — actual 33.3 RPM looks too fast).
- Tilt: the disc rests at `rotation.x = -0.3` — viewed from slightly above, like a record lying on a table.

**Positioning:**
- Canvas positioned `absolute, inset: 0, pointer-events: none, z-index: 0` in the hero
- Record centered at `[0, 0, -2]` — it sits behind the card stack in Z space
- Visible through the gap between cards — you see it when you move the top card with tilt

`prefers-reduced-motion`: rotation stops, record static.

## 7. Profile Card Stack — Framer Motion

**Top card — 3D cursor tilt:**
```tsx
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);
const rotateY = useTransform(mouseX, [-1, 1], [-8, 8]);
const rotateX = useTransform(mouseY, [-1, 1], [6, -6]);

<motion.div
  style={{ rotateX, rotateY, transformPerspective: 1000 }}
  onPointerMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width * 2 - 1);
    mouseY.set((e.clientY - rect.top) / rect.height * 2 - 1);
  }}
  onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
>
```

The card tilts toward the cursor — feels like holding a physical card.

**Back cards:**
- Card 2: `translateX(20px) translateY(12px) rotate(-3deg)`, `opacity: 0.6`, `filter: blur(0.5px)`
- Card 3: `translateX(40px) translateY(24px) rotate(-6deg)`, `opacity: 0.35`, `filter: blur(1.5px)`

**Card swap:** clicking a back card uses `AnimatePresence` with `layoutId` — spring-physics promotion to front:
```tsx
// spring: { stiffness: 320, damping: 28 }
// exit: back card slides to its new position in the stack
```

**Floating animation on top card:**
```tsx
animate={{ y: [0, -8, 0] }}
transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
```

Slow, breathing lift. The card floats above the vinyl like it's magnetically levitated.

## 8. Skill Tags as Navigation

Each chip (`[guitar]`, `[vocals]`) is a Framer `motion.span`:
```tsx
whileHover={{ scale: 1.08, backgroundColor: "#0A66C2", color: "#FFFFFF" }}
transition={{ duration: 0.15 }}
```

Clicking deep-links to `/musicians?instrument=guitar`. The landing page IS the product.

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 48px, px: 24px
radius: 24px (pill)
font: Inter 600, 15px
hover: bg #004182
shadow: 0 4px 16px rgba(10,102,194,0.25)
hover shadow: 0 8px 24px rgba(10,102,194,0.35)
transition: spring stiffness 280 damping 20
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #0A66C2
text: #0A66C2
radius: 24px
hover: bg rgba(10,102,194,0.08)
```

## 10. Stats — Animated Count-Up

```
142 musicians      24 open gigs      12 universities
Browse →           See what's posted →    Your campus →
```

Numbers in Inter 700 52px `ink.primary`. Framer `animate()` count-up on `useInView`, 1.4s `ease: "easeOut"`. Each number is a link. Professional, not decorative.

## 11. How It Works

```
01  Browse the directory       No account. Just search.
02  Find someone you like      Their email is right there.
03  Reach out directly         No DMs. No middleman.
```

Numbers in `accent.blue` `font-mono`. Headlines Inter 600 `ink.primary`. Body Inter 400 `ink.secondary`. Framer stagger on scroll.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 13. Implementation Notes

- `VinylRecord.tsx` — Three.js scene, always `dynamic(..., { ssr: false })`.
- Groove rings: generate all 24 as a single `THREE.BufferGeometry` with `LineSegments` for performance — not 24 separate meshes.
- Card swap state: `const [order, setOrder] = useState([0, 1, 2])`. Top card = `order[0]`. On click of back card: `setOrder(prev => [clickedIndex, ...prev.filter(i => i !== clickedIndex)])`. `AnimatePresence` + `layoutId={musician.id}` handles the spring animation automatically.
- The vinyl should be visible at ≥15% of its surface area behind the card stack at all times — if it disappears entirely, enlarge the disc or reduce the card height.
- `prefers-reduced-motion`: no tilt, no float, no record rotation, no count-up. All static.

## 14. The Test

Show the page to someone who owns vinyl records. Point to the record in the background. If they say "oh that's a record" before you explain it, the Three.js geometry is legible. If they say "what's that circle," increase disc contrast: push `vinyl.groove` opacity to 0.06 and add a thicker label ring at `CylinderGeometry(0.85, 0.85, 0.065, 32)` in slightly darker cream.
