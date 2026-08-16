# Escento MVP Readiness Audit

Audit date: August 16, 2026

Repository: `escentohq/escento` at `663d7c3`

Supersedes the August 15, 2026 snapshot in this file

---

> ## Status: MVP-09, MVP-10 and MVP-11 are resolved
>
> This document is a point-in-time record of the audit at `663d7c3`. It is kept
> as written — the findings below describe the repository as it was, not as it
> is. Everything the audit blocked on has since been fixed and verified:
>
> | Finding | Issue | Resolution |
> | --- | --- | --- |
> | MVP-09 — privilege hardening blocks profile and gig creation | #68 | Fixed in `20260816130000_fix_transactional_write_grants.sql`. The create RPCs name only granted columns and let table defaults supply the privileged ones; `updated_at` moved to a `BEFORE UPDATE` trigger. The audit did not catch that the *edit* RPCs were broken by the same migration for the same reason — they were, and they are fixed too. |
> | MVP-10 — hosted migration state neither deployed nor verified | #69 | Hosted was missing `20260816040000` entirely and had `20260816120000` applied but unrecorded, so production had been failing every profile and gig write. Both applied, migration history restated to match the repository, and `supabase/parity_check.sql` added as the read-only gate. `docs/DEPLOYMENT.md` is the runbook. |
> | MVP-11 — four required regressions remain skipped | #70 | All four skips removed. Two flows were already passing, one had an obsolete fixture, and one was a real product bug: `ConnectButton` froze on its initial `null` relationship, so returning visitors never saw Pending, Message, or Respond to request. |
>
> Verified on `main` at `506982e`: the write-flow suite passes unsharded on the
> first attempt (60 passed, plus 63 pgTAP assertions), the 3-shard workflow
> passes on the first attempt, and `supabase/parity_check.sql` returns PASS on
> every check against hosted Supabase.
>
> One audit criterion is **not** met and is tracked in #72: `schema-drift.yml`
> still has no recorded run, because it needs a `SUPABASE_DB_URL` secret that
> does not exist. Until it does, the parity check is a human gate, and
> `docs/DEPLOYMENT.md` says so rather than implying a green deploy is a verified
> one.

---

## Executive Summary

Escento is **not ready for pilot users today**. The public product, auth gates, discovery surfaces,
request/message model, moderation rules, account controls, and legal pages are substantially built.
The previous audit's role, atomicity, deletion, lifecycle, legal, malformed-ID, identity-readiness,
and moderation findings all have implementations and regression artifacts in the repository.

The current blocker is narrower and more immediate: the latest privilege-hardening migration
(`20260816120000_lock_app_user_self_update.sql`) prevents the transactional profile and gig creation
RPCs from inserting their root rows. A fresh local Supabase stack reproduced PostgreSQL `42501`
errors in all three write-flow shards. A new musician therefore cannot finish profile creation and a
creator cannot publish a gig in the schema represented by `main`.

Production schema state is also not proven. Production deployment does not apply migrations, the
repository has no recorded schema-drift workflow run, and the pull-request process says migrations
are pasted into the hosted SQL editor manually. That means the hosted system may either lack the
security hardening from issue #59 or contain the hardening and inherit the creation regression. No
production mutation was performed during this audit.

| Severity | Count |
| --- | ---: |
| P0 | 1 |
| P1 | 1 |
| P2 | 1 |
| P3 | 0 |

The shortest path to a usable MVP is finite:

1. Repair the profile/gig RPC privilege contract without restoring writes to moderation/support
   columns.
2. Apply and verify the exact migration set in hosted Supabase, then make schema drift observable.
3. Run the entire isolated write-flow suite to completion and remove the four remaining skips.
4. Rehearse the two-account musician/creator loop and external email/OAuth/storage configuration in
   the deployed pilot environment.

## Canonical MVP Scope

The audited MVP is the smallest product that lets real musicians and people hiring them complete
discovery, direct outreach, and conversation:

