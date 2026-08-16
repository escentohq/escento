# Deployment and schema release

How application code and database schema reach production, and how to prove the
two agree. Written for issue #69, after an audit found that nobody could answer
"which migrations are applied to production?" without guessing.

The short version: **code deploys itself, schema does not.** A green deploy
proves nothing about the database. That gap is the single most expensive thing
in this repo's history — it produced the `DB_REBUILD.md` incident, and then
issue #68, where production ran a security migration that had been pasted in by
hand, was never recorded, and silently broke every profile and gig write for a
full release cycle while CI stayed green.

---

## What deploys automatically

| Thing | Trigger | Workflow |
| --- | --- | --- |
| Application code | push to `main` | `deploy-production.yml` → Vercel, then a read-only Playwright smoke |
| Lint, typecheck, unit, build | every PR and push to `main` | `ci.yml`, ~90 seconds |
| Secret scan | every PR and push to `main` | `secret-scan.yml` |

`vercel.json` sets `{"git": {"deploymentEnabled": false}}`, so Vercel never
deploys on its own — `deploy-production.yml` is the only path.

## What does not deploy automatically

**Database migrations.** There is no `SUPABASE_DB_URL` repository secret, so
`deploy-production.yml` has no migrate step and `schema-drift.yml` cannot run
(it is currently `disabled_manually` and has never recorded a run). Applying a
migration is a deliberate human action, described below.

`write-flows.yml` is also manual: three shards, each booting its own ephemeral
Supabase stack, about 13 minutes. See [When to run the slow lane](#when-to-run-the-slow-lane).

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

### 4. Merge, and let the code deploy

`deploy-production.yml` runs on push to `main`.

> **Ordering.** If the new code requires the new schema, apply the migration
> (step 5) *before* merging, not after. Additive schema changes are safe in
> either order; anything the code depends on is not.

### 5. Apply the migration to hosted Supabase

Either route is acceptable. Both end at step 6.

**Via the Supabase SQL editor** — open the project's SQL editor, paste the
migration file verbatim, run it. Then record it, or the next parity check will
report drift:

```sql
insert into supabase_migrations.schema_migrations (version, name)
values ('<timestamp>', '<name_without_timestamp>');
```

**Via Supabase MCP** — `apply_migration` with the file's contents. It stamps its
own timestamp rather than the file's, so afterwards correct the recorded version
to match the filename:

```sql
update supabase_migrations.schema_migrations
   set version = '<timestamp_from_filename>'
 where name = '<name_without_timestamp>';
```

Getting this right is not bookkeeping. `supabase db push` and `supabase db diff`
both key off `version`, so a mismatched stamp means a migration re-runs or a
drift check compares the wrong things.

### 6. Run the parity check — this is the gate

Paste **all** of `supabase/parity_check.sql` into the Supabase SQL editor and
run it. It is read-only: it writes nothing and locks nothing, and it is safe
against production at any time.

Every row must come back `PASS`. It checks:

- migration history matches `supabase/migrations/` in both directions;
- the privileged columns from issue #59 are unreachable for `authenticated`
  (`is_public`, `is_verified`, `moderation_status`, `admin_notes` on
  `musician_profile` and `gig`; the support/moderation flags on `app_user`);
- the columns the write RPCs need *are* granted, and `updated_at` is not —
  the `BEFORE UPDATE` trigger owns it, so a client cannot forge a timestamp;
- the objects each migration created are present;
- the write RPCs are still `SECURITY INVOKER`, and none has regressed to the
  bare `INSERT INTO … SELECT` form that caused issue #68;
- RLS is enabled on all seven content tables.

A single `FAIL` means hosted has drifted and the release is not safe to hand to
users. Fix the drift, do not edit the check.

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

Neither Playwright suite retries (`retries: 0`, `maxFailures: 1`). A test that
passes only on a second run is a failure — fix the flake, do not re-run.

---

## Known gaps

These are real and tracked, not oversights:

- **`schema-drift.yml` has never run.** It requires a `SUPABASE_DB_URL`
  repository secret that does not exist, and it is currently
  `disabled_manually`. `supabase/parity_check.sql` is the manual stand-in.
  Automating it needs the secret (Supabase → Project Settings → Database →
  Connection string → URI, session mode), after which the workflow can be
  enabled and wired into `deploy-production.yml` as a job the deploy depends on.
- **`deploy-production.yml` has no migrate step**, for the same reason.
- **`secret-scan.yml` is also `disabled_manually`**, despite being described
  elsewhere as running alongside CI.

Until the secret exists, step 6 is the gate, and it is a human one. That is a
weaker guarantee than a workflow, and it is stated here rather than implied so
nobody mistakes a green deploy for a verified one.
