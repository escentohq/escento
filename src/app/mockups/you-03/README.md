# Landing Design 03 - **Studio Ledger**

> I have designed dashboards for labs, production studios, and budget-conscious teams where trust is won through alignment, hierarchy, and restraint. Studio Ledger is GigForge as a quiet operations surface: not a music app, not a social feed, but a clean workbench for getting creative projects staffed. The signature is a Three.js floating ledger panel built in light glass and cool paper, with rows that feel like project cards on a studio clipboard.

---

## 1. The Concept

Cool light-gray page. A floating 3D ledger panel sits on the right side of the hero, rendered like a translucent acrylic clipboard with live project rows. The panel tilts slightly toward the cursor, not like a toy but like a monitor on a studio arm. Left side: a focused headline, direct CTAs, and a status strip. Below: feature columns that read like a studio manual.

This direction is for students with deadlines. It says GigForge is organized, reliable, and respectful of time.

## 2. Why This Direction

Creative student work is chaotic: group chats, text threads, scattered portfolio links. Studio Ledger gives the opposite feeling. Every detail communicates order: rows, statuses, timestamps, clean labels. The 3D object is not decorative. It makes the product preview feel like a physical piece of infrastructure sitting on the desk.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#EEF1F5` | Cool studio paper |
| `bg.panel` | `#FFFFFF` | Main content surfaces |
| `bg.panel.soft` | `#F8FAFC` | Ledger row fill |
| `ledger.glass` | `rgba(255,255,255,0.72)` | 3D panel face |
| `ledger.edge` | `#C7D2E0` | Acrylic edge |
| `ledger.shadow` | `rgba(37,55,88,0.18)` | Soft physical shadow |
| `ink.primary` | `#101827` | Headlines |
| `ink.secondary` | `#4D5B6C` | Body |
| `ink.muted` | `#8794A6` | Labels |
| `accent.blue` | `#2563EB` | Primary action and active row |
| `accent.green` | `#128A5A` | Open status |
| `accent.amber` | `#C88719` | Deadline status |
| `border.panel` | `#D5DEE8` | Page borders |
| `grid.line` | `rgba(16,24,39,0.08)` | Manual-style grid lines |

Keep the page light and cool. The only saturated color should be blue, with green/amber reserved for statuses.

## 4. Typography

- **Display:** Inter 750 or 800, `clamp(40px, 5.4vw, 72px)`, tracking `-0.03em`, leading `1.02`.
- **Kicker:** Inter 600, 11px uppercase tracking `+0.18em`, `ink.muted`.
- **Body:** Inter 400, 16/1.65, `ink.secondary`.
- **Ledger rows:** `font-mono` 12px for field labels, Inter 600 for row values.
- **Section labels:** `font-mono` 12px uppercase, `ink.muted`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
NAV: GigForge                                 Sign in

LEFT
BUILT FOR STUDENT PROJECTS / SPRING SEMESTER
A calmer way to find collaborators before the deadline.
Structured profiles. Direct email contact. No chaos.
[ Browse gigs ] [ Create profile ]

RIGHT
3D acrylic ledger panel
Project / Short film score / OPEN
Needs / Cello, ambient synth / 3 matches
Deadline / Apr 18 / Direct email
Campus / UT Austin / Verified

BELOW
01 Filter people | 02 Post briefs | 03 Contact directly
```

Desktop uses a 44/56 split, with the ledger slightly larger than the copy block. Mobile stacks copy, then a flat DOM version of the ledger for readability.

## 6. The Signature: Three.js Acrylic Ledger

**3D object:**
- Panel base: `BoxGeometry(4.3, 3.0, 0.08)`.
- Material: `MeshPhysicalMaterial`, color `#FFFFFF`, transmission `0.25`, roughness `0.22`, clearcoat `0.4`, transparent opacity `0.72`.
- Edge bevel effect: second slightly larger wireframe box in `ledger.edge`.
- Shadow plane underneath: transparent plane with radial gradient texture or simple blurred CSS shadow below the canvas.

**DOM overlay:**
- Use `<Html transform>` on the panel face.
- Render rows as real DOM so typography stays crisp.
- Header: `GigForge Ledger`.
- Rows:
  - `Project / Short film score / OPEN`
  - `Needs / Cello, ambient synth / 3 matches`
  - `Deadline / Apr 18 / Direct email`
  - `Campus / UT Austin / Verified`

**Motion:**
- Pointer maps to target rotation: Y `-7deg` to `7deg`, X `4deg` to `-4deg`.
- Lerp in `useFrame` with factor `0.06`.
- Every 4 seconds, one row swaps to a different fake project via `AnimatePresence`.
- Reduced motion: panel stays at `rotation: [-0.04, -0.12, 0]`, rows do not cycle.

## 7. Status Ticker

A thin light ticker sits below the nav, not dark:

```text
OPEN: 24 gigs / ACTIVE: 142 musicians / NEW: 3 profiles today / DIRECT EMAIL ONLY
```

Background `#FFFFFF`, border-y `border.panel`. Text `font-mono` 11px uppercase. Blue dots pulse every 2s. Framer marquee loops in 28s; reduced motion shows a static centered line.

## 8. Feature Grid

Manual-style three-column grid:

```text
01 Filter people
Search by instrument, genre, campus, and availability.
No account needed to browse.

02 Post briefs
Describe the project clearly. Set a deadline.
List what the music needs to do.

03 Contact directly
Email is on every profile. No platform DM.
No matching fee. Just contact.
```

Columns have 1px vertical dividers and top grid lines. Stagger in from `y: 24`, opacity 0.

## 9. CTAs

**Primary - `Browse gigs`:**
```text
bg #2563EB
text #FFFFFF
height 50px
radius 6px
padding x 24px
hover bg #1D4ED8, shadow 0 8px 24px rgba(37,99,235,0.22)
```

**Secondary - `Create profile`:**
```text
bg #FFFFFF
text #101827
border 1px #C7D2E0
radius 6px
hover border #2563EB, bg #EFF6FF
```

## 10. Stats

```text
142 musicians      24 open gigs      12 universities
```

Numbers: Inter 800, 60px, `ink.primary`. Labels: `font-mono` uppercase. Each stat has a tiny status pill: `LIVE`, `OPEN`, `LOCAL`. Count up in 1.4s.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `LedgerPanel.tsx` is client-only via `dynamic(..., { ssr: false })`.
- Use `<Html transform>` for panel content, not canvas text.
- Keep 3D geometry minimal so the panel loads fast.
- If `MeshPhysicalMaterial` feels too glassy, reduce transmission to `0.08` and increase roughness to `0.45`.
- Mobile fallback: render the same ledger rows as a normal white card; do not force the 3D panel into a tiny viewport.

## 13. The Test

Look at the hero for 3 seconds. If the first feeling is "organized," the direction works. If it feels like generic SaaS, increase the ledger specificity: more real row labels, stronger status chips, and a clearer physical panel edge. Studio Ledger should feel like the tool a serious student uses the week before picture lock.
