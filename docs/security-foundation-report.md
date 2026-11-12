# NeoEvo Phase 1 implementation report

Date: 2026-09-27. Branch: `codex/neoevo-security-foundation`.

**Implementation and local validation are complete. Production rollout is stopped at the booking-safety gate. No live migration, configuration change, function deployment, production booking, or email send was performed. NeoEvo is not yet ready for Phase 2.**

The existing deployed form reads and inserts bookings directly and invokes the old email contract. Revoking those permissions or replacing the email handler while that form is still served can break booking/notification behavior. This is the realistic production risk the user instructed us to stop before. The release needs a verified staff identity, recovery coverage, hosting configuration, staging validation, and a coordinated frontend/function/database cutover.

## Exactly what changed in the branch

- Added private, explicit staff membership. A confirmed, nonanonymous, nondeleted Auth user must be enrolled by an operator; ordinary signups receive no staff rights. Initial enrollment and policy activation commit together and require the independently verified existing user's UUID.
- Replaced unconditional authenticated permissions with separate staff SELECT, INSERT, UPDATE, and DELETE policies on availability, bookings, files, notes, projects, services, settings, and tasks. Removed unnecessary application-table TRUNCATE, REFERENCES, and TRIGGER grants.
- Removed anonymous booking UPDATE/DELETE and service UPDATE in the first stage. Final cutover also removes anonymous direct table reads/inserts. Compatibility booking SELECT/INSERT exists only between stages for the old frontend.
- Public service lookup returns only active service IDs/names. Availability lookup returns only free appointment times, with no booking/customer rows.
- Added controlled public booking creation through an Edge Function and a server-only database RPC. Strict fields, real-date/slot/service checks, a 90-day horizon, unique occupied slots, atomic quotas, and idempotency prevent arbitrary record creation and duplicate retries. Existing fixed 30-minute consultations and Eastern Time are retained.
- Replaced public-form database operations with those narrow interfaces. Failed availability checks fail closed; retries reuse the request ID; email failure does not encourage duplicate booking creation. Removed logging of booking records.
- Hardened email delivery: committed booking details, fixed templates, escaped content, independent customer/admin delivery records, stable provider idempotency keys, leases, cooldowns, attempt caps, and manual review of ambiguous retries. The existing email endpoint now accepts only a booking ID from verified staff.
- Restricted client-files upload, read/signed links, and delete to staff. The bucket remains private; no Storage UPDATE permission is introduced.
- ProtectedRoute verifies the live Auth user and staff membership, responds to session changes, rejects stale checks, and denies access on verification errors. Login handles failures without exposing provider errors.
- Replaced hardcoded frontend Supabase configuration with public environment variables and validation that rejects privileged keys. No privileged credentials were added to source.
- Added recovery/rollout documentation, a structural local baseline, migration guards, tests, and locked dependencies. Compatible dependency fixes reduce the npm audit result from eight findings to zero at verification time.

Only three private technical tables are introduced: staff_members, booking_requests, and notification_delivery. No existing public business columns, UUIDs, or relationships are rewritten. No CRM entities, pipeline UI, lead import, MCP, OAuth, or Sales Agent access are added.

## Migrations created

| File | Purpose |
| --- | --- |
| `20260927194212_staff_security_foundation.sql` | Explicit atomic staff bootstrap; eight-table staff RLS; staff Storage policies; removal of destructive anonymous access and excess grants; temporary legacy reads/inserts |
| `20260927194215_public_booking_infrastructure.sql` | Public safe getters; server-only booking/notification RPCs; private request/delivery records; unique occupied-slot and supporting indexes |
| `20260927194218_public_booking_cutover.sql` | Remove temporary anonymous table access after frontend/function rollout; verify eligible staff, private Storage, RLS, and no public policies |

All are transactional. Unexpected policies, an unsafe bucket, an invalid staff identity, existing slot conflicts, or disabled RLS at cutover abort the relevant stage. No migration deletes or overwrites existing business records.

## Policy comparison

These are **implemented final-state policies**, not claims that production has changed.

| Area | Audited production before rollout | Implemented final state |
| --- | --- | --- |
| All eight application tables | Authenticated ALL using/check true | `staff_read`, `staff_insert`, `staff_update`, `staff_delete`, checked against current eligible membership |
| Bookings | Anonymous SELECT/INSERT/UPDATE/DELETE | No anonymous table access; narrow Edge creation flow |
| Services | Anonymous SELECT all rows plus UPDATE; overlapping active filter ineffective | Public active ID/name RPC only; staff CRUD on full table |
| Availability | Anonymous SELECT full rows | Public free-time RPC only; staff CRUD on full table |
| Private technical tables | Absent | RLS enabled; no direct anon/authenticated/service-role table access; narrow definer RPCs where needed |
| Storage objects in client-files | Any authenticated account upload/read/delete | `neoevo_staff_file_read`, `neoevo_staff_file_insert`, `neoevo_staff_file_delete` |
| Email | Deployed handler permits caller-supplied recipient/details without user verification | Staff-authorized retry, or fixed booking receipt after controlled creation |

Managed Storage table grants were not changed. Their object authorization remains RLS-based. The source keeps Edge gateway JWT verification disabled deliberately: public intake must be public, while the retry handler verifies Auth and staff membership itself. No deployed flag or handler was changed.

## Validation performed

**52 tests pass:** 19 real PostgreSQL/PGlite tests, 17 Edge-handler tests, 16 frontend tests.

