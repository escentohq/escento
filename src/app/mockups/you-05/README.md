# Landing Design 05 - **Clean Directory**

> I have designed marketplace search pages where the best landing page is barely a landing page at all. It is the product, opened to the right state. Clean Directory is the least theatrical concept and maybe the most useful: a luminous search interface where musician cards are already streaming in. The signature is subtle Three.js depth behind the search panel, so the directory feels larger than the first six results without becoming noisy.

---

## 1. The Concept

Pure white page with a cool gray product panel. The hero splits into copy on the left and a functional search preview on the right. Behind the preview, a Three.js depth stack renders soft, out-of-focus result cards receding in Z-space. The front layer is real DOM: search input, filters, musician cards, and direct contact affordances.

This design says: do not read about GigForge. Use it.

## 2. Why This Direction

The product's strongest promise is speed from need to contact. Clean Directory removes marketing friction by making the directory visible immediately. The 3D depth stack communicates scale without fake social proof: there are more people behind the first card, but the interface stays calm.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Clean landing surface |
| `bg.panel` | `#F6F9FC` | Search preview area |
| `bg.card` | `#FFFFFF` | Musician cards |
| `bg.depth` | `#EAF1F7` | Far 3D cards |
| `ink.primary` | `#17202A` | Headlines |
| `ink.secondary` | `#5C6670` | Body |
| `ink.muted` | `#7B8794` | Labels |
| `accent.teal` | `#0F766E` | Active filters, primary action |
| `accent.sky` | `#D7F2FF` | Selected chip background |
| `accent.lime` | `#E7F7C9` | Availability marker |
| `border.light` | `#D5DDE5` | Card borders |
| `border.focus` | `#0F766E` | Search focus |
| `shadow.soft` | `rgba(23,32,42,0.08)` | Preview depth |

Use mostly white. Teal appears only where the user can act.

## 4. Typography

- **Display:** Inter 800, `clamp(42px, 5.8vw, 78px)`, tracking `-0.035em`, leading `1.0`.
- **Kicker:** Inter 800 12px uppercase tracking `+0.18em`, `accent.teal`.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Search input:** Inter 500, 15px.
- **Card titles:** Inter 750, 17px.
- **Metadata:** `font-mono` 11px uppercase.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
LEFT
SEARCH-FIRST LANDING
Start with who you need.
Filter student musicians and open gigs before signing in.
[ Explore directory ] [ View gigs ]

RIGHT
Search input
Filter chips: Instrument / Genre / Remote / Deadline
Six musician cards
Subtle 3D card depth behind the panel
```

Desktop: left column `430px`, right column flexible. Mobile: copy first, search preview second, cards in one column.

## 6. The Signature: Three.js Depth Stack

**Purpose:** suggest a larger directory behind the visible interface without adding visual clutter.

**Scene:**
- Canvas absolutely positioned behind the DOM search panel.
- Three or four large card planes in Z-space.
- Planes use `MeshBasicMaterial` in `bg.depth`, transparent opacity `0.35` to `0.12`.
- Positions:
```text
near:  [0.4, 0.1, -0.8], scale 1.0
mid:   [-0.5, -0.2, -2.0], scale 0.86
far:   [0.9, 0.35, -3.4], scale 0.72
deep:  [-1.0, 0.45, -4.8], scale 0.62
```

**Motion:**
- Slow vertical drift: `sin(t * 0.18 + phase) * 0.08`.
- Cursor parallax shifts cards by `pointer.x * depthFactor`.
- Reduced motion: static cards.

If `@react-three/postprocessing` is available, add `DepthOfField`. If not, simulate softness with low opacity and CSS blur on the canvas container.

## 7. Search Preview

Search input:
```text
Search instruments, genres, or project types
```

Filter chips:
```text
+ Instrument
+ Genre
+ Remote
+ Deadline
```

Chip behavior:
- Hover: background `accent.sky`, border `accent.teal`.
- Active chip: teal text, sky background.
- Framer: chips enter with stagger `0.05`.

## 8. Musician Cards

Six cards:
```text
Film composer
Jazz vocalist
Session drummer
Cellist
Beat producer
Piano accompanist
```

Each card includes:
- Title
- Small teal availability marker
- Metadata line: `Portfolio links / Availability / Contact email`
- `Email` mini-action on hover

Card hover: `y: -3`, border teal, shadow `0 10px 24px rgba(23,32,42,0.08)`.

## 9. CTAs

**Primary - `Explore directory`:**
```text
bg #17202A
text #FFFFFF
height 50px
radius 4px
padding x 24px
hover bg #0F766E
```

**Secondary - `View gigs`:**
```text
bg #FFFFFF
text #17202A
border 1px #17202A
radius 4px
hover bg #F6F9FC, border #0F766E
```

## 10. Stats

```text
142 musicians      24 open gigs      12 universities
```

Stats are compact, not heroic. Place them beneath the search panel or below the fold. Numbers: Inter 800, 44px. Labels: `font-mono` 11px uppercase.

## 11. How It Works

```text
01 Search first      Anonymous browsing, no sign-in wall.
02 Compare quickly   Instruments, genres, links, availability.
03 Email directly    No platform inbox to monitor.
```

Use light rows with left teal number blocks.

## 12. Implementation Notes

- `DepthStack.tsx` is client-only and optional-enhancement: the DOM search panel must stand alone.
- Keep the search panel real HTML for accessibility.
- Do not add fake AI matching language.
- Mobile: hide or simplify the depth canvas if it creates clutter.
- Reduced motion must stop card drift and show chips statically.

## 13. The Test

Give a viewer a project need: "I need a cellist for a short film." If their eyes go to the search panel before the headline, the design works. Clean Directory succeeds when the landing page feels like the first step of the product, not a brochure for it.