- account creation, sign-in/out, recovery, session continuity, and one-time role onboarding;
- a musician profile with existing identity, skill, location, availability, and work-link fields;
- public musician and open-gig discovery with the filters already implemented;
- creator-owned gig create, edit, close/reopen, and delete;
- connection request send, receive, accept/reject/cancel, and duplicate prevention;
- accepted 1:1 conversations with persisted messages, unread state, and blocking;
- transactional request/message email where configured;
- reporting, operator moderation, account settings, and account deletion;
- safe loading, empty, error, not-found, authorization, and mobile behavior.

Payments, escrow, contracts, calendars, ratings, reviews, favorites, feeds, follows, group chat,
calls, AI matching/recommendations, subscriptions, native apps, advanced verification, and hosted
portfolio media remain outside MVP scope.

## Architecture Observed

- Next.js 16 App Router, React 19, TypeScript, and Server Components by default.
- Supabase Auth with SSR cookies, PostgreSQL/RLS, Supabase Storage, an anonymous public client, a
  session client, and a server-only service-role client.
- Mutations are Server Actions; protected pages/actions use the established auth guards. Product
  data access is concentrated under `src/lib/api/`.
- Public profile, gig, and taxonomy reads use `unstable_cache` and tag invalidation. User-specific
  session and messaging reads are not persistently cached.
- Profile/gig root and taxonomy writes use PostgreSQL RPCs. Request acceptance and account data
  deletion also use database functions.
- Messaging stores requests, conversations, participants, messages, read timestamps, soft-deleted
  participant state, and directional blocks. Request/message email is best-effort through Resend.
- CI gates lint, typecheck, unit tests, and build. The local-Supabase write-flow suite is manual and
  sharded. Schema drift is scheduled/manual but has never recorded a run in GitHub Actions.

### Documentation drift

Actual source was used as the tie-breaker. Notable stale documentation remains:

- `CLAUDE.md` says there is no RLS and that IDs are text, while live migrations use extensive RLS
  and core marketplace IDs are UUIDs.
- `docs/ai-context/userflows/musician-conversation-flow.md` is marked planned and describes an old
  gig-specific, realtime design. Live messaging uses generalized connection requests and refresh-
  based persisted conversations.
- `docs/ai-context/userflows/onboarding-flows.md` refers to the old `user` table, old copy, and a
  single-step profile form. Live code uses `app_user` and a resumable multi-step wizard.
- `PRODUCT.md` says all musician profiles are public; live RLS requires account/profile moderation
  visibility and a launch-readiness predicate.
- `FRONTEND_ARCH.md` still says some actions throw user-correctable errors and skip revalidation;
  live form actions use `ActionState`, and marketplace mutations invalidate caches.
- `UX_RULES.md` says no loading routes/modals exist; the current route tree has both loading files
  and `ConfirmDialog`.

These are documentation-maintenance risks, not separate launch blockers in this audit.

## Audit Method and Runtime Limits

### Completed

- Read repository instructions, `CLAUDE.md`, all primary AI-context documents, all agent files,
  both documented user flows, package/configuration, route inventory, actions, service layers,
  auth/middleware, migrations, email/messaging/moderation code, shared states, environment contract,
  and tests.
- Rechecked every finding from the August 15 audit against current source, migrations, commits,
  tests, and GitHub issue state.
- Rendered public, auth, invalid-ID, and protected routes in Chrome at 1440×900, 768×1024, and
  390×844. Screenshots were inspected for the landing page, musician/gig directories, auth, and
  protected redirects. No document-width overflow or uncaught browser error was observed.
- Ran the complete read-only Playwright suite locally: 40 passed.
- Inspected GitHub Actions and the isolated local-Supabase run on current `main`: database policy
  tests passed, but every write shard failed at profile/gig creation with `42501`.
- Ran lint, typecheck, 102 unit tests, production build, production dependency audit, and
  `git diff --check`.

### Not safely runtime-verified

- No hosted/production signup, role, profile, gig, message, moderation, deletion, report, or storage
  mutation was performed.
- Google OAuth, password-reset email receipt, Resend delivery, verified sender domains, Geoapify,
  profile-picture storage, session expiry after time, and Vercel environment values were not
  externally rehearsed.
- Authenticated mobile screens could not be walked end to end because the isolated write suite stops
  at the current P0 and production data was kept read-only.
