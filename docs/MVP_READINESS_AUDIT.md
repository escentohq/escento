# Escento MVP Readiness Audit

Audit date: August 15, 2026  
Repository: `escentohq/escento` at `4c50c5f`  
Audit mode: planning and verification only; no product behavior was changed

## Executive Summary

Escento is **not ready for an unsupervised pilot**. The main marketplace loop is substantially present: public musician and gig discovery, role-gated profile and gig authoring, connection requests, accepted 1:1 conversations, blocking, reporting, account management, and an admin surface all exist. The signed-out application rendered at desktop and mobile widths without horizontal overflow, and protected routes redirected to sign-in.

The remaining blockers are narrow but consequential. Admin “hide” actions do not remove hidden users, profiles, or gigs from public reads; role assignment can be overwritten after onboarding; several multi-table mutations can leave partial state; gig deadlines and closed-detail behavior do not match the promised lifecycle; and signup requires agreement to Terms and Compliance pages that are still placeholders. A smaller set of P2 issues makes malformed IDs fail as server errors and allows marketplace identities to become public without enough context to be trustworthy.

| Severity | Count |
| --- | ---: |
| P0 | 1 |
| P1 | 5 |
| P2 | 2 |
| P3 | 0 |

The shortest path to a usable pilot is:

1. Make moderation visibility effective at both RLS and service-query boundaries.
2. Make the one-time role invariant enforceable and make critical multi-resource writes failure-safe.
3. Correct gig deadline/closed-detail behavior.
4. Complete the legal documents already required by signup.
5. Reject malformed resource IDs cleanly and require minimum public identity context.
6. Re-run the existing local-Supabase write-flow suite and add focused regression coverage for the corrected invariants.

## Canonical MVP Scope

This audit uses the smallest product that reliably connects real musicians with people seeking musical talent:

- account creation, sign-in/out, session continuity, password recovery, and one-time role onboarding;
- a maintainable musician profile with enough context to evaluate a match;
- public musician and open-gig discovery with the existing keyword, taxonomy, remote, and location filters;
- creator-owned gig creation, editing, closing/reopening, and deletion;
- one coherent connection-request lifecycle that opens an accepted 1:1 conversation;
- persisted direct messaging, unread state, blocking, reporting, and basic operator moderation;
- basic account settings and deletion;
- safe, understandable loading, empty, error, unauthorized, and mobile states.

Payments, escrow, contracts, calendars, reviews, ratings, favorites, feeds, follows, group chat, calls, AI matching, recommendation systems, advanced verification, native apps, subscriptions, and sophisticated analytics are outside this audit.

## Architecture Observed

- Next.js 16 App Router with React 19 and TypeScript. Pages are predominantly Server Components; forms isolate client behavior.
- Supabase Auth, SSR cookie clients, PostgreSQL, RLS, Supabase Storage, and service-role helpers for privileged server-only work.
- Server Actions own product mutations. `getCurrentSession()`, `requireSignedIn()`, `requireUser()`, `requireRole()`, and `requireAdminEmail()` establish page/action authorization.
- Typed-by-convention service modules under `src/lib/api/` wrap Supabase reads and writes. Public directory data is cached with `unstable_cache` and invalidated by tags.
- Connection requests, direct conversations, participants, messages, blocks, and reports are stored in Supabase. Database triggers constrain request transitions, direct participants, message membership, and block behavior.
- Transactional request/message email uses the Resend HTTP API as best-effort delivery. Vercel Analytics and Speed Insights are present.
- Playwright is the only test runner. Read-only smoke tests target public/protected route behavior; mutation flows target an ephemeral local Supabase stack.

### Documentation drift

- `docs/ai-context/userflows/musician-conversation-flow.md` describes a planned gig-specific/realtime model. Live code uses generalized connection requests and non-realtime direct conversations.
- `docs/ai-context/userflows/onboarding-flows.md` still refers to a `user` table and older sync/form architecture. Live code uses `app_user`, a database trigger, and a multi-step profile wizard.
- `CLAUDE.md` contains a stale “No RLS” statement; the baseline migration enables RLS on core tables.
- `PRODUCT.md` says closed gigs remain reachable by link, and the write-flow test asserts that behavior. The live public client/RLS combination denies closed gig detail reads.

