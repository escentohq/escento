# Landing Page

## Feature Summary
The landing page is the public marketing and routing surface for Escento. It explains the two-sided marketplace, exposes the main discovery CTA, adapts its secondary CTA to the signed-in user's role, and uses motion-heavy visual sections to establish the brand.

## Product Intent
- Position Escento as a campus collaboration platform.
- Let anonymous visitors browse immediately.
- Send creators toward gig posting and musicians toward profile creation/editing.
- Avoid social-network language; the goal is direct discovery and in-app contact.

## Routes and Files
- `/`
- `src/app/page.tsx`
- `src/components/home/HomeLanding.tsx`
- `src/components/home/ProductStory.tsx`
- `src/components/home/TheCallsheet.tsx`
- `src/components/ui/primary-cta.tsx`
- `src/components/ui/secondary-cta.tsx`

## Relevant Source Code

```tsx
// src/app/page.tsx
export default async function Home() {
  const session = await getCurrentSession();

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  const isMusician = session?.user?.role === "MUSICIAN";
  const isCreator = session?.user?.role === "CREATOR";

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (isMusician && session?.user?.id) {
    const existing = await getProfileByUserId(session.user.id);
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const secondaryHref = isCreator
    ? "/gigs/create"
    : musicianProfilePath
      ? musicianProfilePath
      : "/signin";

  return (
    <HomeLanding
      secondaryHref={secondaryHref}
      secondaryLabel={secondaryLabel}
      signedInLabel={signedInLabel}
    />
  );
}
```

```tsx
// src/components/home/HomeLanding.tsx
export function HomeLanding({ secondaryHref, secondaryLabel, signedInLabel }: HomeLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 260]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
```

```tsx
// Hero CTA section from HomeLanding
<PrimaryCta href="/musicians" className="w-full sm:w-auto">
  Browse Musicians
</PrimaryCta>

<SecondaryCta href={secondaryHref} className="w-full sm:w-auto">
  {secondaryLabel}
</SecondaryCta>
```

## How It Works
The server route resolves auth and role state, then hands the client landing component a secondary CTA destination. Unroled signed-in users are immediately redirected to onboarding. Musicians get either `Create profile` or `Edit profile`; creators get `Post a gig`; anonymous visitors get `Sign in`.

`HomeLanding` is a client component because it uses Framer Motion, GSAP, scroll transforms, and reduced-motion detection. It renders a hero, `TheCallsheet` (sample musician/gig cards), `ProductStory` (the five-step explainer), and a final CTA.

## Implementation Details for an LLM
The landing page has two layers: server role routing in `src/app/page.tsx`, and client visual storytelling in `HomeLanding`. Keep data-sensitive decisions on the server. Keep animation isolated in client components. Respect `useReducedMotion` whenever adding loops, parallax, or scroll-triggered movement. Do not reintroduce `StageFlip`, `StageLightsScene`, or a Three.js background without approval.

## Issues and Improvements
- The landing page uses hardcoded stats and featured examples. Replace with real counts only after product analytics exist.
- GSAP and Framer Motion are both used on the same page. Keep animation ownership clear to avoid conflicting transforms.
- No loading state exists for the root route while session/profile checks run.
