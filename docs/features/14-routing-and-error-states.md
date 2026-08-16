# Routing, 404s, and Error States

## Feature Summary
Escento uses Next.js App Router conventions with route-level redirects, `notFound()`, and a global `not-found.tsx`. Server action errors currently throw and rely on framework error handling.

## Product Intent
- Keep invalid IDs and missing records from rendering broken pages.
- Redirect users to the right flow when auth, role, or ownership does not match.
- Provide a branded 404 fallback.

## Relevant Source Code

```tsx
// ID guard pattern
function isValidId(id: string) {
  return id.length > 0 && id.length < 64;
}

if (!isValidId(id)) notFound();
if (!profile) notFound();
```

```tsx
// Auth redirect pattern
const session = await getServerSession(authOptions);
if (!session?.user?.id) redirect("/api/auth/signin");
if (session.user.role !== "CREATOR") redirect("/");
```

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <EmptyState
          eyebrow="404 Error"
          title="Page not found"
          body="The page you're looking for doesn't exist, has been moved, or hasn't been built yet."
          cta={<PrimaryCta href="/">Return Home</PrimaryCta>}
        />
      </div>
    </div>
  );
}
```

## How It Works
Public detail routes use `notFound()` for invalid or missing records. Protected routes use `redirect()` for auth and role mismatches. Owner-only routes redirect non-owners to `/gigs/manage`.

## Implementation Details for an LLM
Add segment-level `loading.tsx` and `error.tsx` files when adding new async routes. For form mutations, prefer inline validation state over throwing raw errors.

## Issues and Improvements
- No route segment has a `loading.tsx` skeleton.
- No custom `error.tsx` boundaries exist for forms or data routes.
- ID validation is only length-based; CUID format validation could be stronger.
- Redirects sometimes go to `/api/auth/signin` rather than the branded `/signin` page with callback.
