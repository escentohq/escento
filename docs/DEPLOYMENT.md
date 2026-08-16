# Deployment and schema release

How application code and database schema reach production, and how to prove the
two agree. Written for issue #69, after an audit found that nobody could answer
"which migrations are applied to production?" without guessing.

The short version, updated by issue #72: **code and schema now deploy together,
and a broken or unverified schema blocks the code.** That was not always true —
this gap produced the `DB_REBUILD.md` incident, and then issue #68, where
production ran a security migration that had been pasted in by hand, was never
recorded, and silently broke every profile and gig write for a full release
cycle while CI stayed green.

---

## What deploys automatically

| Thing | Trigger | Workflow |
| --- | --- | --- |
| Database schema | push to `main` | `deploy-production.yml` → `migrate` job: `supabase db push`, then `supabase/parity_check.sql` must return no `FAIL` rows |
| Application code | push to `main`, after `migrate` succeeds | `deploy-production.yml` → `deploy` job → Vercel, then a read-only Playwright smoke |
| Lint, typecheck, unit, build | every PR and push to `main` | `ci.yml`, ~90 seconds |
| Secret scan | every PR and push to `main` | `secret-scan.yml` |
| Hosted schema drift | daily at 09:00 UTC, and on demand | `schema-drift.yml` |

`vercel.json` sets `{"git": {"deploymentEnabled": false}}`, so Vercel never
deploys on its own — `deploy-production.yml` is the only path. `deploy` has
`needs: migrate`, so it does not run at all if the migration or the parity check
fails — a red `migrate` job is a release that did not happen, not a release that
happened with an unverified database.

## What does not deploy automatically

