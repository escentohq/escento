# Motion and Smooth Scroll Infrastructure

## Feature Summary
GigForge includes several client-only motion systems: Framer Motion and GSAP on the landing page, a reusable Lenis smooth-scroll wrapper, and an optional Three.js stage-light scene. These are support features that shape the product feel rather than user data flows.

## Product Intent
- Make the landing page feel performance-inspired and alive.
- Respect reduced-motion preferences.
- Keep browser-only APIs out of Server Components.
- Isolate heavy visual systems so they do not leak into CRUD pages.

## Files
- `src/components/SmoothScroll.tsx`
- `src/components/home/HomeLanding.tsx`
- `src/components/home/StageFlip.tsx`
- `src/components/home/StageLightsScene.tsx`
- `package.json` dependencies: `framer-motion`, `gsap`, `lenis`, `@react-three/fiber`, `@react-three/drei`, `three`

## Relevant Source Code

```tsx
// src/components/SmoothScroll.tsx
"use client";

import { ReactLenis } from "lenis/react";
import { type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.4, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```

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
// src/components/home/StageFlip.tsx
const reduced = useReducedMotion();
const rawX = useMotionValue(0);
const rawY = useMotionValue(0);
const springX = useSpring(rawX, { stiffness: 150, damping: 20 });
const springY = useSpring(rawY, { stiffness: 150, damping: 20 });

function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
  if (reduced) return;
  const rect = wrapperRef.current?.getBoundingClientRect();
  if (!rect) return;
  rawX.set((e.clientX - rect.left) / rect.width - 0.5);
  rawY.set((e.clientY - rect.top) / rect.height - 0.5);
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
`SmoothScroll` wraps children in `ReactLenis` and enables smooth wheel scrolling. It is a client component and should only be used where global scroll smoothing is desired.

The landing page uses Framer Motion for declarative enter animations, scroll transforms, staggers, marquee movement, and the 3D card flip. It also uses GSAP ScrollTrigger for selected scroll-triggered card reveals. Reduced motion disables parallax and GSAP reveals.

`StageLightsScene` uses React Three Fiber and Drei to render a full-screen background scene. It includes animated light beams, floating shapes, particles, additive blending, environment lighting, and scroll-based drift.

## Implementation Details for an LLM
Any component that imports Lenis, Framer hooks, GSAP, browser events, or Three.js must begin with `"use client"`. Keep Three.js isolated to the home visual system or dynamically import it if added to a route. Always gate nonessential motion with `useReducedMotion` or `matchMedia("(prefers-reduced-motion: reduce)")`.

## Issues and Improvements
- `SmoothScroll` exists but is not currently mounted in `layout.tsx`.
- `StageLightsScene` exists but is not currently rendered by `HomeLanding`.
- Using GSAP and Framer Motion together increases complexity; new animations should pick one owner per element.
- Three.js scenes need manual viewport testing to ensure they are nonblank and performant.
- Smooth scrolling can harm accessibility if applied globally without testing keyboard, anchor, and browser history behavior.

