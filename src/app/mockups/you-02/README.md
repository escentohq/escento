# Landing Design 02 - **Campus Signal**

> I'm a product designer who has built student-facing tools for campus orgs, research labs, and arts programs. The mistake most campus software makes is pretending the internet erased geography. It did not. Students still work in buildings, rehearse in practice rooms, edit in labs, and run across the quad with deadlines in their bags. Campus Signal makes GigForge feel physically local: a low-poly 3D campus map where music buildings glow when there is creative activity inside.

---

## 1. The Concept

Warm parchment page. The hero opens with a Three.js low-poly campus quad viewed from a 45-degree bird's-eye angle. Eight simple building volumes sit on a soft map plane. Two buildings pulse with yellow-green light to indicate active musicians and open gigs. Below the map, the page splits: a massive headline on the left, and a product preview card on the right showing real GigForge actions: search, musician rows, email contact, and role cards.

The page should feel like a campus orientation map crossed with a clean marketplace. Not cute. Not childish. The campus is the first argument: the talent is already around you.

## 2. Why This Direction

GigForge is about reducing the distance between student creators and student musicians. Campus Signal visualizes that distance literally. The glowing buildings answer the emotional question: "Is anyone here?" The search panel answers the practical question: "How do I find them?" The design is clear enough for first-time visitors and spatial enough to feel proprietary.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FAF6EE` | Warm campus-map parchment |
| `bg.map` | `#EFE6D2` | Low-poly ground plane |
| `bg.card` | `#FFFFFF` | Product preview card |
| `building.base` | `#D8CEBC` | Inactive campus buildings |
| `building.roof` | `#C9BDA8` | Building top planes |
| `building.active` | `#B7D85A` | Active music buildings |
| `building.glow` | `rgba(183,216,90,0.28)` | Soft activity halo |
| `path.walkway` | `#DDD1BA` | Campus paths |
| `ink.primary` | `#1A1510` | Headlines and nav |
| `ink.secondary` | `#66563D` | Body copy |
| `ink.muted` | `#9B835E` | Labels and metadata |
| `accent.green` | `#5D8C1E` | Primary CTA, active state |
| `accent.yellow` | `#E8C44A` | Kicker pill, secondary CTA |
| `border.ink` | `#1A1510` | Hard graphic borders |
| `shadow.offset` | `#1A1510` | Preview card offset shadow |

Use mostly parchment, white, and map neutrals. Green is the signal. Yellow is the highlighter.

## 4. Typography

- **Display:** Inter 900, `clamp(44px, 6.5vw, 88px)`, tracking `-0.035em`, leading `0.94`.
- **Kicker:** Inter 800, 11px uppercase tracking `+0.16em`, `accent.green`, on an `accent.yellow` pill.
- **Body:** Inter 400, 17/1.6, `ink.secondary`.
- **Preview UI:** Inter 500/700, 14px, with `font-mono` 11px for row labels.
- **Map labels:** `font-mono` 10px uppercase, `ink.muted`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
TOP: full-width 3D campus map, 35vh min 300px

LEFT HERO
GF / STUDENT CREATIVE NETWORK
Find the student musician your project is missing.
Browse free. Post gigs. Email directly.
[ Browse musicians -> ]  [ Post a gig + ]

