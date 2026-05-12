# Landing Design 11 - **White Stage**

> I have designed for theaters, galleries, and student showcases, and the best performance spaces are not always dark. Sometimes the most powerful stage is a white room with a single pool of light and nowhere for the work to hide. White Stage is the lighter sibling of a black box: bright, spare, architectural, and serious. The signature is a Three.js white-box performance space where a warm spotlight lands on an empty stage waiting for the right musician.

---

## 1. The Concept

Soft white page. A Three.js white-box stage fills the hero: pale walls, shallow risers, a warm spotlight, and a simple performer silhouette appearing at center stage. The headline overlays the architecture with a curtain-rise text reveal. Below, process rows read like a printed stage program: open gig, matched profile, direct email.

The page is restrained and premium, but not dark-mode. It should feel like morning rehearsal in a clean performance hall.

## 2. Why This Direction

GigForge puts student musicians into real creative contexts. White Stage turns that promise into architecture. It has the seriousness of a performance space without the heaviness of black. The empty stage communicates possibility: the right person can step into the project.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F8F7F2` | Warm white theater wall |
| `bg.panel` | `#FFFFFF` | Program rows and cards |
| `stage.floor` | `#E8E2D6` | Stage plane |
| `stage.wall` | `#F1EEE7` | Back and side walls |
| `stage.riser` | `#DCD5C8` | Seating/risers |
| `spotlight.core` | `#FFF1B8` | Warm light center |
| `spotlight.outer` | `rgba(255,206,92,0.18)` | Spotlight falloff |
| `performer.ink` | `#2A2620` | Silhouette |
| `ink.primary` | `#17130F` | Headlines |
| `ink.secondary` | `#5C574F` | Body |
| `ink.muted` | `#969087` | Labels |
| `accent.green` | `#7BAE3A` | Primary CTA, stage marker |
| `accent.gold` | `#D8A928` | Spotlight details |
| `border.subtle` | `#DED8CC` | Program row borders |
| `shadow.stage` | `rgba(50,42,30,0.14)` | Architectural shadows |

The dominant read is warm white. Green appears as the action color, gold as light.

## 4. Typography

- **Display:** Inter 800, `clamp(52px, 7.4vw, 108px)`, leading `0.98`, tracking `-0.035em`.
- **Reveal:** Framer word-level or character-level curtain rise.
- **Body:** Inter 400, 18/1.6, `ink.secondary`.
- **Program labels:** `font-mono` 12px uppercase, `ink.muted`.
- **Program titles:** Playfair Display Italic or Inter 700, 20px.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
NAV: GIGFORGE                         Find musicians

HERO
3D white stage background
Put the right musician in the room.
A directory for student creators. Browse free. Email directly.
[ Find musicians -> ] [ Post a gig ]

BELOW
Program rows:
01 Open gig
02 Matched profile
03 Direct email
```

The Three.js scene should fill most of the first viewport, but the headline and CTAs must remain readable on top of it.

## 6. The Signature: Three.js White-Box Stage

**Architecture:**
- Floor: `PlaneGeometry(12, 16)`, material `stage.floor`, rotated flat.
- Back wall: `PlaneGeometry(12, 6)`, positioned at `z = -7`.
- Side walls: two angled planes, material `stage.wall`.
- Risers: 5 shallow `BoxGeometry` steps near the back or sides, material `stage.riser`.

**Spotlight:**
- `SpotLight` at `[0, 5.5, -1]`, target `[0, 0, -5]`, warm `spotlight.core`.
- Light pool: `CircleGeometry(2.6)`, transparent material `spotlight.outer`, placed on the stage floor.
- Visible beam: optional cone with transparent material, opacity `0.06`.

**Performer silhouette:**
- Simple `ShapeGeometry` or stacked primitives.
- Position `[0, 0.85, -5.2]`.
- Material `performer.ink`, opacity animates from 0 to 1 after 1.2s.

**Camera:**
- `PerspectiveCamera` at `[0, 2.2, 8]`, looking at `[0, 1.1, -4]`.
- Slow dolly toward stage: z from `8` to `7.2` over 30s.
- Pointer pans camera rotation Y by max `0.06`.
- Reduced motion: fixed camera, performer visible immediately.

## 7. Curtain-Rise Headline

Headline:
```text
Put the right musician in the room.
```

Desktop animation:
- Split into words or characters.
- `hidden: { opacity: 0, y: 28, filter: "blur(4px)" }`
- `visible: { opacity: 1, y: 0, filter: "blur(0px)" }`
- stagger `0.035` per character or `0.12` per word

Mobile:
- Word-level stagger only.
- No blur for performance.

## 8. Program Rows

```text
* 01 OPEN GIG
Browse anonymously. See who needs what. No account required.

* 02 MATCHED PROFILE
Find the right student by instrument, genre, campus, availability.

* 03 DIRECT EMAIL
One email. Their inbox. Done. No platform fee.
```

Rows are white cards with subtle borders, arranged full-width inside a max-width container. The asterisk uses `accent.green`. Framer entrance from `y: 28`, stagger `0.15`.

## 9. CTAs

**Primary - `Find musicians ->`:**
```text
bg #7BAE3A
text #FFFFFF
height 52px
radius 4px
padding x 30px
hover bg #668F30, shadow 0 14px 32px rgba(123,174,58,0.22)
```

**Secondary - `Post a gig`:**
```text
bg rgba(255,255,255,0.7)
text #17130F
border 1px #DED8CC
radius 4px
hover bg #FFFFFF, border #7BAE3A
```

## 10. Stats

```text
142 musicians      24 open gigs      12 universities
```

Render as stage dimensions on a program insert. Numbers Inter 800, 64px. Labels `font-mono` uppercase. Thin vertical dividers in `border.subtle`.

## 11. Required Libraries

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `WhiteStageScene.tsx` is client-only via `dynamic(..., { ssr: false })`.
- Keep the scene bright. Do not drift into black theater lighting.
- Use real shadows sparingly; the hall should feel airy.
- Text overlay needs a subtle background gradient or text shadow only if contrast fails.
- Reduced motion disables dolly, dust, and stagger blur.

## 13. The Test

Turn the screen brightness down to 50%. The page should still feel light. If it reads like dark theater, raise wall/floor brightness and reduce silhouette scale. Then hide the 3D scene. The program rows and headline should still explain the product. White Stage succeeds when seriousness comes from space and restraint, not darkness.
