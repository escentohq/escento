# Landing Design 08 - **Soft Campus**

> I have designed onboarding flows for student communities, and the hardest moment is always first contact. People do not avoid reaching out because the button is hidden. They avoid it because it feels socially risky. Soft Campus makes GigForge feel kind without turning it into a social network. The signature is a gentle Three.js orb field where student profiles drift, cluster, and separate like a living campus network.

---

## 1. The Concept

Pale blue-gray page. A soft 3D orb simulation fills one side of the hero: glowing pastel spheres labeled with names and instruments. They drift slowly, avoid harsh collisions, and cluster into small groups. On the other side, three conversation-style cards show the entire product promise: creator asks, musician answers, GigForge hands off the email.

The page should feel like it lowers the emotional cost of reaching out.

## 2. Why This Direction

GigForge is intentionally not a social network, but it still has a social moment: asking a real person to collaborate. Soft Campus makes that moment feel safe. The orb simulation suggests community and availability without feeds, likes, or DMs. It is human, but not noisy.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F6F9FB` | Pale campus sky |
| `bg.card` | `#FFFFFF` | Conversation cards |
| `bg.soft` | `#EDF5F8` | Section background |
| `orb.green` | `#BEE8C7` | Guitar, piano profiles |
| `orb.blue` | `#BFDDF8` | Composer, producer profiles |
| `orb.peach` | `#FFD8C5` | Vocal, strings profiles |
| `orb.lavender` | `#D9D2FF` | Experimental profiles |
| `ink.primary` | `#24313D` | Headlines |
| `ink.secondary` | `#60707E` | Body |
| `ink.muted` | `#8A9AA7` | Labels |
| `accent.green` | `#176346` | Primary CTA and labels |
| `accent.green.soft` | `#D9F0E3` | Pill backgrounds |
| `border.card` | `#D6E0E8` | Soft borders |
| `shadow.soft` | `rgba(36,49,61,0.08)` | Card and orb shadows |

No saturated dark UI. This should feel like daylight through a practice-room window.

## 4. Typography

- **Display:** Inter 800, `clamp(44px, 6vw, 82px)`, leading `1.03`, tracking `-0.035em`.
- **Pill labels:** Inter 700, 13px, `accent.green`.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Orb labels:** Inter 700, 11px, `ink.primary`.
- **Card text:** Inter 600, 22px on desktop, 18px mobile.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```text
LEFT
3D orb network, full column
Labels: Maya / guitar, Jordan / cello, Theo / score

RIGHT
Built for students helping students
Make campus collaboration feel less awkward.
Friendly support copy
[ Get started ] [ Browse first ]

Conversation cards:
Creator -> Musician -> GigForge
```

Desktop can put the orb field left and copy right. Mobile should show copy first, then a simplified orb strip.

## 6. The Signature: Three.js Gentle Orb Network

**Scene:**
- 22 spheres, radius `0.16` to `0.32`.
- Positions initialized randomly in a loose oval.
- Materials: `MeshStandardMaterial`, pastel colors, roughness `0.65`.
- Add subtle emissive color matching each orb at intensity `0.12`.
- Soft shadows enabled, but keep them delicate.

**Labels:**
- Use `<Html>` labels on 8-10 larger orbs:
```text
Maya / guitar
Jordan / cello
Theo / score
Nina / violin
Sam / beats
Priya / voice
```

**Motion:**
- Each orb has a velocity vector and a preferred anchor.
- Apply tiny attraction to anchor, tiny repulsion from nearby orbs.
- Clamp speed so movement feels calm.
- Every 8 seconds, anchors shift slightly so clusters reform.
- Reduced motion: static constellation.

This is not a physics flex. It should feel gentle and legible.

## 7. Conversation Cards

Cards:
```text
+ Creator
I need a warm piano theme for a documentary cut.

+ Musician
I play keys, score shorts, and can meet Thursdays.

+ GigForge
Portfolio link found. Email contact ready.
```

Cards are white, 1px soft border, 8px radius max, subtle shadow. Framer sequence: cards enter one by one from `y: 18`, opacity 0. On hover, border turns green.

## 8. Trust Section

Below the hero:
```text
Browse without pressure
Profiles are public, structured, and practical.

Reach out when ready
Contact happens through email, not a public feed.

Keep the project moving
No DMs to manage, no platform rituals.
```

Use rounded but not pillowy cards, 8px radius max.

## 9. CTAs

**Primary - `Get started`:**
```text
bg #24313D
text #FFFFFF
height 52px
radius 999px
padding x 28px
hover bg #176346
```

**Secondary - `Browse first`:**
```text
bg transparent
text #24313D
border 1px #B8C6D1
radius 999px
hover bg #FFFFFF, border #176346
```

## 10. Stats

```text
142 musicians ready to be contacted
24 open student gigs
12 campus communities
```

Use soft horizontal stat rows rather than loud number blocks. Count up gently over 1.8s.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `OrbSimulation.tsx` is client-only.
- Use deterministic seeded positions so hydration and visual QA are stable.
- Keep labels few; too many labels becomes a social graph.
- Respect reduced motion and provide a static pastel constellation.
- Do not add avatars, likes, feeds, comments, or DMs.

## 13. The Test

Ask a shy student if this page makes reaching out feel easier or harder. If it feels like a social network, remove labels and reduce clustering. If it feels too abstract, add two more readable labels and make the conversation cards larger. Soft Campus succeeds when the product feels human but not performative.