`write-flows.yml` is manual: three shards, each booting its own ephemeral
Supabase stack, about 13 minutes. See [When to run the slow lane](#when-to-run-the-slow-lane).
This is unaffected by #72 — it is a pre-merge check, not a release step.

---

## Releasing a schema change

Do these in order. Steps 1–3 happen before merge; 4–6 immediately after.

### 1. Write it as a migration file

`supabase/migrations/<timestamp>_<name>.sql`. Not a dashboard edit, not an MCP
`apply_migration` call against production. Exploring in the dashboard or through
MCP is fine; the change ships as a file or it does not ship.

### 2. Prove it on an ephemeral stack

Run **Actions → Write-flow E2E → Run workflow** on your branch. This is the only
place the migrations, the RLS policies, the column grants, and the application's
write paths are exercised together. `ci.yml` passing means nothing here.

Shard 1 also runs `supabase test db`, which is where
`supabase/tests/write_permissions_test.sql` asserts that a signed-in owner can
create and edit their own rows and cannot reach moderation, visibility,
verification, or identity columns by any route.

### 3. Update the parity check

If you added a migration, add its version and name to the
`expected_migrations` list in `supabase/parity_check.sql`.
`tests/unit/hosted-parity-check.test.ts` fails the fast lane if you forget, so
this is enforced rather than remembered.

### 4. Merge

`deploy-production.yml` runs on push to `main`. As of issue #72, merging is what
applies the migration — steps 5 and 6 are no longer things you do by hand, they
are things you watch.

### 5. `migrate` applies it to hosted Supabase

The `migrate` job runs `supabase db push --db-url "$SUPABASE_DB_URL"`, which
applies every migration not yet in `supabase_migrations.schema_migrations` on
hosted and records it under its own filename version — no manual bookkeeping,
no mismatched timestamp to fix by hand.

If you must apply one out of band (an MCP `apply_migration` call for
exploration, say), it stamps its own timestamp rather than the file's; correct
it before the next `migrate` run, or `db push` will try to apply the same
migration again under a second version:

```sql
update supabase_migrations.schema_migrations
   set version = '<timestamp_from_filename>'
 where name = '<name_without_timestamp>';
```

### 6. `migrate` verifies it — this is the gate

The same job then runs `supabase/parity_check.sql` against hosted and fails if
any row comes back other than `PASS`. `deploy` has `needs: migrate`, so the
Vercel deploy simply does not run when this fails — the release stops here, not
after code has already gone out ahead of a broken database.

The checks: migration history matches `supabase/migrations/` in both
directions; the privileged columns from issue #59 are unreachable for
`authenticated` (`is_public`, `is_verified`, `moderation_status`, `admin_notes`
on `musician_profile` and `gig`; the support/moderation flags on `app_user`);
the columns the write RPCs need *are* granted, and `updated_at` is not — the
`BEFORE UPDATE` trigger owns it; the objects each migration created are
present; the write RPCs are still `SECURITY INVOKER` with no regression to the
bare `INSERT INTO … SELECT` form that caused issue #68; RLS is enabled on all
seven content tables.

You can still run it by hand at any time — paste all of
`supabase/parity_check.sql` into the Supabase SQL editor. It is read-only: it
writes nothing and locks nothing.

### 7. Smoke it

Sign in as a throwaway account and do the two things the marketplace is for:
create a musician profile, and create a gig. Both went through `42501` for a
full release cycle without anyone noticing, because neither is covered by the
production smoke suite (`deploy-production.yml` runs the signed-out read-only
Playwright suite only). Delete the accounts afterwards through `/account`.

---

## When to run the slow lane

`write-flows.yml` is manual and takes ~13 minutes. Run it **before merging**
anything that touches:

- `supabase/migrations/` or `supabase/tests/` — always, without exception;
- `src/lib/api/` — the whole service layer;
- `src/lib/auth-guards.ts` or `middleware.ts`;
- auth, onboarding, messaging, gigs, profiles, moderation, or account deletion
  server actions;
- `e2e/flows/` itself.

A green `ci.yml` says nothing about any of those. It checks lint, types, pure
logic and that the app compiles.

**Before a pilot-sensitive merge, dispatch it with `shards: 1`.** Sharding is a
speed optimisation; a single unsharded run is the stricter check, because it is
the only way to watch the whole suite execute in one process, in order, against
one database. It takes about 4 minutes of test time against a ~25 minute job.
Use the 3-shard default for ordinary iteration.

Neither Playwright suite retries (`retries: 0`, `maxFailures: 1`). A test that
passes only on a second run is a failure — fix the flake, do not re-run. Note
that `maxFailures: 1` also means a shard stops at its first failure, so a green
result for the *tests after* that point has not been observed. Read a red run as
"at least one failure", never "exactly one".

### Never quarantine silently

`test.skip` in `e2e/flows/` requires an open issue and a written reason. When #41
closed, its four skips stayed behind for weeks; #70 found that two of them
described flows that had been working for some time, one was a fixture that had
never been updated for a rule change, and only one was a live product bug. A skip
that outlives its cause removes a required flow from the suite and nothing
reports it.

---

## Known gaps

`SUPABASE_DB_URL` was added as of issue #72: `deploy-production.yml` now has a
`migrate` job the `deploy` job depends on, and `schema-drift.yml` /
`secret-scan.yml` are both enabled with recorded runs. What remains real and
tracked, not an oversight:

- **`schema-drift.yml` (`supabase db diff`) does not reliably detect
  privilege-only or default-only drift.** Verified directly: an unmigrated
  extra table, an added column `DEFAULT`, and a revoked `GRANT` were each
  applied to hosted as disposable, intentional drift, and none of the three
  produced a failing run — `supabase db diff` reported "No schema changes
  found" every time. `migra`-based structural diffing is known to focus on
  relations (tables, columns, types, indexes, functions) and can be blind to
  privilege state and default-only changes, and this may be compounded by
  diffing through the session pooler rather than a direct connection. This
  workflow still catches the case it is best at — a manually-created or
  manually-altered relation that the migrations do not know about at all — and
  it has a recorded successful run, but do not rely on it for the #59/#68 class
  of regression.
  - **`supabase/parity_check.sql`, wired into `migrate`, is what actually
    catches that class.** It queries `has_column_privilege` and specific
    known-good state directly rather than diffing, and its red path is proven:
    a rolled-back transaction introducing four kinds of drift (migration
    history, the #59 privileged-column grants, the #68 write-path grants, a
    missing trigger) produced four `FAIL` rows, all correctly identified.
  - Tracked in #76: try `supabase db diff` against a **direct** (non-pooler)
    connection and re-test the same three drift scenarios before concluding
    the tool itself cannot detect this class of change.

Reading a red `migrate` job: `db push` failures and parity `FAIL` rows are
printed in the job log; `deploy` will not run, so the previous good deployment
stays live.
