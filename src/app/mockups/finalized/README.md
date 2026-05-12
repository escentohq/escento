# Finalized Landing - **Turquoise Signal**

This is the final synthesis direction for the landing page. It should combine the strongest ideas from the built mockups into one polished, extensible, production-minded concept.

This is not meant to be vague. It should be detailed enough to build from directly, while still leaving room for strong execution choices and new components where useful.

## Core Goal

Build a final landing page that feels:

- social and alive, not corporate
- polished and modern, not sterile
- music-native without leaning on cliche music graphics
- technically confident, using the existing 3D and Framer tooling already present in the repo

The page should look like a product people actually want to join, not just a design exercise.

## Source Blend

Use the following mockups as the primary source system:

- **Base template and font direction, non-negotiable foundation:** `src/components/mockups/partner-06/Landing.tsx`
- Cards graphic / profile stack hero object layered onto that base: `src/components/mockups/partner-05/StackCards.tsx`
- Framer Motion details, reveal rhythm, and scroll styling layered onto that base: `src/components/mockups/partner-04/Landing.tsx`
- Card hover behavior and warmth layered onto that base: `src/components/mockups/partner-03/Landing.tsx`
- Oscillating frequency mesh with mouse interaction layered onto that base: `src/components/mockups/partner-08/WaveformMesh.tsx`
- Compact information density and cleaner editorial packing layered onto that base: `src/components/mockups/you-06/Landing.tsx`

Do not ignore the existing code. Reuse and adapt preexisting patterns wherever they are already strong.

## Base System Rule

`partner-06` is the starting design system for the final landing page.

That means:

- overall layout logic starts from `partner-06`
- typography hierarchy starts from `partner-06`
- CTA structure starts from `partner-06`
- section rhythm starts from `partner-06`
- the final page should still be recognizable as a more evolved version of `partner-06`

Every other source mockup should be treated as an enhancement layer on top of that base, not as a competing layout system.

## Main Design Decision

Use the cleaner, more open page structure from `partner-06` as the permanent foundation, then replace its lime energy with a more intentional accent system chosen for the final composition. Turquoise is a strong candidate, but it is not mandatory if another accent makes the page feel more distinctive, musical, or complete.

The final page should feel like:

- a live social network for musicians
- a discovery surface for creators
- a product with real momentum and active participation

## Color Direction

Use a light base. Keep the page bright and breathable.

The accent color is a deliberate design decision, not a fixed token copied from earlier work. Start by exploring turquoise, but if it feels too generic, too cold, or mismatched with the final composition, choose a different accent with confidence. The goal is not "use turquoise." The goal is "pick the accent a strong designer would choose after seeing the full system together."

Suggested palette:

- `bg.page`: warm off-white or soft white
- `bg.surface`: pure white
- `ink.primary`: deep slate / near-black
- `ink.secondary`: muted slate
- `accent.primary`: choose the main expressive color after the layout and surfaces are working together
- `accent.primary.hover`: a deeper or richer version of that accent
- `accent.support`: a softer companion tone, only if the system needs one
- `status.live`: a live-state color that still feels natural inside the chosen palette

Possible accent starting point:

- `accent.primary`: `#1ECFC3`
- `accent.primary.hover`: `#0FA99E`

But if the page feels stronger with a different accent, change it. Think like a painter or a senior UI designer making a final call from the full composition, not from a token list.

Avoid heavy dark sections except where absolutely needed for contrast. This should live much closer to `partner-06` and `partner-08` than to the older darker concepts.

## Typography

Use the same general typographic spirit as `partner-06` for the base system:

- bold, clean sans for headline
- clear sans for body
- mono or condensed micro-labels for utility text

The page should feel readable first, stylish second.

## Final Page Structure

The final landing page should be extensive and feel complete, not just hero-plus-cards.

Recommended structure:

1. Top navigation
2. Hero with strong headline, subhead, CTAs, and live signal badge
3. Hero 3D frequency mesh background
4. Cards graphic / stacked profile object
5. Social proof or live activity strip
6. Featured profile or featured musician cards
7. Featured open gigs cards
8. Compact info section explaining how the product works
9. Extra trust / network / campus section
10. Large final CTA block