RIGHT HERO
Hard-bordered search card with offset shadow
Search row
3 musician results with Email actions
2 role cards: I need music / I make music
```

Max-width `1280px`. The map is full-bleed inside the mockup page, but the text and preview sit inside the 1280px content rail. On mobile, the campus map remains first, then headline, then product preview.

## 6. The Signature: Three.js Low-Poly Campus

**Scene setup:**
- `OrthographicCamera` at `[0, 12, 8]`, looking at `[0, 0, 0]`.
- Ground: `PlaneGeometry(16, 12)`, `MeshStandardMaterial` `bg.map`, `receiveShadow`.
- Walkways: thin `BoxGeometry` strips in `path.walkway`, arranged as a cross through the quad.
- Buildings: eight `BoxGeometry` volumes with different footprints and heights, arranged in two loose rows around the central paths.

**Building data:**
```ts
const BUILDINGS = [
  { name: "Music Hall", x: -4.8, z: -2.8, w: 1.8, d: 2.4, h: 2.8, active: true, count: 14 },
  { name: "Film Lab", x: -1.7, z: -3.0, w: 2.4, d: 1.8, h: 1.8, active: false, count: 4 },
  { name: "Studio Annex", x: 2.0, z: -2.5, w: 1.8, d: 2.0, h: 2.2, active: true, count: 9 },
  { name: "Theater", x: 5.0, z: -2.7, w: 2.0, d: 2.4, h: 2.5, active: false, count: 3 },
  { name: "Media Center", x: -4.4, z: 2.6, w: 2.6, d: 1.8, h: 2.0, active: false, count: 6 },
  { name: "Practice Rooms", x: -1.0, z: 2.7, w: 1.7, d: 1.7, h: 1.5, active: true, count: 18 },
  { name: "Arts Library", x: 2.3, z: 2.6, w: 2.2, d: 1.8, h: 1.6, active: false, count: 2 },
  { name: "Event Hall", x: 5.0, z: 2.4, w: 1.9, d: 2.2, h: 2.1, active: false, count: 5 },
];
```

**Active state:**
- Active buildings use `building.active`.
- Add a low-opacity `CircleGeometry` halo below each active building.
- Add a small `PointLight` with color `#B7D85A`, intensity `1.8`, distance `4`.
- Pulse halo opacity with `0.12 + Math.sin(t * 1.8 + phase) * 0.08`.

**Interaction:**
- Pointer hover raises a building by `0.25` units and shows a small `<Html>` tooltip: `Music Hall / 14 musicians`.
- Camera drifts in a very slow orbit: 80-100 seconds per loop.
- `prefers-reduced-motion`: no orbit, no pulse, no lift.

## 7. Product Preview Card

The preview card should look usable, not decorative.

```text
Search: composer, cello, jazz keys
Maya R. / Guitar + production / Chicago       Email
Theo L. / Film score / Remote                 Email
Nina P. / Violin / Weekend shoots             Email
```

Card styling:
- `bg.card`, `2px solid border.ink`
- `box-shadow: 10px 10px 0 #1A1510`
- Result rows: `1px solid #E2D8C5`, hover shifts `x: 3`
- Email action turns green on hover

Framer row entrance: opacity 0, `x: -12`, stagger `0.08`.

## 8. Role Cards

Two cards beneath the preview:

```text
I need music
Post a project brief and invite direct replies.

I make music
List instruments, links, campus, and availability.
```

Left card white. Right card pale green `#EEF5DA`. Both have `2px` ink borders. On hover: move `y: -4`, add `4px 4px 0 #1A1510`.

## 9. CTAs

**Primary - `Browse musicians ->`:**
```text
bg #1A1510
text #FAF6EE
height 52px
padding x 28px
radius 0
hover bg #5D8C1E
shadow 3px 3px 0 #B7D85A
```

**Secondary - `Post a gig +`:**
```text
bg #E8C44A
text #1A1510
border 2px #1A1510
radius 0
hover shadow 3px 3px 0 #1A1510
```

## 10. Stats

```text
142 musicians      24 open gigs      12 campuses
```

Numbers: Inter 900, 64px, `ink.primary`. Labels: `font-mono` 11px uppercase. Count up on `useInView`, 1.2s. Separate with 2px vertical ink rules.

## 11. How It Works

```text
01 Browse the directory     No account required.
02 Find who you need        Filter by instrument, genre, campus.
03 Email them directly      That is the whole product promise.
```

Step numbers use `accent.green`. Entries stagger upward on scroll.

## 12. Implementation Notes

- `CampusScene.tsx` is client-only via `dynamic(..., { ssr: false })`.
- Keep the scene light: simple boxes, circles, planes, no textures.
- Use `<Html>` only for hover tooltip, not for every building.
- Product preview can be regular DOM and server-rendered.
- Respect `prefers-reduced-motion` in both Three.js and Framer.

## 13. The Test

Cover the headline and show only the map. A viewer should say "campus" or "map" in under 5 seconds. Then ask what the green buildings mean. They should say "active," "available," or "something is happening there." If not, increase glow opacity and reduce the number of nonessential map details. Campus Signal succeeds when locality reads before copy.
