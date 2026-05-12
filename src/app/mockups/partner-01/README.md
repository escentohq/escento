# Design Doc: Dark Minimal

## Goal

Create a minimal, terminal-inspired landing page for GigForge. The page should feel spare, technical, and fast, with direct links into sign-in and musician browsing.

## Visual Direction

- Style: dark minimal command-line interface.
- Mood: lean, direct, hacker-like, understated.
- Background: near-black.
- Primary text: light neutral.
- Accent: emerald green.
- Typography: monospace throughout.
- UI treatment: single-column hero, terminal cursor, thin borders, left-border step list.

## Page Structure

1. Overall layout:
   - Full-height dark page.
   - Use a narrow centered content column, around `max-width: 3xl`.
   - Keep the design sparse with significant vertical whitespace.

2. Status line:
   - Small emerald dot that pulses.
   - Text:
     - `gig-forge / v0.1 - live`

3. Hero command:
   - Large monospace command-style headline:
     - `$ book_band --local`
   - The `--local` segment should be emerald.
   - Add a rectangular blinking cursor immediately after the command.

4. Supporting copy:
   - Two comment-style lines:
     - `// Direct discovery. No feeds. No middlemen.`
     - `// Built for student creators + musicians who need to ship.`

5. CTAs:
   - Terminal bracket buttons.
   - Primary emerald-outline button:
     - `[ sign in ]`
   - Secondary gray-outline button:
     - `[ browse ]`

6. Steps section:
   - Separate with a top border.
   - Same narrow centered column.
   - Three left-border emerald blocks:
     - `> post_gig`
       - `creator defines: project, deadline, instruments, email`
     - `> filter`
       - `musicians are browsed by instrument and genre`
     - `> contact`
       - `conversation moves directly to email`

## Implementation Notes

- Keep the design monochrome except for emerald accents.
- Do not add cards, gradients, imagery, or decorative illustrations.
- Make the terminal metaphor immediately understandable, not cluttered.
