# Design Doc: Campus Signal

## Goal

Create a landing page that makes GigForge feel like a clear campus marketplace for student creators and student musicians. The design should be energetic and approachable, with obvious role paths and a product preview that shows search, profiles, and direct email contact.

## Visual Direction

- Style: modern campus marketplace with editorial/blocky accents.
- Mood: optimistic, clear, active.
- Background: warm parchment/off-white.
- Primary text: near-black.
- Accents: bright yellow-green and golden yellow.
- UI treatment: black borders, flat panels, offset shadow on the main preview card.
- Typography: very bold sans-serif hero headline, compact uppercase kicker.

## Page Structure

1. Hero area:
   - Two-column desktop layout.
   - Left side contains the brand promise.
   - Right side contains a product/search preview.
   - On mobile, stack hero copy first and preview second.

2. Kicker:
   - Small rectangular outlined label with `GF` or similar mark.
   - Text: `Student creative network`.
   - Use bright yellow-green background.

3. Headline:
   - Large, black, bold:
     - `Find the student musician your project is missing.`
   - The headline should be the dominant first-viewport signal.

4. Supporting copy:
   - Explain that GigForge lets users browse musicians, post gigs, and move straight to email.

5. CTAs:
   - Primary black button: `Browse musicians ->`
   - Secondary outlined button: `Post a gig +`

6. Product preview:
   - White card with black border and hard offset shadow.
   - Top row resembles search input:
     - `Search: composer, cello, jazz keys`
   - Three result rows:
     - `Maya R. / Guitar + production / Chicago`
     - `Theo L. / Film score / Remote`
     - `Nina P. / Violin / Weekend shoots`
   - Each row has an `Email` action on the right.

7. Role cards:
   - Two smaller cards under preview:
     - `I need music`
     - `I make music`
   - Use bright accent fill and outlined treatment.

## Implementation Notes

- Keep the art direction flat and graphic.
- Use hard borders and rectangular panels; avoid glassmorphism.
- Ensure the preview reads like a real interface, not a generic decoration.
- The design should be easy to recreate with plain HTML/CSS/Tailwind.
