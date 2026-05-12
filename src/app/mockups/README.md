# Mockups

Internal landing page exploration. Twenty competing directions, single branch, zero merge pain.

## Live URL

- Dev: http://localhost:3000/mockups
- Prod: 404 unless `MOCKUPS_ENABLED=true` set.

## Add a mockup

Slug = `<author>-<NN>` (e.g. `you-03`, `partner-07`).

```bash
SLUG=you-03
cp -r src/app/mockups/_template      src/app/mockups/$SLUG
cp -r src/components/mockups/_template src/components/mockups/$SLUG

# update imports inside the new page.tsx + components:
#   @/components/mockups/_template/*  →  @/components/mockups/<SLUG>/*
```

Then register it in [page.tsx](./page.tsx) `MOCKUPS` array so it shows in the gallery.

## Rules (enforced by convention, not lint)

1. **No cross-imports.** A mockup may import only from its own folder or `_shared/`. Never from another mockup.
2. **Page-local state stays page-local.** Animations, hooks, client components — all live inside the mockup folder.
3. **`_shared/` is sacred.** Both contributors agree before adding to it. Stays small.
4. **Design tokens** = Tailwind theme + CSS vars scoped to the route. Don't fork the tailwind config.
5. **One PR per mockup.** Small, reviewable. Both contributors can ship in parallel — folders never collide.

## Recommended libs (not yet installed)

```bash
npm i framer-motion lucide-react clsx tailwind-merge
npm i -D @tailwindcss/typography
```

Optional polish: `react-wrap-balancer`, `embla-carousel-react`, `vaul` (drawer), `sonner` (toast).

## Promoting the winner

Once a mockup is picked:

1. Move `src/components/mockups/<slug>/*` → `src/components/landing/*` (drop slug prefix).
2. Move `src/app/mockups/<slug>/page.tsx` content → replace `src/app/page.tsx` (or new `(marketing)/page.tsx`).
3. Promote anything from `_shared/` that survived to `src/components/ui/`.
4. Delete `src/app/mockups/` and `src/components/mockups/` entirely.
5. Drop the `MOCKUPS_ENABLED` env gate from `next.config.ts` / deploy.

Single commit. Clean cut.
