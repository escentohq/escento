# Motion Infrastructure

> **Historical. This describes a layer that no longer exists.**
>
> `framer-motion` and `gsap` are uninstalled and blocked by `eslint.config.mjs`, along with
> `lenis`, `three`, and `@react-three/*`. `ProductStory.tsx` and `TheCallsheet.tsx` were deleted,
> and `src/components/ui/reveal.tsx` is now a static compatibility wrapper. The current rule is
> `AGENTS.md` #6: static by default, targeted CSS state transitions only, and adding an animation
> library needs approval.

## Feature Summary
Escento's motion system is Framer Motion for entrances, hover, stagger, and scroll transforms, plus GSAP ScrollTrigger for a handful of landing-page reveals. There is no 3D layer and no smooth-scroll library.

## Product Intent
- Make the landing page feel performance-inspired and alive.
- Respect reduced-motion preferences.
- Keep browser-only APIs out of Server Components.
- Isolate motion so it does not leak into CRUD pages.

## Files
- `src/components/home/HomeLanding.tsx`
- `src/components/home/ProductStory.tsx`
- `src/components/home/TheCallsheet.tsx`
- `src/components/ui/reveal.tsx`
- `package.json` dependencies: `framer-motion`, `gsap`

## Relevant Source Code

```tsx
// src/components/home/HomeLanding.tsx
const prefersReducedMotion = useReducedMotion();
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end start"],
});
const heroY = useTransform(
  scrollYProgress,
  [0, 1],
  prefersReducedMotion ? [0, 0] : [0, 260],
);
const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
```

```tsx
// GSAP setup in HomeLanding
gsap.registerPlugin(ScrollTrigger);

useEffect(() => {
  if (prefersReducedMotion) return;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".gsap-featured-card",
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".gsap-featured-section",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      },
    );
  }, containerRef);

  return () => {
    ctx.revert();
  };
}, [prefersReducedMotion]);
```

```tsx
// src/components/ui/reveal.tsx
export function Reveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## How It Works
The landing page uses Framer Motion for declarative enter animations, scroll transforms, and staggers. It also uses GSAP ScrollTrigger for selected scroll-triggered card reveals. Prefer `<Reveal>` over writing `whileInView` by hand. Reduced motion disables parallax and GSAP reveals.

`three`, `@react-three/*`, and `lenis` were removed with their only consumers (`StageLightsScene.tsx`, `SmoothScroll.tsx`). Re-adding either needs approval.

## Implementation Details for an LLM
Any component that imports Framer hooks, GSAP, or browser events must begin with `"use client"`. Always gate nonessential motion with `useReducedMotion`. Do not apply GSAP and Framer to the same element. Do not import 3D or smooth-scroll libraries.

## Issues and Improvements
- Using GSAP and Framer Motion together increases complexity; new animations should pick one owner per element.
- The landing still uses hardcoded featured examples; motion should not depend on live data.
