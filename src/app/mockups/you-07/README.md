# Landing Design 07 - **Finder Console**

> I have built internal tools for teams that do not want charm. They want speed, clarity, and a path to done. Finder Console borrows the grammar of command palettes and consoles, but refuses dark-mode cliche. This is a daylight console: pale mint paper, crisp ink, green query highlights, and a 3D holographic-but-light command panel that feels like a fast desk tool for creative projects.

---

## 1. The Concept

Pale mint page. The hero has a fast product pitch on the left and a floating 3D command panel on the right. The panel contains query lines like `find vocalist genre:r&b` and result lines that materialize as translucent cards. Below, a feature grid explains anonymous browsing, structured profiles, and email handoff.

The mood is technical, but not dark. It should feel like sunlight on a fast terminal.

## 2. Why This Direction

Some student creators are in execution mode. They do not want a warm story about community; they want to find someone and move. Finder Console makes GigForge feel precise and fast. The command metaphor says "you can ask for what you need directly." The light palette keeps it approachable.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F0FAF4` | Pale mint daylight surface |
| `bg.panel` | `#FFFFFF` | Command panel face |
| `bg.line` | `#E5F4EA` | Command row fill |
| `panel.edge` | `#B8DCC6` | 3D panel edges |
| `ink.primary` | `#102019` | Headlines |
| `ink.secondary` | `#4E6358` | Body |
| `ink.muted` | `#7B9286` | Labels |
| `accent.green` | `#1B8A4A` | Command prompt, CTA |
| `accent.lime` | `#A9E76F` | Highlight glow |
| `accent.cyan` | `#39B7C4` | Secondary query accent |
| `border.panel` | `#CBE3D4` | Light borders |
| `shadow.console` | `rgba(27,138,74,0.16)` | Soft green shadow |

The whole page should remain light. Green is active command energy, not a neon-on-black effect.

## 4. Typography

- **Display:** Inter 800, `clamp(42px, 6vw, 82px)`, leading `1.0`, tracking `-0.035em`.
- **Command font:** JetBrains Mono or `font-mono`, 13px.
- **Kicker:** `font-mono` 12px uppercase tracking `+0.16em`, `accent.green`.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Feature titles:** Inter 750, 20px.

```bash
npm install @fontsource/jetbrains-mono framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
LEFT
LIVE CAMPUS LISTINGS
A command center for creative collaboration.
Search, filter, and contact without building another inbox.
[ Open gigs ] [ Musicians ]

RIGHT
3D command panel
$ find vocalist genre:r&b
> 12 profiles found
$ post gig project:podcast
> brief ready for replies
$ browse cello remote:true
> 3 available this week
```

The command panel should be large enough to read at desktop width. On mobile, convert it to a flat stacked code card.

## 6. The Signature: Three.js Daylight Command Panel

**Geometry:**
- Main panel: `BoxGeometry(4.8, 3.2, 0.06)`, material `bg.panel`.
- Edge: duplicate slightly larger box or bevel strips in `panel.edge`.
- Three translucent command-line planes at varying `z` offsets, like layers of acetate.
- Result cards are smaller planes that slide in behind each command line.

**DOM overlay:**
- Use `<Html transform>` for crisp command text.
- Prompt `$` in `accent.green`.
- Query keywords in `accent.cyan`.
- Result count chips in pale lime.

**Motion:**
- Typing animation writes each command at 35ms per character.
- Result row appears after each command with `opacity` and `x` animation.
- Panel tilts with cursor, max `6deg`.
- Reduced motion: show full commands immediately, no tilt.

## 7. Query Stream

The command panel should cycle through three command/result pairs:

```text
$ find vocalist genre:r&b
> 12 profiles found / 4 available this week

$ post gig project:podcast
> brief ready / direct email replies

$ browse cello remote:true
> 3 available / portfolio links attached
```

Loop every 12 seconds. Do not make users wait for the entire message on first paint; first command should be visible immediately.

## 8. Feature Grid

```text
Anonymous browsing
No account required to see musicians or open gigs.

Structured profiles
Instrument, genre, campus, availability, portfolio.

Email handoff
GigForge stops at discovery. Your inbox takes over.
```

Cards are white, 1px green-tinted border, 6px radius. Hover adds a green top rule.

## 9. CTAs

**Primary - `Open gigs`:**
```text
bg #1B8A4A
text #FFFFFF
height 52px
radius 6px
padding x 28px
hover bg #126C39, shadow 0 12px 30px rgba(27,138,74,0.22)
```

**Secondary - `Musicians`:**
```text
bg #FFFFFF
text #102019
border 1px #B8DCC6
radius 6px
hover bg #E5F4EA
```

## 10. Stats

```text
142 indexed musicians
24 open briefs
12 campus networks
```

Display as compact console facts under the hero. Numbers use Inter 800, 48px. Labels use `font-mono`.

## 11. Required Libraries

```bash
npm install @fontsource/jetbrains-mono framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `CommandPanel.tsx` is client-only.
- Build typing with Framer or a small interval hook, but respect reduced motion.
- Keep command syntax understandable. No fake AI, no recommendations, no scoring.
- The panel must not require interaction to communicate product value.
- On mobile, skip Three.js and show a flat command card for readability.

## 13. The Test

Ask a viewer to read the command panel out loud. If they understand the product without reading the paragraph, the metaphor is working. If the commands feel too developer-only, rewrite them with more natural terms. Finder Console should feel fast, not exclusionary.
