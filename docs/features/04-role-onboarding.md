# Role Onboarding

## Feature Summary
Role onboarding is the one-time step that turns a newly authenticated user into either a musician or creator. The selected role drives navigation, authorization, and primary creation flows.

## Product Intent
- Force an explicit marketplace side before users create data.
- Keep the choice simple: `MUSICIAN` or `CREATOR`.
- Redirect users with an existing role away from onboarding.

## Routes and Files
- `/onboarding/role`
- `src/app/onboarding/role/page.tsx`
- `src/app/onboarding/role/actions.ts`
- `middleware.ts`

## Relevant Source Code

```tsx
// src/app/onboarding/role/page.tsx
export default async function RoleOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role) redirect("/");

  return (
    <div className="mx-auto max-w-xl py-8">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Choose your role</h1>
        <p className="mt-2 text-sm text-zinc-400">This helps Escento show the right tools for you.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <form action={async () => { "use server"; await setRole("MUSICIAN"); }} className="flex-1">
            <button type="submit" className="btn-primary w-full">I’m a Musician</button>
          </form>
          <form action={async () => { "use server"; await setRole("CREATOR"); }} className="flex-1">
            <button type="submit" className="btn-primary w-full">I’m a Creator</button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

```ts
// src/app/onboarding/role/actions.ts
"use server";

export async function setRole(role: "MUSICIAN" | "CREATOR") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  redirect("/");
}
```

## How It Works
The page checks for a valid session. If the user is anonymous, it redirects to sign-in. If the user already has a role, it redirects home. Otherwise it renders two server-action forms that call `setRole` with a literal role value.

`setRole` revalidates the session server-side, writes the role to the `User` row, and redirects to `/`. The home page then uses the role to choose the next CTA.

## Implementation Details for an LLM
This feature is intentionally irreversible in the UI. Do not add role switching unless scope changes. Any feature that assumes a role should handle `null` role by redirecting to `/onboarding/role` or `/`.

## Issues and Improvements
- Both buttons use primary styling, which conflicts with the one-primary-action guideline. A better UI would present two equal role cards with one selected submit action.
- The action accepts only typed role values, but the UX has no confirmation. If role switching is ever added, it needs migration rules for existing data.
- After `setRole`, the JWT callback refreshes role from DB, but there may be a brief stale-session moment depending on caching.

