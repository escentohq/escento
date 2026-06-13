# Authentication and Session

## Feature Summary
Escento uses NextAuth v4 with GitHub and Google OAuth providers, Prisma persistence, and JWT sessions enriched with `user.id` and `user.role`. This feature lets users sign in, creates database-backed users through the Prisma adapter, and exposes role-aware session data to pages and server actions.

## Product Intent
- Keep sign-in familiar and low-friction for students.
- Support anonymous browsing, but require auth for profiles, gigs, and role onboarding.
- Make the chosen role available everywhere without every route having to query the user manually.

## Routes
- `/signin`
- `/api/auth/[...nextauth]`
- `/api/auth/signout`
- Every protected page/action via `getServerSession(authOptions)`.

## Relevant Source Code

```ts
// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string | null }).role ?? null;
    
      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? null;
      }
    
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          (typeof token.role === "string" ? token.role : null) ?? null;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

```ts
// src/app/api/auth/[...nextauth]/route.ts
import handler from "@/auth";

export { handler as GET, handler as POST };
```

```ts
// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
  }
}
```

```ts
// middleware.ts
export { default } from "next-auth/middleware";

export const config = { matcher: ["/onboarding/:path*"] };
```

```tsx
// src/app/signin/SignInButtons.tsx
"use client";

import { signIn } from "next-auth/react";

type Props = { callbackUrl: string };

export function SignInButtons({ callbackUrl }: Props) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <button type="button" onClick={() => signIn("github", { callbackUrl })} className="btn-primary w-full">
        Sign in with GitHub
      </button>
      <button type="button" onClick={() => signIn("google", { callbackUrl })} className="btn-secondary w-full">
        Sign in with Google
      </button>
    </div>
  );
}
```

## How It Works
The API route re-exports the NextAuth handler for both GET and POST. `authOptions` configures the Prisma adapter, which persists users, accounts, sessions, and verification tokens in the tables defined by Prisma.

Sessions use JWT strategy. The `jwt` callback refreshes `token.role` from the database whenever `token.sub` exists. The `session` callback copies `token.sub` into `session.user.id` and copies the role into `session.user.role`, matching the ambient type declaration.

The sign-in page reads an optional `callbackUrl`, defaults to `/`, and renders client buttons that call `signIn("github")` and `signIn("google")`.

## Implementation Details for an LLM
Use `getServerSession(authOptions)` in Server Components and server actions. Never trust client state for auth or roles. If a page requires a user, redirect unauthenticated users to `/api/auth/signin` or `/signin?callbackUrl=<route>`. If an action mutates data, repeat the session/role check inside the action.

## Issues and Improvements
- The JWT callback queries the database on every session check. Cache role in JWT and refresh only when necessary, or use an `updatedAt`/version strategy.
- Provider IDs/secrets default to empty strings, which can hide env misconfiguration until runtime. Fail fast in development.
- Middleware only protects onboarding. This is acceptable because pages/actions do their own checks, but future gated route additions must not rely solely on middleware.
- Sign-out uses the default NextAuth route via navbar anchor; a more polished flow could use `signOut()` with callback handling.