- Hosted Supabase migration history/schema could not be compared: the Supabase CLI is unavailable
  locally, no database URL is configured for the GitHub drift workflow, and that workflow has no
  recorded run.

## Core Flow Status

| Flow | Status | Severity | Evidence | Related issues |
| --- | --- | --- | --- | --- |
| Signed-out landing/discovery | Functional | — | Browser captures at all three widths; 40/40 read-only Playwright checks passed | — |
| Signup/sign-in/onboarding gates | Substantially functional | P1 operational caveat | Signed-out redirects and auth form inventory pass; role trigger/action exist; hosted schema state unproved | MVP-10 |
| New musician profile | **Broken on current schema** | P0 | Local-Supabase profile creation fails with `42501 permission denied for table musician_profile` | MVP-09 |
| Musician discovery/profile detail | Functional for existing launch-ready data | — | Search/filter/detail/empty/404 render; public RLS/query/readiness tests exist | #25, #26, #28 resolved |
| Creator publishes a gig | **Broken on current schema** | P0 | Local-Supabase gig creation fails with `42501 permission denied for table gig` | MVP-09 |
| Creator manages an existing gig | Implemented; full regression incomplete | P2 | Owner actions/guards exist; edit and close/reopen specs exist; delete spec remains skipped | MVP-11 |
| Musician browses/contacts gig owner | Code-complete; blocked from fresh fixture setup | P0 dependency | Discovery/contact logic exists; fresh creator gig cannot be published in the isolated stack | MVP-09 |
| Request lifecycle | Implemented; incomplete final evidence | P2 | Reject/cancel/accept/block cases exist; duplicate-request and complete two-user lifecycle specs remain skipped | MVP-11 |
| Direct messaging | Implemented; incomplete final evidence | P2 | Membership/RLS, persistence, unread, message validation, keyboard send, and block code exist; complete two-way spec is skipped | MVP-11 |
| Notifications | Implemented; provider delivery unverified | — | Five email tests pass; in-app counts/links exist; external Resend configuration not exercised | launch rehearsal |
| Moderation/reporting | Implemented; one cache case skipped | P2 | pgTAP passed; profile/account cache hide/restore spec exists; gig/account cache spec remains skipped | MVP-11 |
| Account management/deletion | Implemented; current suite blocked during fixture creation | P0 dependency | Transactional/idempotent deletion code/tests exist; shard failed before deletion assertions because profile create failed | MVP-09 |
| Legal consent | Implemented in source | — | Terms, Privacy, and Acceptable Use are substantive; five legal unit tests and public route checks pass | #10/#36–#38 resolved; #49 stale/open |
| Mobile public/auth surfaces | Functional in reviewed scope | — | 390×844 captures show no horizontal overflow or material clipping | authenticated rehearsal pending |

## Findings

### MVP-09 — Privilege hardening blocks transactional profile and gig creation

- **Severity:** P0 — launch blocker
- **Affected users:** every new musician and creator
- **Affected routes/services:** `/profile/create/**`, `/gigs/create`, `createProfile()`, `createGig()`,
  `create_musician_profile_with_tags`, `create_gig_with_tags`
- **Expected:** a signed-in musician can create a profile and a signed-in creator can publish a gig,
  while neither can write moderation, verification, or support-account columns.
- **Actual:** both transactional create RPCs fail with PostgreSQL `42501 permission denied` on a
  fresh database built from `supabase/migrations/`.
- **Reproduction:** run the manual Write-flow E2E workflow on `663d7c3`. Shard 1 fails while creating
  the account-deletion profile fixture; shard 2 fails the creator-publishes-gig flow; shard 3 fails
  the moderation profile fixture. Logs identify denied inserts on `musician_profile` and `gig`.
- **Evidence:** GitHub Actions run `31933990213`; `supabase/migrations/20260816120000_lock_app_user_self_update.sql`;
  the transactional functions in the `20260816010000` and `20260816020000` migrations.
- **Likely cause:** issue #59 correctly replaced table-wide authenticated DML with column-level
  grants, but the invoker-security create functions use `INSERT ... SELECT composite.*`. PostgreSQL
  evaluates that insert against every table column, including columns intentionally omitted from
  the authenticated insert grant.