Actual code and the baseline migration were treated as the tie-breaker.

## Audit Method and Limits

### Completed

- Read the repository instructions, product/design/UX/architecture/data/component/form docs, agent docs, user-flow docs, package/configuration, schema, auth, middleware, all route/action inventories, core service layers, notifications, messaging, moderation, account deletion, shared UI, environment documentation, and tests.
- Walked signed-out routes in local Chrome at 1440×900 and 390×844, including `/`, `/musicians`, `/gigs`, representative musician/gig details, `/signin`, `/signup`, `/forgot-password`, `/help`, legal pages, protected redirects, invalid resources, and unknown routes.
- Resized core public surfaces through desktop and mobile layouts and checked document-width overflow. No horizontal overflow was observed.
- Inspected form labels, touch surfaces, focus classes, loading/error/not-found files, ownership checks, RLS policies, database triggers, request/message invariants, and cache invalidation paths.
- Ran the signed-out Playwright smoke suite: 22 passed, 1 failed because the test expects a percent-encoded callback while the browser correctly normalizes it to `/signin?callbackUrl=/onboarding/role`. This is a test assertion defect, not a product redirect failure.

### Not safely runtime-tested

- No signup, role selection, profile/gig mutation, request/message exchange, moderation write, report submission, email delivery, OAuth, password-email round trip, storage upload, or account deletion was performed against the configured hosted Supabase project.
- The write-flow suite was not run because the Supabase CLI/local ephemeral stack was unavailable. Its safety guard correctly refuses a hosted Supabase URL. Existing specs were inspected as evidence, not represented as a current passing run.
- Resend delivery, OAuth-provider configuration, password-reset email delivery, Geoapify availability, Supabase Storage policy/configuration, and Vercel environment values were not externally verified.
- Authenticated mobile screens were reviewed statically and through their component layouts, but not with live role sessions.
- The required `ui-ux-pro-max` review skill named in `AGENTS.md` was not available in this Codex session; canonical Escento rules and direct browser inspection were used instead.

## Core Flow Status

| Flow | Status | Severity | Evidence | Related issues |
| --- | --- | --- | --- | --- |
| Signed-out landing and discovery | Functional with caveats | P2 | `/`, `/musicians`, `/gigs`, and representative details rendered at both viewports; filters and empty states are wired; malformed detail IDs error instead of 404 | MVP-07 |
| Account auth and protected redirects | Substantially functional | P1 | Email/Google auth, recovery, session helpers, middleware refresh, and signed-out redirects exist; 22/23 smoke checks passed; role can be overwritten after onboarding | MVP-02; existing #15 |
| New musician onboarding/profile | Incomplete for pilot quality | P2 | Profile creation/edit services and wizard exist, but step one publishes a name-only profile immediately; live directory contains profiles with no bio, skills, or useful context | MVP-03, MVP-08 |
| Creator/hirer discovers and contacts musician | Substantially functional | P2 | Public directory/detail and request control are connected; an unnamed creator can publish/contact without credible identity | MVP-08 |
| Creator publishes/manages gig | Incomplete | P1 | Create/edit/close/reopen/delete and owner guards exist; multi-table writes are non-atomic and deadline/closed-detail behavior is inconsistent | MVP-03, MVP-05 |
| Musician discovers and contacts gig owner | Incomplete | P1 | Directory/detail/contact flow exists; an already-expired open gig remained discoverable and contactable during the audit | MVP-05 |
| Request lifecycle | Code-complete, runtime not re-verified | — | Unique pending pair, actor-specific transitions, acceptance RPC, outgoing/incoming states, cancel/reject, and conversation creation exist; dedicated write specs cover the lifecycle | existing #15 for test gaps |
| Direct messaging | Code-complete, runtime not re-verified | — | Membership RLS, persistence, ordering, unread/read, optimistic send, returnable threads, blocks, and two-way write specs exist | existing #15 for test gaps |
| Notifications | Implemented, external delivery unverified | — | In-app unread conversation/request surfaces and best-effort Resend email for incoming requests/messages exist; delivery configuration was not exercised | No new issue |
| Basic trust and safety | Broken | P0 | Reporting, blocking, admin review, audit log, and hide/restore UI exist, but public reads intentionally ignore moderation flags | MVP-01 |
| Account management/deletion | Incomplete reliability | P1 | Name/photo/password/sign-out/deletion exist; deletion spans many irreversible calls without a recoverable state machine | MVP-04 |
| Legal consent at signup | Broken | P1 | Terms checkbox is required, but Terms and Compliance are placeholder pages; Privacy claims product behavior not present in the current MVP | Existing #10 |
| Mobile core surfaces | Functional in signed-out pass | — | 390×844 screenshots showed no clipping or horizontal overflow on public discovery, details, and auth | Authenticated flows not runtime-verified |

