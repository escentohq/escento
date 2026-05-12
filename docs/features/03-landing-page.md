# Landing Page

## Feature Summary
The landing page is the public marketing and routing surface for GigForge. It explains the two-sided marketplace, exposes the main discovery CTA, adapts its secondary CTA to the signed-in user's role, and uses motion-heavy visual sections to establish the brand.

## Product Intent
- Position GigForge as a campus collaboration platform.
- Let anonymous visitors browse immediately.
- Send creators toward gig posting and musicians toward profile creation/editing.
- Avoid social-network language; the goal is direct discovery and email contact.

## Routes and Files
- `/`
- `src/app/page.tsx`
- `src/components/home/HomeLanding.tsx`
- `src/components/home/StageFlip.tsx`
- `src/components/home/StageLightsScene.tsx` (currently available but not rendered by `HomeLanding`)
- `src/components/ui/primary-cta.tsx`
- `src/components/ui/secondary-cta.tsx`

## Relevant Source Code

```tsx
// src/app/page.tsx
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  const isMusician = session?.user?.role === "MUSICIAN";
  const isCreator = session?.user?.role === "CREATOR";

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (isMusician && session.user?.id) {
    const existing = await db.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const secondaryHref = isCreator ? "/gigs/create" : musicianProfilePath ? musicianProfilePath : "/signin";
  const secondaryLabel = isCreator ? "Post a Gig" : musicianProfilePath === "/profile/edit" ? "Edit Profile" : musicianProfilePath === "/profile/create" ? "Create Profile" : "Sign In";

  return <HomeLanding secondaryHref={secondaryHref} secondaryLabel={secondaryLabel} signedInLabel={signedInLabel} />;
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

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".gsap-featured-card", { opacity: 0, x: -30 }, {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: ".gsap-featured-section", start: "top 70%", toggleActions: "play none none reverse" },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);
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

```tsx
// src/components/home/StageFlip.tsx
export function StageFlip() {
  const [side, setSide] = useState<Side>("musician");
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 150, damping: 20 });

  const baseAngle = side === "musician" ? 0 : 180;
  const rotateY = useTransform(springX, [-0.5, 0.5], [baseAngle - 10, baseAngle + 10]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
}
```

```tsx
// src/components/home/StageLightsScene.tsx
export function StageLightsScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#FAFAFA]" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#FAFAFA"]} />
        <Scene scrollProgress={scrollProgress} />
        <Environment preset="city" />
        <Preload all />
      </Canvas>
    </div>
  );
}
```

## How It Works
The server route resolves auth and role state, then hands the client landing component a secondary CTA destination. Unroled signed-in users are immediately redirected to onboarding. Musicians get either `Create Profile` or `Edit Profile`; creators get `Post a Gig`; anonymous visitors get `Sign In`.

`HomeLanding` is a client component because it uses Framer Motion, GSAP, scroll transforms, and reduced-motion detection. It renders a hero, a two-sided interactive `StageFlip`, trust marquee, stats, process cards, featured talent/gig cards, and a final CTA.

`StageFlip` is the signature product explainer. It holds sample musician and gig data, lets the user toggle sides, supports click-to-flip, and adds mouse parallax unless reduced motion is preferred.

`StageLightsScene` is a reusable Three.js background scene with light beams, particles, shapes, and scroll drift. It is not currently used by `HomeLanding`, but it is part of the landing visual system and can be reintroduced with care.

## Implementation Details for an LLM
The landing page has two layers: server role routing in `src/app/page.tsx`, and client visual storytelling in `HomeLanding`. Keep data-sensitive decisions on the server. Keep animation isolated in client components. Respect `useReducedMotion` whenever adding loops, parallax, or scroll-triggered movement.

## Issues and Improvements
- The landing page uses hardcoded stats and featured examples. Replace with real counts only after product analytics exist.
- `StageLightsScene` imports Three.js but is unused; either remove it or deliberately integrate it with a dynamic import and performance budget.
- GSAP and Framer Motion are both used on the same page. Keep animation ownership clear to avoid conflicting transforms.
- No loading state exists for the root route while session/profile checks run.