- **MVP impact:** two foundational supply-side flows cannot begin. Downstream request, messaging,
  moderation, and deletion tests cannot construct representative users/listings.
- **Fix scope:** change the function/grant contract so each transactional function writes only the
  allowed product columns (or uses another narrowly privileged database boundary). Do not restore
  authenticated writes to `is_admin_support_account`, moderation, visibility, or verification
  columns. Cover success and privileged-column refusal together.
- **Verification:** profile and gig create/edit succeed on a fresh migrated stack; atomic rollback
  tests still pass; direct authenticated writes to all privileged columns still fail; the full
  write-flow suite advances past fixture creation.
- **GitHub:** new parent and child issues are listed below.

### MVP-10 — Hosted database migration state is neither deployed nor verified automatically

- **Severity:** P1 — core security/reliability readiness gap
- **Affected users:** all hosted users
- **Affected systems:** production Supabase, deployment workflow, schema-drift workflow
- **Expected:** the hosted database is known to match reviewed migrations before pilot use, and a
  deploy cannot silently pair new application code with old schema/security rules.
- **Actual:** Vercel production deploys application code only. The pull-request template and latest
  migration require a manual SQL-editor paste. GitHub reports no run for `schema-drift.yml`, whose
  own comments require an absent `SUPABASE_DB_URL` secret.
- **Evidence:** `.github/workflows/deploy-production.yml`, `.github/workflows/schema-drift.yml`,
  `.github/pull_request_template.md`, `20260816120000_lock_app_user_self_update.sql`, GitHub Actions
  history on August 16.
- **Likely cause:** hosted database credentials were intentionally withheld from CI without an
  alternative release gate or recorded operator checklist.
- **MVP impact:** if the hardening migration is absent, the support-account impersonation and
  self-moderation vulnerability from #59 remains. If it is present unchanged, profile/gig creation
  inherits MVP-09. A green application deploy does not distinguish those states.
- **Fix scope:** after MVP-09 is corrected, apply the reviewed migration set to hosted Supabase,
  verify migration/schema parity read-only, and establish a repeatable deploy/drift check. Do not
  run destructive resets or copy local test data to production.
- **Verification:** hosted migration history/schema matches the repository; direct privileged writes
  are refused; one supervised musician profile and creator gig smoke succeeds; a drift workflow has
  a recorded successful run and fails on an intentional disposable mismatch.
- **GitHub:** new parent and child issues are listed below.

### MVP-11 — Four required end-to-end regressions remain explicitly skipped

- **Severity:** P2 — required reliability evidence gap
- **Affected flows:** duplicate request state, complete request-to-two-way-message loop, gig delete,
  and gig/creator-account moderation cache invalidation
- **Expected:** the isolated suite executes these required MVP flows, and a regression makes the
  workflow red.
- **Actual:** four `test.skip` calls remain. Their comments point to closed issue #41 and say the
  tests failed consistently on `main`. Closing #41 did not remove the skips. The write workflow is
  manual, so normal PR CI cannot see these paths.
- **Evidence:** `e2e/flows/messaging.spec.ts`, `messaging-advanced.spec.ts`,
  `gig-lifecycle.spec.ts`, and `moderation-visibility.spec.ts`; closed #41; workflow comments.
- **MVP impact:** these product paths may work, but the repository cannot currently demonstrate that
  they do. The uncertainty is material for a small pilot because request-to-message is the matching
  loop, gig deletion is promised, and moderation visibility is a safety control.
- **Fix scope:** after MVP-09, run each skipped case independently, fix actual product/test defects,
  remove all four skips, and decide a documented pre-pilot/merge cadence for the slow workflow.
- **Verification:** `rg 'test\.skip' e2e/flows` returns no unexplained required-flow skip and one clean
  unsharded/sharded local-Supabase run executes every scenario on first attempt.
- **Existing issue:** #41 described these exact cases but is closed while the skips remain. A new
  child is required rather than silently reopening or modifying the closed issue during this audit.

## Prior Audit Findings Reverified

