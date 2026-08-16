## Summary

<!-- 1–3 bullets. What changed and why. -->

-

## Test plan

<!-- How a reviewer confirms this works. Include the routes you clicked through. -->

- [ ]

---

## Definition of Done

CI already enforces lint, typecheck, the unit suite, and the build — do not
re-tick those here. It does **not** run the write-flow E2E suite, which is
manual (Actions → Write-flow E2E → Run workflow) and is the only thing that
exercises auth, messaging, gigs, moderation, migrations, and RLS together.
What is left is what a machine
cannot check:

- [ ] Page is a Server Component unless it genuinely needs to be client.
- [ ] All mutations are Server Actions; session + role re-checked inside via `requireSignedIn()`, `requireUser()`, or `requireRole()`.
- [ ] Bright stage-light tokens used. No `bg-zinc-*`, no `violet-*`, no `text-zinc-*`.
- [ ] Icons are `lucide-react`. No emoji.
- [ ] No new routine motion (reveals, page transitions, hover lifts, parallax). Targeted CSS state transitions only.
- [ ] Loading + empty + error states present for any new async route.
- [ ] Form labels are `<label htmlFor>` bound to input `id`.
- [ ] Forms use `FormField` + the error hierarchy from `docs/ai-context/FORMS.md`.
- [ ] `aria-hidden` on decorative icons; `aria-label` on icon-only buttons/links.
- [ ] Reused existing helpers (service layer in `src/lib/api/`, auth guards) — did not duplicate.
- [ ] No new dependencies without approval.

### If this PR adds a route

- [ ] Classified in `e2e/route-inventory.ts` (the unit suite fails otherwise).

### If this PR changes the database

- [ ] The change is in `supabase/migrations/`, not only in the Supabase dashboard.
- [ ] Added to the `expected_migrations` list in `supabase/parity_check.sql` (the unit suite fails otherwise).
- [ ] Write-flow E2E run on this branch, linked above — `ci.yml` does not exercise migrations, grants, or RLS.
- [ ] Release steps 5–7 of [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) scheduled: apply to hosted, record the version, run `supabase/parity_check.sql` and get all PASS.
