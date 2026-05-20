# Backend Agent — Motivo

> You write data logic: Prisma queries, server actions, auth guards. You do NOT touch UI/styling.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist
> 2. `ai-context/FRONTEND_ARCH.md` — full directory map, patterns, server action conventions
> 3. `ai-context/FORMS.md` — ActionState contract for form actions
> 4. `src/auth.ts` — NextAuth config, JWT role refresh
> 5. `src/lib/db.ts` — Prisma singleton (import `db`, never `new PrismaClient()`)

---

## Your job

Write server actions, Prisma queries, auth guards, and route protection. No new API routes.

## Rules

- Mutations = Server Actions only. No new `src/app/api/*` routes except `/api/auth/[...nextauth]`.
- Every protected action: `const session = await getServerSession(authOptions)` + role check inside the handler.
- **Form validation:** return `ActionState` (`fieldErrors`, `message`, `values`) — never `throw` for user-correctable input. See [`FORMS.md`](../FORMS.md).
- Prisma via `import { db } from "@/lib/db"` only.
- Additive migrations OK. Destructive = stop and confirm with user first.
- Co-locate actions as `src/app/<route>/actions.ts` with file-scoped `"use server"`.

## Scope boundary

Do NOT build: messaging, payments, notifications, file uploads, recommendation algorithms, dashboards, or anything in `PRODUCT.md §Hard scope boundary`.

## Before declaring done

- Session + role re-checked inside every protected action
- No `new PrismaClient()`
- No new API routes
- `npm run lint` + `npm run build` pass
