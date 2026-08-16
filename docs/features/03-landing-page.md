# Landing Page (`/about`)

## Feature Summary
The editorial landing page explains the two-sided marketplace and points visitors at the directories. It used to be `/`; since issue #5 the root route shows the marketplace directly and the landing kept its own route at `/about`.

## Product Intent
- Explain in plain language what Escento does: musicians create profiles, creators post gigs, either side can send a request.
- Give the footer and outreach links a page that pitches, without putting a pitch between a first-time visitor and the inventory.
- Send creators toward gig posting and musicians toward profile creation or editing.

## Routes and Files
- `/about`
- `src/app/about/page.tsx` — server component; fetches the featured profiles and gigs
- `src/app/about/loading.tsx`, `src/app/about/error.tsx`
- `src/components/home/HomeLanding.tsx` — the composition
- `src/components/ui/primary-cta.tsx`

## Relevant Source Code

```tsx
// src/app/about/page.tsx
const [profilesResult, gigsResult, sessionResult] = await Promise.allSettled([
  listProfiles(),
  listOpenGigs(),
  getCurrentSession(),
]);
// Each rejection is logged and falls back to an empty list, so a directory read
// failure degrades the page instead of 500ing it.

return (
  <HomeLanding
    featuredProfiles={featuredProfiles.slice(0, 8)}
    featuredGigs={featuredGigs.slice(0, 2)}
    musicianProfileNavigation={musicianProfileNavigation}
  />
);
```

## How It Works
`HomeLanding` is a **server** component. It takes real profiles and gigs and composes four sections: a hero with a brand-colored "Live directory" aside built from the lead profile, a preview row list of up to three real listings, a two-column explainer, and a closing CTA to `/signup`. There is no client boundary, no animation library, and no hardcoded sample data.

The one role-dependent element is the musician CTA, resolved server-side through `resolveMusicianProfileNavigation` so it reads "Create profile", "Continue setup", or "Edit profile".

## Implementation Details for an LLM
Keep this page a Server Component. There is no animation, 3D, or smooth-scroll layer in the repo, and `framer-motion`, `gsap`, `lenis`, `three`, and `@react-three/*` are all blocked by `eslint.config.mjs` — reintroducing any of them needs approval per `AGENTS.md`.

Do not add a role redirect here. `/about` is public and stays public.

## Issues and Improvements
- The page renders whatever the directory currently holds, so at pilot scale the hero aside can be sparse. The empty branches are written for that case; keep them honest rather than padding with fake listings.
