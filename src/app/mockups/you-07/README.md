# Design Doc: Finder Console

## Goal

Create a dark, command-center landing page for GigForge. This concept should appeal to deadline-driven creators who want a fast utility rather than a social platform.

## Visual Direction

- Style: terminal-inspired product console.
- Mood: fast, technical, efficient, focused.
- Background: near-black.
- Primary text: warm off-white.
- Accent: soft green.
- Typography: sans-serif hero with mono command preview.
- UI treatment: dark panels, thin gray borders, terminal rows.

## Page Structure

1. Hero layout:
   - Two-column desktop layout.
   - Left: product positioning.
   - Right: command/finder preview.
   - Stack on mobile.

2. Status pill:
   - Rounded dark outlined pill.
   - Green marker or asterisk.
   - Text:
     - `live campus listings`

3. Headline:
   - Large:
     - `A command center for creative collaboration.`

4. Supporting copy:
   - Explain that the design is dark, utility-driven, and fast.

5. CTAs:
   - Primary green button:
     - `Open gigs +`
   - Secondary dark outlined button:
     - `Musicians`

6. Console preview:
   - Dark bordered panel.
   - Header:
     - `cmd GigForge finder`
   - Three command rows using monospace:
     - `$ find vocalist genre:r&b`
     - `$ post gig project:podcast`
     - `$ browse cello remote:true`
   - Bottom feature blocks:
     - `Anonymous browsing`
     - `Structured profiles`
     - `Email handoff`

## Implementation Notes

- Keep the terminal metaphor light enough that nontechnical users still understand it.
- Do not add fake AI/match scoring language.
- Use command rows to imply speed and precision.
- Ensure contrast is accessible.