## Findings

### Trust and safety

#### MVP-01 — Admin hide/restore does not control public visibility

- **Severity:** P0 — launch blocker
- **Affected users:** all users and operators
- **Affected surfaces:** `/admin/users`, `/admin/musicians`, `/admin/gigs`, `/`, `/musicians`, `/musicians/[id]`, `/gigs`, `/gigs/[id]`
- **Expected:** hiding a user, musician profile, or gig removes it from anonymous discovery/detail reads; restore reverses that result; cache invalidation makes the change visible promptly.
- **Actual:** `moderateAdminTarget()` writes `is_public=false` and `moderation_status=hidden`, but public profile reads have no visibility filter and profile RLS is `USING (true)`. Public gig reads filter only `status=OPEN`, and gig RLS allows any open row. Account-level hide flags are likewise not joined into public ownership visibility. The admin UI explicitly says hide/restore “writes admin metadata only.”
- **Reproduction:** hide a profile or open gig in admin, invalidate/refresh its directory and detail page, and observe that the public row still qualifies for the same read. This was not executed against hosted data; the service query, RLS policy, and explicit admin TODO establish the behavior without mutation.
- **Evidence:** `src/lib/api/admin-dashboard.ts:207-210`; `src/components/admin/admin-display.tsx:108-114`; `src/lib/api/gigs.ts:162-172`; `src/lib/api/profiles.ts:153-168`; `supabase/migrations/00000000000000_baseline.sql:1301,1406`.
- **Likely cause:** moderation metadata was added without defining/enforcing public visibility semantics in RLS and cached public queries.
- **MVP impact:** operators cannot promptly remove abusive or unsafe public content using the advertised basic moderation control. This makes a real-user pilot unsafe.
- **Proposed fix scope:** define profile-, gig-, and account-level hide semantics; enforce them in RLS and public service queries; preserve owner/admin access where needed; invalidate all affected cache tags; add local-Supabase regression tests.
- **Verification:** a hidden profile/gig/user is absent from anonymous list and detail reads, direct anon Supabase reads fail, owners/admins retain only the intended access, restore returns content, and cached home/directory/detail surfaces update.
- **Issue:** [#23 — Enforce public moderation visibility](https://github.com/escentohq/escento/issues/23) with native sub-issues #25–#26.

### Authentication, roles, and marketplace identity

#### MVP-02 — The one-time role choice is mutable through the Server Action

- **Severity:** P1 — core MVP broken/incomplete
- **Affected users:** musicians and creators
- **Affected surface:** `/onboarding/role`, `setRole()`, all `requireRole()` gates
- **Expected:** the first role choice is durable. A user with an existing role cannot switch identities unless a separately scoped product migration is introduced.
- **Actual:** the page redirects users who already have a role, but `setRole(role)` only requires a signed-in session and then upserts the supplied role. An authenticated caller can invoke the action directly and overwrite their existing role.
- **Reproduction:** with any role-bearing session, invoke the `setRole` action with the other enum value; `app_user.role` is updated and subsequent role guards use the new value. Not executed against hosted data.
- **Evidence:** `src/app/onboarding/role/page.tsx:11-12`; `src/app/onboarding/role/actions.ts:8-20`; `docs/ai-context/PRODUCT.md:14`.
- **Likely cause:** one-time enforcement exists only in page navigation, not at the mutation/database trust boundary.
- **MVP impact:** a user can create contradictory role/resource state and gain the other role's product actions, undermining authorization assumptions and supportability.
- **Proposed fix scope:** reject role changes when a role is already set, enforce the invariant at action and database boundaries, and test direct action invocation plus concurrent first writes.
- **Verification:** a role-less user can choose exactly once; repeat/switch attempts fail without changing state; existing profile/gig ownership remains coherent; route guards continue to work.
- **Issue:** [#24 — Harden onboarding roles and marketplace identity](https://github.com/escentohq/escento/issues/24), specifically #27.

#### MVP-08 — Public marketplace identities can publish without enough trust context

- **Severity:** P2 — required usability/trust issue
- **Affected users:** people evaluating musicians and gigs
- **Affected surfaces:** signup, profile wizard/directory/detail, gig creation/detail
- **Expected:** public listings identify who is offering or requesting work with a minimal, useful identity. This does not require verification, ratings, or completion scoring.
- **Actual:** signup displays but does not validate `name`. A creator can therefore post a gig rendered as `Unknown creator`. On the musician side, step one creates and publicly lists a profile from display name alone, while bio, instruments, genres, location, availability, and work preferences remain optional later steps. The rendered directory contained multiple profiles with “No bio yet” and no skills.
- **Reproduction:** submit signup with an empty name, choose Creator, publish a valid gig; or choose Musician, submit only the identity step, and return to `/musicians`.
- **Evidence:** `src/app/signup/actions.ts:22-53,69-86`; `src/app/gigs/[id]/page.tsx:117-120`; `src/app/profile/create/identity/actions.ts:13-44`; `src/lib/profile-validation.ts:20-31`; desktop/mobile directory screenshots captured during this audit.
- **Likely cause:** the low-friction onboarding optimization equated “row exists” with “ready for public discovery,” and creator identity remained an optional signup field.
- **MVP impact:** recipients cannot reliably judge who is contacting/hiring them, and public search inventory includes entries too incomplete to evaluate, increasing abandonment and low-quality outreach.
- **Proposed fix scope:** define a small publishability threshold using fields already in the model; keep drafts/partial wizard progress owner-visible but out of public discovery until threshold completion; require a usable creator-facing name before publishing/contacting.
- **Verification:** incomplete drafts remain resumable but anonymous users cannot discover them; a minimally complete profile is discoverable; a creator cannot publish with an empty identity; OAuth users missing a name get a clear completion path.
- **Issue:** [#24 — Harden onboarding roles and marketplace identity](https://github.com/escentohq/escento/issues/24), specifically #28–#29.

### Data integrity and mutation reliability

#### MVP-03 — Profile and gig writes can commit partial marketplace state

- **Severity:** P1 — core MVP reliability/data integrity
- **Affected users:** musicians and creators
- **Affected services:** `createProfile`, `updateProfile`, `createGig`, `updateGig`
- **Expected:** saving a profile/gig and its instrument/genre relationships succeeds as one logical operation or leaves the previous state intact.
- **Actual:** create writes the root row before inserting junction rows. Update deletes all existing junctions before updating the root and reinserting replacements. Any later error leaves a published root with partial/no taxonomy or strips a previously valid listing while the UI reports failure.
- **Reproduction:** force a junction insert failure after the root insert, or after update deletes; then inspect the root and relationships. Not injected against hosted data.
- **Evidence:** `src/lib/api/gigs.ts:285-338,400-437`; `src/lib/api/profiles.ts:280-339,414-455`.
- **Likely cause:** a multi-table logical write is assembled from independent PostgREST calls instead of a database transaction/RPC.
- **MVP impact:** normal transient/schema/constraint failures can publish unintended gig state or silently damage discoverability fields. Retrying may not reproduce the user's original intent.
- **Proposed fix scope:** transactional database functions or another schema-backed atomic mechanism for profile/gig root plus taxonomy replacement; return typed failures; invalidate caches only after commit.
- **Verification:** injected failure leaves no new root on create and preserves all old root/tag values on update; successful create/edit still appears immediately in public discovery.
- **Issue:** [#21 — Make critical marketplace writes failure-safe](https://github.com/escentohq/escento/issues/21), specifically #30–#31.

#### MVP-04 — Account deletion can fail after irreversibly deleting only part of an account

- **Severity:** P1 — core MVP reliability/data integrity
- **Affected users:** users deleting accounts and their conversation counterparts
- **Affected service:** `deleteUserCompletely()` / `/account`
- **Expected:** deletion either completes, or records a recoverable/retriable deletion state with truthful user feedback and no contradictory surviving identity.
- **Actual:** the service performs multiple batches of irreversible database deletes, then storage cleanup, then Auth deletion. Errors are checked between stages, but prior successful deletes are not rolled back. Auth deletion can fail after `app_user` and product data are gone, causing the action to report failure while much of the account has already been erased.
- **Reproduction:** inject an error in a later delete stage, storage, or `auth.admin.deleteUser()` and inspect earlier resources. Not executed against hosted data.
- **Evidence:** `src/lib/user-deletion.ts:5-108`; `src/app/account/actions.ts:51-74`.
- **Likely cause:** cross-database/Auth/Storage deletion has no idempotent state machine, transaction boundary, or compensating strategy.
- **MVP impact:** deletion is part of current account/legal commitments; partial failure can mislead users and leave an auth identity inconsistent with product records.
- **Proposed fix scope:** make database cleanup transactional/idempotent, establish an explicit ordering/retry state for Auth and Storage, and make repeated deletion safe. Do not add a settings suite or retention product.
- **Verification:** failure injection at each stage produces a documented recoverable state; retries converge; successful deletion removes auth, public content, private participation, and stored image; UI never claims a clean failure after destructive partial completion.
- **Issue:** [#21 — Make critical marketplace writes failure-safe](https://github.com/escentohq/escento/issues/21), specifically #32.

### Gig lifecycle

#### MVP-05 — Deadline and closed-gig behavior contradict the promised lifecycle

- **Severity:** P1 — core gig workflow incomplete
- **Affected users:** creators managing listings and musicians browsing/responding
- **Affected surfaces:** `/gigs`, `/gigs/[id]`, `/gigs/manage`, gig create/edit, public gig RLS
- **Expected:** past deadlines cannot remain actionable open calls; closing removes a gig from discovery but preserves an understandable linked “filled” detail state without a contact action, as documented and asserted by the existing lifecycle spec.
- **Actual:** create/edit only validate that a deadline parses, not that it is current/future. Public queries filter only `status=OPEN`. On August 15, 2026, `/gigs` displayed an open gig with deadline August 14, 2026 and its detail still offered contact. Conversely, closed gigs are denied by the anonymous public client/RLS, even to the detail route; this conflicts with `PRODUCT.md` and `e2e/flows/gig-lifecycle.spec.ts`, which expects a linked closed detail to show `Filled`.
- **Reproduction:** create or retain an open gig with a past deadline and browse/contact it; close a gig, then request `/gigs/{id}` as anonymous or owner through the public detail service.
- **Evidence:** runtime browse/detail on August 15; `src/app/gigs/create/actions.ts:34-45`; `src/lib/api/gigs.ts:111-130,162-172`; `src/app/gigs/[id]/page.tsx:11-26,39-42,111-124`; `supabase/migrations/00000000000000_baseline.sql:1301`; `docs/ai-context/PRODUCT.md:53-56`; `e2e/flows/gig-lifecycle.spec.ts:28-62`.
- **Likely cause:** deadline is treated as display metadata, while public detail caching uses an anonymous client whose RLS policy was optimized for open-directory visibility rather than detail history.
- **MVP impact:** musicians can spend effort on expired work, while creators and recipients lose the promised stable link after closing a call. The current lifecycle test should fail against the live architecture.
- **Proposed fix scope:** define deadline semantics, reject/prompt on past dates, exclude/disable expired calls, separate public detail visibility from open-directory eligibility, and suppress contact for non-open/expired calls.
- **Verification:** past deadlines cannot be newly published; expired existing gigs are non-actionable and absent from open browsing; closed gigs remain linked as filled but cannot receive a gig-context request; reopen restores discovery; tests cover anonymous and owner views.
- **Issue:** [#22 — Correct gig and resource lifecycle behavior](https://github.com/escentohq/escento/issues/22), specifically #33–#34.

### Legal consent

#### MVP-06 — Signup requires agreement to incomplete/inaccurate legal documents

- **Severity:** P1 — pilot launch requirement
- **Affected users:** every new account
- **Affected surfaces:** `/signup`, `/terms`, `/privacy`, `/compliance`
- **Expected:** the required checkbox links to real, current documents describing the actual MVP and its data flows.
- **Actual:** Terms says it is “being prepared”; Compliance is also a placeholder. Privacy claims phone/mailing/job-title collection, Stripe payments, orders, advertising/targeting, Facebook/social-friends access, and other behavior not present in the current MVP, while current messaging/email/storage/analytics disclosures need verification.
- **Reproduction:** open the three required signup links before checking the agreement box.
- **Evidence:** `src/app/signup/_signup-form.tsx`; `src/app/terms/page.tsx`; `src/app/compliance/page.tsx`; `src/app/privacy/page.tsx`.
- **Likely cause:** legal copy predates the current product boundary and was never reconciled after Supabase/messaging/email changes.
- **MVP impact:** pilot users are asked to consent to missing and materially mismatched documents.
- **Proposed fix scope:** complete Terms, decide and complete/remove Compliance consistently, and revise Privacy to actual data flows. Legal review remains a human responsibility.
- **Verification:** all signup links resolve to substantive current text; no placeholder remains; product/provider claims match actual code/configuration; dates are current.
- **Existing issue:** [#10 — Finish Terms of Use and Compliance pages](https://github.com/escentohq/escento/issues/10).

### Resource and error states

#### MVP-07 — Malformed musician/gig IDs produce server errors instead of not-found states

- **Severity:** P2 — required reliability/usability
- **Affected users:** anyone following malformed/stale links
- **Affected surfaces:** `/musicians/[id]`, `/gigs/[id]`
- **Expected:** any invalid or missing resource identifier renders the branded 404 without a database error.
- **Actual:** `isValidId()` checks only string length. Values such as `not-a-real-id` reach UUID comparisons, Supabase returns `22P02`, and the page enters its error boundary. A wholly unknown route correctly returns the branded 404.
- **Reproduction:** visit `/musicians/not-a-real-id` or `/gigs/not-a-real-id` in local dev and inspect the console/error boundary.
- **Evidence:** browser runtime; `src/app/musicians/[id]/page.tsx:12-28`; `src/app/gigs/[id]/page.tsx:11-26`.
- **Likely cause:** route validation does not match the UUID schema.
- **MVP impact:** common malformed links fail as system errors rather than safely and understandably.
- **Proposed fix scope:** central UUID validation at route/service boundaries and not-found handling for malformed/missing records; do not expose database error details.
- **Verification:** malformed and valid-but-missing UUIDs return the branded 404 in dev/production with no uncaught page/console error; valid resources still render.
- **Issue:** [#22 — Correct gig and resource lifecycle behavior](https://github.com/escentohq/escento/issues/22), specifically #35.

## Security and Authorization Findings

- **P0:** moderation visibility is not enforced by RLS or service queries (MVP-01).
- **P1:** the one-time role invariant is not enforced at the Server Action/database boundary (MVP-02).
- Ownership protection for creator gig edit/close/reopen/delete is present in Server Actions and reinforced by RLS.
- Profile writes obtain the current user's profile and rely on owner RLS.
- Message/request actions require a role-bearing session. RLS and database triggers enforce participant visibility, sender membership, duplicate pending-pair prevention, actor-specific request transitions, direct participant limits, and block behavior.
- Public profile selection deliberately excludes `contact_email`. Creator summaries expose name but not email.
- Admin routes/actions use an email allowlist and server-only admin client. Runtime coverage for every admin route/action remains an existing CI gap covered by #15.
- No evidence was found that one user can read another user's messages or mutate another creator's gig through supported actions.

## Data Integrity Findings

- Role mutation can create contradictory role/resource state (MVP-02).
- Profile/gig root and taxonomy writes are not atomic (MVP-03).
- Account deletion is not failure-atomic or explicitly recoverable (MVP-04).
- Deadline and closed status have inconsistent visibility/action semantics (MVP-05).
- Request/message database constraints are comparatively strong: unique pending pairs, valid actor transitions, accepted-request conversation RPC, foreign keys, body limits, and block checks are present.

## Mobile Findings

No launch-blocking mobile defect was found in the signed-out pass at 390×844:

- landing, directory, detail, auth, password recovery, footer, and protected redirects had no horizontal document overflow;
- directory rows stack into readable touch targets and filters remain reachable;
- auth fields and buttons remain full width with bound labels;
- public detail sidebars stack beneath content.

Authenticated onboarding forms, gig/profile editors, request lists, conversation threads, block/report dialogs, and account deletion were not runtime-walked without a safe local role dataset. Their responsive classes and existing desktop Playwright locators were inspected, but this does not replace a live mobile role-flow pass after P0/P1 fixes.

## Reliability and Error-State Findings

- Invalid dynamic IDs do not fail safely (MVP-07).
- Major async areas include loading/error states, and conversation detail has its own not-found surface.
- Empty directory, request, conversation, blocked-user, and management states exist.
- Public-service cache invalidation is called after profile/gig/admin mutations, but moderation invalidation cannot compensate for queries that ignore visibility flags.
- Transactional email intentionally fails best-effort so messaging persistence is not rolled back. Actual Resend configuration/delivery was not verified.
- The read-only smoke suite currently has one false failure due solely to URL-encoding expectation. Existing issue #15 already covers making tests and CI trustworthy; no duplicate MVP issue was created.

## Verification Results

| Check | Result |
| --- | --- |
| `git diff --check` | Passed |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; 38 static/dynamic application routes generated |
| `npx playwright test e2e/smoke.spec.ts --project=chromium` | 22 passed, 1 failed due to percent-encoding-only URL expectation; redirect behavior itself was correct |
| Local-Supabase write-flow suite | Not run: Supabase CLI/ephemeral stack unavailable; hosted-data safety guard must not be bypassed |

Repository changes from this audit are limited to this report. GitHub issue writes are listed below; no application source, schema, settings, milestones, or unrelated issues were changed.

## Existing Issues That Already Cover Findings

- [#10 — Finish Terms of Use and Compliance pages](https://github.com/escentohq/escento/issues/10): directly covers MVP-06 and already calls for Privacy reconciliation.
- [#15 — CI hardening: make green mean green](https://github.com/escentohq/escento/issues/15): covers local-Supabase write-flow coverage gaps, schema drift, admin/auth/storage/email-related blind spots, and false confidence in CI. It should include/follow the focused regression tests from new implementation issues, not be duplicated.
- [#9 — Cut click latency](https://github.com/escentohq/escento/issues/9): much of its static shell/cache/image scope is now present in source. No remaining performance problem severe enough to create an additional MVP ticket was demonstrated.
- [#4, #5, #17](https://github.com/escentohq/escento/issues): visual/landing work is outside this functional audit and was not duplicated.

## GitHub Issue Hierarchy Created

GitHub's native parent/sub-issue API was available and used for every child below.

- [#23 — Enforce public moderation visibility](https://github.com/escentohq/escento/issues/23)
  - [#25 — Enforce hide/restore across public RLS and cached reads](https://github.com/escentohq/escento/issues/25)
  - [#26 — Add moderation visibility regression coverage](https://github.com/escentohq/escento/issues/26)
- [#24 — Harden onboarding roles and marketplace identity](https://github.com/escentohq/escento/issues/24)
  - [#27 — Make first role assignment immutable](https://github.com/escentohq/escento/issues/27)
  - [#28 — Keep incomplete musician profiles out of public discovery](https://github.com/escentohq/escento/issues/28)
  - [#29 — Require creator-facing identity before marketplace actions](https://github.com/escentohq/escento/issues/29)
- [#21 — Make critical marketplace writes failure-safe](https://github.com/escentohq/escento/issues/21)
  - [#30 — Make profile and taxonomy writes atomic](https://github.com/escentohq/escento/issues/30)
  - [#31 — Make gig and taxonomy writes atomic](https://github.com/escentohq/escento/issues/31)
  - [#32 — Make account deletion idempotent and recoverable](https://github.com/escentohq/escento/issues/32)
- [#22 — Correct gig and resource lifecycle behavior](https://github.com/escentohq/escento/issues/22)
  - [#33 — Enforce gig deadline semantics](https://github.com/escentohq/escento/issues/33)
  - [#34 — Preserve a non-actionable Filled detail for closed gigs](https://github.com/escentohq/escento/issues/34)
  - [#35 — Return 404 for malformed profile and gig IDs](https://github.com/escentohq/escento/issues/35)
- Existing parent [#10 — Finish Terms of Use and Compliance pages](https://github.com/escentohq/escento/issues/10)
  - [#36 — Replace the Terms placeholder with reviewed current terms](https://github.com/escentohq/escento/issues/36)
  - [#37 — Reconcile Privacy with actual MVP data flows](https://github.com/escentohq/escento/issues/37)
  - [#38 — Resolve the Compliance placeholder and consent link](https://github.com/escentohq/escento/issues/38)

## Observed Constraints That Are Not Launch Findings

- Directories filter the cached full dataset and then return at most 50 results. Search can still reach older matching data, but default browse has no pagination. Current inventory is far below that limit; revisit only before the pilot exceeds it.
- Messaging is not realtime. Persisted send/refresh/return behavior is sufficient for this MVP.
- Connection requests are generalized rather than a separate application object. The gig title is included in the intro and the accepted request opens a conversation; a separate application system is unnecessary.
- Transactional email has no preferences/digest/push/SMS layer. Those are not required.

## Out of Scope / Rejected Suggestions

No issues were created for:

- payments, escrow, invoicing, contracts, insurance, or dispute infrastructure;
- scheduling/calendar booking;
- ratings, reviews, endorsements, trust scores, or identity verification;
- favorites, saved profiles, completion scores, response metrics, or popularity counts;
- AI matching/recommendations, feeds, follows, or ranking;
- group chat, realtime presence, attachments, voice/video calls, SMS, push, or notification digests;
- native apps, subscriptions, monetization, or advanced analytics;
- advanced portfolio hosting or media processing;
- dual-role/view switching (#6), Microsoft OAuth (#1), AI recommendations (#2), outreach (#14), or further visual redesign.

## Recommended Execution Order

1. **MVP-01:** enforce moderation visibility and verify cache/RLS behavior.
2. **MVP-02:** lock role assignment at mutation/database boundaries.
3. **MVP-03 and MVP-04:** make profile/gig mutations and deletion failure-safe.
4. **MVP-05:** align deadlines, closed detail, directory visibility, and contact actions.
5. **MVP-06 / #10:** complete the documents required by signup before recruiting pilot users.
6. **MVP-08:** gate public marketplace readiness on minimal existing identity fields.
7. **MVP-07:** make malformed/stale dynamic links safe.
8. Run the complete ephemeral-Supabase role suite on desktop and 390×844, then perform a supervised two-account pilot rehearsal.

## Launch Checklist

- [ ] Hidden users/profiles/gigs are absent from anonymous directories and details; restore works.
- [ ] A role can be assigned once and cannot be changed through direct action/database access.
- [ ] Profile and gig create/edit failure injection leaves no partial public state.
- [ ] Account deletion is idempotent/recoverable and verified across DB, Auth, Storage, public cache, requests, and conversations.
- [ ] Past-deadline gigs cannot remain open/actionable.
- [ ] Closed gigs are absent from open discovery, linked as filled where promised, and cannot receive gig-context outreach.
- [ ] Terms and Compliance are substantive (or Compliance is consistently removed), and Privacy matches actual MVP data flows.
- [ ] Public musician and creator identities meet the small documented publishability threshold.
- [ ] Malformed and missing profile/gig IDs render a 404 without database errors.
- [ ] Email/password signup, Google OAuth, sign-in/out, refresh, expiry recovery, and password reset are rehearsed in a safe environment.
- [ ] Musician creates/edits a discoverable profile; creator creates/edits/closes/reopens/deletes a discoverable gig.
- [ ] Both directions of request, accept/reject/cancel, two-way messaging, unread/read, return-to-thread, block/unblock, and report are rehearsed with two test accounts.
- [ ] Admin receives a report, hides/restores content, audits the action, and deletes an abusive test account safely.
- [ ] Request/message email links are delivered from the deployed environment and land on the intended authenticated state.
- [ ] Desktop and 390×844 authenticated core flows complete without clipping, dead ends, or inaccessible controls.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build`, signed-out smoke, and the local-Supabase write-flow suite pass.
