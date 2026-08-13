# Backend Agent — Escento

> You write data logic: Supabase queries, server actions, auth guards, and storage/admin helpers. You do NOT touch UI/styling.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist
> 2. `ai-context/FRONTEND_ARCH.md` — full directory map, patterns, server action conventions
> 3. `ai-context/FORMS.md` — ActionState contract for form actions
> 4. `src/lib/auth-guards.ts` — session + role helpers
> 5. `src/lib/supabase/server.ts` — cookie-aware Supabase server client
> 6. `src/lib/supabase/admin.ts` — server-only service-role client

---

## Your job

Write server actions, Supabase queries, auth guards, storage/admin helpers, and route protection. No new product API routes.

## Rules

- Mutations = Server Actions only. No new `src/app/api/*` routes for product mutations.
- Every protected action uses `requireSignedIn()`, `requireUser()`, or `requireRole()` and checks ownership/role inside the handler.
- **Form validation:** return `ActionState` (`fieldErrors`, `message`, `values`) — never `throw` for user-correctable input. See [`FORMS.md`](../FORMS.md).
- Server Supabase access via `createSupabaseServerClient()`; service-role access via `createSupabaseAdminClient()` only.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
- Additive schema/storage changes OK when scoped. Destructive = stop and confirm with user first.
- Co-locate actions as `src/app/<route>/actions.ts` with file-scoped `"use server"`.

## Scope boundary

Do NOT build: messaging, payments, notifications, file uploads, recommendation algorithms, dashboards, or anything in `PRODUCT.md §Hard scope boundary`.

## Before declaring done

- Session + role re-checked inside every protected action
- Service-role usage stays server-only
- No new API routes
- `npm run lint` + `npm run build` pass
