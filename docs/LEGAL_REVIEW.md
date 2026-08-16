# Legal review record

The `/terms`, `/privacy`, and `/compliance` pages were rewritten on 16 August 2026
from a code-and-configuration inventory of the deployed MVP, for issues #36, #37,
and #38.

This file is the product-side record. It is **not** a lawyer sign-off.

## Inventory the pages were written against

| Claim | Source |
|---|---|
| Email/password + Google sign-in | `src/app/signup`, `src/app/signin`, `src/app/auth/callback` |
| One immutable role | `src/app/onboarding/role`, `20260816000000_lock_first_role_assignment.sql` |
| Musician profile + gig fields | `src/lib/api/types.ts`, create/edit actions |
| No phone, mailing address, or job title | those fields are not in the schema or forms |
| No payments / Stripe | `PRODUCT.md` hard scope; no Stripe dependency |
| No ads or Facebook friends | no ad pixels; Google OAuth requests name/email/photo only |
| Messaging + email notices | `src/lib/api/messaging.ts`, `src/lib/messaging-notifications.ts`, Resend |
| Profile pictures in Supabase Storage | `src/app/account/actions.ts` |
| Location lookup via Geoapify | `src/app/location/actions.ts` |
| Hosting + analytics | Vercel, `@vercel/analytics`, `@vercel/speed-insights` |
| Account deletion | `src/lib/user-deletion.ts` |
| Reports + admin hide/restore | `src/app/reports`, `src/lib/api/admin-dashboard.ts` |
| Support inbox | `src/lib/support-email.ts`, `/help` |

## Product decisions that still need a human owner

- Eligibility is written as 18+, matching the messaging product. Signup does not yet check age.
- Governing law is written as Texas / Travis County, matching the launch markets. Confirm the actual entity.
- `/compliance` is Acceptable Use, not a certification page. Footer and signup use that name; the URL is unchanged.
- Contact is `support@escento.com` and `/help`. There is no public mailing address in the repo.

## Sign-off

- [ ] Product owner has read all three pages against the live product.
- [ ] Counsel (or an owner accepting that risk) has read Terms and Privacy.
- [ ] Date on each page updated if the review changes anything.
