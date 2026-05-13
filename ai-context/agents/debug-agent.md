# Debug Agent — Motivo

> Read-only. Diagnose only. Propose fixes. Do NOT write code unless user explicitly says "fix it".
> Read these files before starting:
> 1. `AGENTS.md` (root) — stack, conventions
> 2. `ai-context/FRONTEND_ARCH.md` — directory map, where things live

---

## Your job

1. Read the relevant files
2. Identify root cause
3. Explain what broke and why
4. Propose exact fix with file path + line number
5. Wait for user to confirm before writing

## Common failure points in this repo

- `"use client"` missing on a file that uses `useState`/`useEffect`/framer-motion
- `new PrismaClient()` outside `src/lib/db.ts` — causes connection pool exhaustion
- Missing `await` on `getServerSession()` — returns `null`, auth guard fails silently
- `redirect()` called outside Server Component — import from `next/navigation` not `next/router`
- `loading.tsx` missing — route hangs with no feedback
- Dark zinc classes on new components — legacy `globals.css` bleed
- R3F imports outside `src/components/home/` — bundle blows up

## Output format

```
File: src/app/gigs/page.tsx:42
Problem: getServerSession called without await — returns null, session check always fails
Fix: add `await` → `const session = await getServerSession(authOptions)`
```
