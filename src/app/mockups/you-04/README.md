# Design Doc: Poster Wall

## Goal

Create a bold campus flyer-wall landing page for GigForge. The page should make the product feel like a digital bulletin board for student creative work, with loud typography and posted-gig cards.

## Visual Direction

- Style: campus posters, zines, physical flyers.
- Mood: energetic, local, handmade, decisive.
- Background: warm paper.
- Primary text: dark ink/black.
- Accents: red-orange, sky blue, yellow, green.
- Typography: heavy uppercase sans-serif.
- UI treatment: thick borders, hard shadows, slight rotations.

## Page Structure

1. Background:
   - Warm paper base.
   - Two large horizontal color strips behind content:
     - one red-orange near the top
     - one sky blue near the lower portion
   - Strips can be slightly rotated.

2. Main layout:
   - Two-column desktop layout.
   - Left: large poster-style hero panel.
   - Right: stacked open-gig flyer cards.
   - Mobile: stack the hero panel above the cards.

3. Hero poster:
   - Thick black border.
   - Warm paper background.
   - Hard black offset shadow.
   - Kicker:
     - `GigForge campus board`
   - Headline in uppercase:
     - `Projects need sound. Students need gigs.`
   - Supporting copy:
     - Describe GigForge as a digital flyer wall for finding student musicians, listing creative gigs, and jumping straight to contact.

4. CTAs:
   - Yellow filled poster button:
     - `Post the gig`
   - White outlined poster button:
     - `Find talent`

5. Gig cards:
   - Four thick-bordered cards with hard black shadows.
   - Alternate white and green fills.
   - Slight overall rotation for the stack.
   - Cards:
     - `Composer for senior film`
     - `Bassist for launch party`
     - `Singer for podcast theme`
     - `Violin for game trailer`
   - Each has small label like `OPEN GIG 01` and support line:
     - `Remote or campus / portfolio links welcome`

## Implementation Notes

- Keep the energy visual, but preserve readable hierarchy.
- Avoid rounded cards and polished gradients.
- Use black borders consistently.
- Make sure rotated elements do not cause mobile overflow.