| Prior finding | Current result | Evidence |
| --- | --- | --- |
| MVP-01 moderation visibility (#25/#26) | Resolved in policy/query/cache code; one gig cache E2E remains skipped under MVP-11 | moderation migration, pgTAP pass, profile moderation spec |
| MVP-02 immutable first role (#27) | Resolved | compare-and-set action, immutable-role trigger, direct-write tests |
| MVP-03 atomic profile/gig writes (#30/#31) | Atomic design present, but create is now blocked by MVP-09 | transactional RPCs and rollback tests |
| MVP-04 deletion recovery (#32) | Resolved in design/code; current UI E2E cannot set up its profile fixture | deletion RPC, staged idempotent cleanup, four E2E cases |
| MVP-05 deadline/closed detail (#33/#34) | Resolved | Pacific-day deadline helper, public lifecycle split, unskipped close/reopen/filled-detail tests |
| MVP-06 legal pages (#10/#36–#38) | Resolved in source/tests | substantive pages and five unit tests |
| MVP-07 malformed IDs (#35) | Resolved | central ID validation and four passing browser cases |
| MVP-08 profile/creator readiness (#28/#29) | Resolved | RLS launch-ready predicate and creator public-name guard |
| Support-account impersonation (#59) | Fixed in repository intent, but deployment unproved and fix causes MVP-09 locally | column grants, direct-write tests, no hosted drift evidence |

## Security and Authorization Findings

- **P1:** hosted enforcement of issue #59 is unproved (MVP-10). This is the highest remaining
  security risk.
- The migration correctly intends to deny authenticated writes to support, moderation, visibility,
  and verification flags on `app_user`, `gig`, and `musician_profile`.
- Role assignment is protected by an action compare-and-set and a database trigger.
- Page/action route inventory is complete; protected pages call approved guards and 14 signed-out
  redirect cases pass in Playwright.
- Gig owner actions load the gig through the creator-scoped service before mutation; profile writes
  and RPCs enforce the authenticated owner; messaging transitions derive the actor from session and
  use RLS/database constraints.
- No evidence was found that one user can read another user's private conversation or edit another
  creator's gig through current supported paths.
- `npm audit --omit=dev` reported zero production dependency vulnerabilities.

## Data Integrity Findings

- MVP-09 is a permissions regression, not a rollback regression: atomic RPCs refuse to begin, so no
  partial profile/gig is committed in the observed failure.
- Atomic failure-injection unit/source invariants remain present for profile and gig root/tag writes.
- Account database deletion is transactional; Storage and Auth cleanup is ordered and idempotent.
- Request constraints cover self-request, unique pending pairs, actor-specific transitions,
  participant membership, body limits, and blocks.
- Gig discovery/actionability combines status and Pacific-day deadline semantics; filled details are
  readable but non-actionable.

## Mobile Findings

No launch-blocking defect was found in the runtime-reviewed signed-out/mobile scope at 390×844:

- landing, musician directory, gig directory, sign-in, sign-up, FAQ/help, invalid IDs, and protected
  redirects had `scrollWidth === clientWidth`;
- navigation remained reachable, directory filters stacked, controls met usable widths, and auth
  labels were bound;
- empty gig inventory and profile rows remained readable.

Authenticated wizard, management, request, message, admin, and destructive-confirmation surfaces
must be rechecked at 390×844 after MVP-09 because their real fixture setup currently fails.

## Reliability and Error-State Findings

- 40/40 read-only Playwright cases passed, including all concrete public/protected inventory routes,
  auth form presence, unknown route 404, and malformed/missing profile/gig IDs.
- Browser instrumentation found no uncaught page errors on the reviewed routes.
- Loading/error surfaces exist across major async route segments; branded not-found behavior exists
  for global and dynamic-resource routes.
- Public directories degrade failed reads to empty inventory, which avoids a public 500 but makes
  operational monitoring important so database failures are not mistaken for a genuinely empty
  marketplace.
- The fast CI lane passed at current `main`, while the manually triggered write lane failed. A green
  normal CI run is therefore not evidence that the MVP works end to end.

## Existing Issues That Already Cover Findings

- #59 documents the original privileged-own-row vulnerability and is closed. MVP-09 is a regression
  caused by its fix, not a duplicate of the vulnerability report.
- #41 documents the four historically failing write cases and is closed even though four matching
  tests remain skipped. MVP-11 references it rather than recreating the old diagnosis.
- #49 remains open for legal routes, but current pages and tests satisfy its written acceptance
  criteria. It should be triaged separately; no new legal issue was created.
- #9 (performance), #4/#5/#17 (visual work), and the completed August 15 MVP hierarchy are not
  duplicated.

## GitHub Issue Hierarchy

GitHub's native parent/sub-issue relationship was used:

- [#67 — Restore and prove marketplace write safety](https://github.com/escentohq/escento/issues/67)
  - [#68 — Fix transactional profile and gig create permissions](https://github.com/escentohq/escento/issues/68) — MVP-09 / P0
  - [#69 — Verify and gate hosted Supabase schema parity](https://github.com/escentohq/escento/issues/69) — MVP-10 / P1
  - [#70 — Unskip and pass the remaining required write flows](https://github.com/escentohq/escento/issues/70) — MVP-11 / P2

The parent contains a linked checklist and each child includes implementation scope, non-goals,
acceptance criteria, testing requirements, the audit link, and its finding ID.

## Out of Scope / Rejected Suggestions

No issues were created for payments/escrow, contracts, scheduling, ratings/reviews, favorites,
profile scores, feeds/follows, AI matching/recommendations, group chat, realtime presence, calls,
push/SMS/digests, native apps, subscriptions, monetization, advanced analytics, advanced portfolio
hosting, or identity-verification infrastructure.

No issue was created merely because the public gig directory is currently empty: the two stored
gigs observed through existing read-only data have passed deadlines, and excluding them is the
intended lifecycle behavior.

## Recommended Execution Order

1. Fix MVP-09 on a fresh local stack while retaining every issue #59 security assertion.
2. Run the complete write suite. Resolve and unskip the four MVP-11 cases before trusting downstream
   flow results.
3. Apply the corrected migration set to hosted Supabase and complete MVP-10 schema/security/write
   verification.
4. Rehearse OAuth/reset/email/storage and the two-account musician/creator loop on desktop and mobile.
5. Start only a supervised pilot after every launch checklist item below is checked.

## Launch Checklist

- [ ] A fresh migrated stack creates and edits a musician profile through the real wizard.
- [ ] A fresh migrated stack creates, edits, fills/reopens, and deletes a gig through the real UI.
- [ ] Authenticated users cannot set support-account, moderation, visibility, or verification flags.
- [ ] Hosted Supabase is proven to match the corrected migration set.
- [ ] Hosted signup, role selection, one profile, and one gig complete in a supervised smoke test.
- [ ] Every required write-flow test runs without `test.skip` and the full workflow passes once with
      no retry.
- [ ] Request send/duplicate/reject/cancel/accept and two-way persisted messaging pass with two users.
- [ ] Unread/read, return-to-thread, block/unblock, and report/admin handling pass.
- [ ] Profile/gig/account hide and restore leave cached public home/list/detail reads correct.
- [ ] Account deletion removes product rows, Auth, Storage, and public cache state, and retry converges.
- [ ] Google OAuth, password reset, request/message email links, sender domain, Geoapify, and profile
      image upload are verified in the deployed pilot environment.
- [ ] Authenticated core flows complete at desktop and 390×844 without overflow or dead ends.
- [x] Read-only public/protected/404 browser suite passes (40/40).
- [x] `npm run lint`, `npm run typecheck`, 102 unit tests, and `npm run build` pass.
- [x] Production dependency audit reports no known vulnerabilities.

## Verification Results

| Check | Result |
| --- | --- |
| `git diff --check` | Passed after the final report and issue links |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run test:unit` | Passed: 15 files, 102 tests |
| `npm run build` | Passed: 41 application routes generated |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3200 npm run test:e2e` | Passed: 40 tests |
| Manual Chrome review | 1440×900, 768×1024, 390×844; no reviewed overflow/page errors |
| `npm audit --omit=dev` | Passed: 0 vulnerabilities |
| `supabase test db` | Passed in write-flow shard 1 |
| Write-flow E2E run `31933990213` | **Failed** on `663d7c3`: all 3 shards hit profile/gig insert `42501`; four tests remain skipped |
| Hosted schema comparison | Not run/unavailable; no recorded schema-drift workflow run |