## Hero

Use `partner-06` as the structural base:

- clean nav
- clear primary headline
- obvious CTA hierarchy
- immediate understanding in the first screen

But upgrade the emotional layer:

- add the cards graphic from `partner-05`
- add the oscillating frequency system from `partner-08`
- make the hero feel alive before the user scrolls

The hero should answer:

- what this is
- who it is for
- whether the network is alive

without requiring dense copy.

## Cards Graphic

The `partner-05` stack should be part of the hero or upper fold.

Direction:

- preserve the collectible, profile-first feeling
- keep it bright and tactile
- make it feel like profiles are the product
- allow the top card to feel featured and active

It should not feel like a cold professional network clone. It should feel more like a musician roster with personality.

## Frequency Mesh

Use the oscillating frequency idea from `partner-08`, but adapt it to the new final system.

Required behavior:

- the frequency mesh should react to mouse proximity
- as the cursor gets closer, the oscillation should feel tighter / more active / more energized
- the effect should feel musical, not decorative

This should sit behind or around the hero rather than feeling like an isolated demo component.

If useful, the mesh can expand into section transitions or supporting bands lower on the page.

## Motion System

Use `partner-04` as the motion reference.

Carry over:

- reveal timing
- scroll-linked movement
- staged entrance feel
- stronger cinematic transitions instead of generic fade-ins

But keep the final experience lighter and more product-friendly than `partner-04`'s performance-stage mood.

Motion should make the page feel composed and confident, not theatrical for its own sake.

## Card Hover

Use `partner-03` as the hover reference.

That means:

- subtle lift
- tasteful shadow or border response
- slightly more human warmth
- hover states that feel refined, not flashy

The page should reward interaction without turning into a toy.

## Compact Information Style

Use `you-06` as the reference for how to pack more useful information into the page without making it feel heavy.

Apply that to:

- profile cards
- featured gig cards
- side rails or mini listings
- stats and metadata

The page should feel information-rich but still fast to scan.

## Social Layer

This final version should lean more social than analytical.

That means emphasizing:

- live activity
- recently joined musicians
- recently posted gigs
- visible availability
- momentum
- movement between profiles and opportunities

Possible elements:

- activity band
- "now live" row
- latest joins
- campus pulses
- open roster indicators

Keep the language lively and current.

## New Components Are Allowed

This final version can go beyond the source mockups.

New component generation is explicitly allowed if it helps make the landing page feel more complete.

Examples of acceptable new additions:

- a richer hero info rail
- a compact "why people join" section
- a live activity cluster
- an expanded featured roster module
- a hybrid section that merges profiles and gigs

The only rule is that new components should still feel visually native to the final system.

## Reuse Strategy

Prefer adaptation over reinvention where possible:

- start from the layout clarity and type rhythm from `partner-06`
- add the stack interaction idea from `partner-05`
- add the motion philosophy from `partner-04`
- add the warmer hover sensibility from `partner-03`
- add the waveform / frequency interaction model from `partner-08`
- add the compact content density from `you-06`

Do not rebuild everything from zero if an existing pattern is already strong.

## Implementation Notes

- Keep everything inside a dedicated `finalized` mockup folder structure
- Page-local animation and client logic should stay local
- Respect reduced motion
- 3D should support the product story, not overpower it
- The page should still feel performant on a normal laptop

## Tone

The final page should feel:

- active
- warm
- social
- musician-first
- current
- inviting
- technically sharp

It should not feel:

- sterile
- overly corporate
- dark for the sake of drama
- overloaded with analytics
- like a generic SaaS page

## One-Sentence Summary

Build a bright, socially alive musician network landing page that is fundamentally a `partner-06` design system first, then layered with `partner-05` as the collectible profile centerpiece, `partner-04` for motion language, `partner-03` for hover warmth, `partner-08` for reactive frequency energy, and `you-06` for dense-but-clean information design, with the final accent color chosen by taste rather than by default.
