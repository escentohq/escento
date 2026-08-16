# Landing Page Design Doc

> **Superseded. Kept for the rationale, not as a description of the code.**
>
> Two things below are no longer true. The landing page is no longer at `/` — since issue #5, `/`
> is the marketplace and the landing lives at `/about` (see
> [`features/03-landing-page.md`](./features/03-landing-page.md)). And the cinematic-motion
> direction was reversed by the 2026-08 UI overhaul: `ProductStory.tsx`, `TheCallsheet.tsx`, and
> `StageLightsScene.tsx` were deleted, `framer-motion` / `gsap` / `lenis` / `three` were
> uninstalled and are now blocked by `eslint.config.mjs`, and `HomeLanding.tsx` is a static Server
> Component. For the current visual system read [`ai-context/DESIGN.md`](./ai-context/DESIGN.md).

## Purpose
This document describes the landing page as it was originally implemented on `/`.

The goal of the landing page is to present Escento as a high-energy social platform for student musicians and creators, while keeping the primary actions obvious:

- browse musicians
- post or browse gigs
- signal that the network is active and culturally alive

The page is intentionally more expressive than the rest of the app. It uses cinematic motion to make the landing memorable, while still routing users directly into the product.

## Source Of Truth
The current landing is implemented in:

- `src/app/page.tsx`
- `src/components/home/HomeLanding.tsx`
- `src/components/home/ProductStory.tsx`
- `src/components/home/TheCallsheet.tsx`

`src/app/page.tsx` owns the server-side session and role logic.
`src/components/home/HomeLanding.tsx` owns the visual landing composition.
`ProductStory` and `TheCallsheet` are the two major client sections below the hero.

## Product Intent
The landing should communicate five things quickly:

1. Escento is for student musicians and student creators.
2. It feels social and alive, not like a dry directory.
3. Collaboration is the core action.
4. Users can move into the product quickly without learning a system first.
5. Signed-in users should see the action most relevant to their role.

## Audience
Primary audiences:

- student musicians looking to be discovered
- student creators looking for collaborators
- campus organizers, filmmakers, podcasters, game builders, and event hosts

Secondary audience:

- curious first-time visitors evaluating whether the platform feels active and worth joining

## Visual Direction
The landing uses a bright, performance-inspired visual language instead of the darker product shell used elsewhere in the app.

Core characteristics:

- bright off-white page background
- strong stage-light color accents
- big headline with gradient emphasis
- rounded cards and soft shadows for the lower sections

### Color System
Primary colors in the landing:

- `#FAFAFA` page background
- `#0F172A` primary ink / dark surface
- `#0055FF` blue spotlight accent
- `#FF3366` pink spotlight accent
- `#FFB000` gold spotlight accent
- `#475569` and `#64748B` for supporting text

Design intent:

- blue carries momentum and clarity
- pink adds cultural energy and social heat
- gold adds stage and performance atmosphere

These three accents are used sparingly enough that the page still feels controlled.

## Page Structure
The landing is organized into three major sections:

1. Hero
2. How it works (`ProductStory`)
3. Featured talent (`TheCallsheet`)

## Hero Section
The hero is the identity layer of the page.

### Responsibilities
- establish the brand tone
- make the product category legible
- provide two immediate CTAs
- subtly personalize the experience for signed-in users

### Content
Headline:

- `Take the Stage.`

Supporting message:

- positions Escento as a social network for student musicians and creators
- frames discovery, booking, and campus activity as the main outcomes

CTAs:

- primary: `Browse Musicians`
- secondary: dynamic action based on user role

### Dynamic CTA Logic
The secondary CTA is decided in `src/app/page.tsx`:

- creator -> `Post a Gig`
- musician with no profile -> `Create Profile`
- musician with existing profile -> `Edit profile`
- signed-out visitor -> `Sign In`

This keeps the landing expressive without losing product usefulness.

### Signed-In State
When a user is signed in, the hero shows a small state pill:

- role label if available
- otherwise email

This is intentionally lightweight and does not compete with the main hero.

## How It Works Section
This is the explanation layer.

It uses three cards:

- `Spotlight`
- `Connect`
- `Create`

### Design Intent
- explain the product in a fast, skimmable way
- reinforce the social flow from discovery to contact to collaboration
- keep the content energetic rather than procedural

Each card has:

- a numbered label
- an icon
- a short description
- hover elevation and shadow response

## Featured Talent Section
This section acts as product proof.

It shows:

- one example musician card
- one example gig card

### Design Intent
- make the platform feel tangible
- show both sides of the marketplace
- keep the cards stylized enough for marketing but specific enough to feel believable

### Card Logic
Musician card:

- identity
- specialty
- availability
- concise profile summary
- CTA into `/musicians`

Gig card:

- brief title
- category and compensation metadata
- concise scope description
- CTA into `/gigs`

## Interaction Model
The landing uses Framer Motion throughout.

Current motion patterns:

- staged hero entrance
- subtle hero scroll fade and parallax
- section reveal on scroll
- hover lift on cards
- animated headline lead-in

### Motion Principles
- movement should feel cinematic but not chaotic
- hover states should improve tactility, not distract
- animation should clarify emphasis and hierarchy
- product actions must remain obvious at all times

## Layout Behavior
The landing intentionally breaks out of the constrained product-shell width and uses full-bleed composition.

### Key Layout Decisions
- full-width hero using `w-screen` centering logic
- centered headline and CTAs
- lower sections constrained to `max-w-6xl`
- generous vertical spacing between major sections
- rounded cards and soft borders for lower content blocks

This allows the home page to feel like a branded experience while the rest of the app remains more utilitarian.

## Accessibility And Usability Notes
- primary actions are always visible above the fold
- supporting sections keep strong color contrast against their backgrounds
- CTA labels remain direct and product-oriented
- server-side logic ensures onboarding redirect still happens before landing access for incomplete users

## Content Guidelines
When editing this landing later:

- keep copy short and high-confidence
- avoid turning the hero into a feature list
- preserve the feeling of a live social platform
- prefer cultural language over generic SaaS phrasing
- keep proof sections concrete and believable

## What Should Stay Stable
These elements define the current landing identity and should only change with intent:

- `Take the Stage.` headline framing
- bright off-white base with blue/pink/gold spotlight accents
- dual CTA structure
- role-aware secondary action
- marketplace proof through musician and gig cards

## Likely Future Improvements
If the landing evolves further, the best extensions are:

- replace static example cards with real highlighted data
- connect hero messaging to current gig or musician counts
- align global app chrome more closely with the landing’s visual tone

## Summary
The current landing page is a performance-driven, social-first front door for Escento. It is designed to feel alive and memorable, while still directing visitors quickly into the two core product paths: finding musicians and posting opportunities.
