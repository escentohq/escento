# Design Doc: Portfolio Grid

## Goal

Create a portfolio-led landing page for GigForge. This version should foreground student work and make musician discovery feel visual, curated, and browsable.

## Visual Direction

- Style: portfolio gallery and discovery grid.
- Mood: creative, polished, visual, modern.
- Background: pale cool gray.
- Primary text: near-black.
- Accent: violet label text plus varied tile fills.
- UI treatment: simple bordered tiles with strong color blocks.
- Typography: clean sans-serif, strong headline.

## Page Structure

1. Layout:
   - Two-column desktop layout.
   - Left: value prop and CTAs.
   - Right: portfolio tile grid.
   - Mobile: stack hero above grid.

2. Kicker:
   - Uppercase violet text:
     - `Portfolio-led discovery`

3. Headline:
   - Large:
     - `Hear enough to make the next move.`

4. Supporting copy:
   - Explain that this concept treats profile links as the star and makes the site feel like a curated wall of student work.

5. CTAs:
   - Primary dark button:
     - `Browse work`
   - Secondary outlined button:
     - `Add profile`

6. Tile grid:
   - Six tiles in a responsive grid.
   - Desktop: three columns.
   - Mobile: two columns or one column depending width.
   - Each tile should keep a fixed aspect ratio, around 4:3.
   - Tile fills should alternate among light green, white, and peach.
   - Tile labels:
     - Composer reel
     - Jazz trio
     - Game audio
     - Choir vocals
     - Synth score
     - Live keys
   - Each tile has a small plus marker near the top.

## Implementation Notes

- Do not imply that GigForge hosts uploads; position tiles as portfolio links or profile previews.
- Keep the grid visual but not photo-dependent.
- Use stable aspect ratios so the grid feels intentional.