| Required behavior | Evidence |
| --- | --- |
| Anonymous cannot read/update/delete existing bookings | Database role tests after all migrations |
| Anonymous cannot modify services or access administrative tables | SELECT/INSERT/UPDATE/DELETE checks across all eight tables |
| Authenticated nonstaff cannot access dashboard data | Database role tests plus ProtectedRoute tests |
| Staff retain existing dashboard operations | CRUD on all eight tables; booking/service join; Storage upload/read/delete |
| Public service/availability remains usable | Exact active ID/name result shape; future free slots; unavailable/past/invalid slots excluded |
| Legitimate public booking succeeds through intended flow | Frontend calls narrow endpoint; handler validates/commits; PostgreSQL creates pending booking with uniqueness, idempotency, and quota assertions |
| Notification cannot act as an arbitrary relay | Anonymous/nonstaff denied; recipient/content overrides rejected; committed snapshot and fixed templates asserted; no email after failed commit |
| Existing data survives migration | Exact synthetic row comparisons across all eight tables, including preflight rollback cases |
| Security configuration drift stops rollout | Bootstrap, unknown-policy, bucket privacy, duplicate slot, and all-nine-table RLS guards |

Additional checks: production build passed; security-scoped ESLint passed; both Edge entrypoints passed frozen Deno checks; whitespace checks passed; npm audit reported zero vulnerabilities after compatible fixes. No test sent real email or used production writes.

The draft PR's **Vercel preview failed**. Read-only build-log inspection confirmed the build-time error: missing public Supabase configuration. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` securely for the appropriate hosting environments before release, then rebuild the preview against the staged backend. Local build validation used the existing public configuration in an ignored file. No hosting settings were changed, and no environment values are included here.

The repository-wide lint command reports **11 pre-existing React effect-rule errors in unchanged dashboard pages**. The production build retains a large-bundle warning. These were not expanded into unrelated dashboard refactors.

Tests use a real embedded PostgreSQL engine with synthetic Auth/Storage fixtures and mocked frontend/provider boundaries. They do not replace staging tests of hosted Auth, PostgREST, Storage, Edge routing, actual concurrent HTTP requests, or real provider delivery.

## Production preservation check

A protected, untracked local export of the eight business tables and catalog/policy/grant metadata was saved before implementation, along with fingerprints and a function inventory. Its contents are excluded from source control and were not printed. A final read-only comparison found every row unchanged:

| Table | Rows | Comparison |
| --- | ---: | --- |
| availability | 7 | Unchanged |
| bookings | 0 | Unchanged |
| files | 0 | Unchanged |
| notes | 0 | Unchanged |
| projects | 2 | Unchanged |
| services | 4 | Unchanged |
| settings | 1 | Unchanged |
| tasks | 1 | Unchanged |

The live email function remains version 1. The application export is not a complete Auth/Storage/provider recovery backup; that coverage must be confirmed before production release.

## Exact files changed

Modified existing files:

- `.gitignore`
- `eslint.config.js`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `src/Components/ProtectedRoute.jsx`
- `src/Components/booking/BookingForm.jsx`
- `src/lib/supabaseClient.js`
- `src/pages/Login.jsx`
- `supabase/config.toml`
- `supabase/functions/send-booking-email/deno.json`
- `supabase/functions/send-booking-email/index.ts`

New source-controlled files:

- `.env.example`
- `baseline/schema.sql`
- `docs/security-foundation-recovery.md`
- `docs/security-foundation-rollout.md`
- `docs/security-foundation-report.md`
- `src/lib/publicConfig.js`
- `supabase/functions/_shared/auth.js`
- `supabase/functions/_shared/handlers.js`
- `supabase/functions/_shared/http.js`
- `supabase/functions/_shared/notifications.js`
- `supabase/functions/_shared/runtime.ts`
- `supabase/functions/create-booking/deno.json`
- `supabase/functions/create-booking/index.ts`
- `supabase/functions/deno.lock`
- `supabase/migrations/20260927194212_staff_security_foundation.sql`
- `supabase/migrations/20260927194215_public_booking_infrastructure.sql`
- `supabase/migrations/20260927194218_public_booking_cutover.sql`
- `supabase/operations/bootstrap_staff.sql`
- `tests/database/fixture.sql`
- `tests/database/security.sql`
- `tests/database/security.test.mjs`
- `tests/frontend/access.test.jsx`
- `tests/frontend/booking.test.jsx`
- `tests/frontend/config.test.js`
- `tests/security-functions.test.js`
- `vitest.config.js`

Local-only, untracked material: protected recovery snapshot/manifest/function inventory, public `.env.local` build configuration, dependencies, and build output. No synced project source files were changed.

## Remaining manual work and security concerns

The exact procedure is in [the rollout runbook](security-foundation-rollout.md), with [recovery prerequisites](security-foundation-recovery.md).

Before release: confirm the staff identity and provider recovery point; configure public frontend variables and server-only function settings in their secure platform UIs; validate trusted ingress/IP behavior and request throttling; approve the 90-day booking horizon and quotas; validate staging; coordinate the three migrations with frontend/function deployment. The staff UUID is a same-session operator parameter, never a committed identifier. Do not use an unattended initial database push.

Review Auth signup/redirect/provider/session settings, enable leaked-password protection if available, and enroll staff MFA. Those live settings were not changed, and complete Auth configuration was not verifiable through the available inspection tools. Plan the managed Postgres security update separately.

CORS does not authenticate non-browser callers. Booking quotas meter successful bookings; they do not prevent every abusive invalid request. Without a verified ingress IP header, users share the conservative quota. Delivery needs operational monitoring and manual reconciliation after repeated failures or the retry window; no automatic scheduler is included.

**Phase 2 readiness: no.** The code is prepared and locally tested, but the original production exposures remain until the coordinated security release and hosted validation are complete. Stop here for review and approval; do not add CRM or agent access.
