# Phase 1 security foundation: operator runbook

The branch implements the security model. It does not deploy it. Production retains its original permissions and function until this coordinated release is performed. Do not merge/deploy the frontend alone, and do not run all three migrations as an unattended batch.

## Before production work

1. Follow `security-foundation-recovery.md`. Confirm a usable provider recovery point and save a fresh protected application/catalog snapshot. Compare UUIDs, row fingerprints, schema, policies, and deployed function version with the baseline. No production business records are rewritten by these migrations.
2. Independently verify the existing intended staff user's Auth UUID. Do not infer staff membership from signup, email-domain text, or arbitrary request metadata. The initial migration deliberately refuses a missing identity, an unexpected user count, an unconfirmed/anonymous/deleted account, a public/missing client-files bucket, or unreviewed policies.
3. Prepare an isolated Supabase/staging environment and frontend hosting deployment. Local PostgreSQL tests model Auth claims and Storage metadata; they do not prove the behavior of the hosted Auth, PostgREST, Storage, or Edge gateway. Verify those layers before production cutover.
4. Keep all secret values in the platform's secure configuration UI. Do not paste credentials into a pull request, chat, SQL source, or frontend environment file.

## Configuration names (no values in source)

Frontend hosting must define `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Use the existing project's public configuration. Build-time checks reject missing configuration and privileged key types. `.env.example` lists only the names; `.env.local` is ignored.

Edge Functions use the platform's server-provided `SUPABASE_URL`, public key, and privileged server key. The runtime supports `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS` with the legacy platform-variable fallback. Privileged keys never enter the frontend.

Configure these server-only settings:

| Name | Purpose / requirement |
| --- | --- |
| `ALLOWED_ORIGINS` | Required exact origins of approved frontend deployments, comma separated. No wildcard. Missing configuration fails closed. |
| `RESEND_API_KEY` | Existing email-provider credential, maintained in the server secret store. |
| `BOOKING_RATE_LIMIT_SECRET` | Optional dedicated HMAC secret; otherwise a domain-separated HMAC uses the server key. |
| `BOOKING_CLIENT_IP_HEADER` | Set only after proving that the trusted ingress overwrites this header and callers cannot forge it. If unset, everyone shares the conservative quota. |
| `BOOKING_EMAIL_FROM`, `BOOKING_EMAIL_ADMIN` | Optional deployment overrides for the existing verified NeoEvo sender and internal notification recipient. Never caller supplied. |

The fallback shared client quota is 5 accepted bookings per 15 minutes and 20 per day. A verified per-client header applies those limits per hashed client. Email quotas are 3 per hour / 5 per day; global quotas are 50 per 10 minutes / 500 per day. Confirm these business limits before release. Origin checks are browser restrictions, not authentication. The quotas count accepted bookings, not every invalid request; configure ingress rate limiting/WAF protections against resource exhaustion.

## Release stages, in order

1. **`20260927194212_staff_security_foundation.sql`**: use the approved privileged migration channel. In the *same execution session/batch*, set `neoevo.bootstrap_user_id` to the independently verified Auth UUID before executing the file, then clear the setting. The migration reads it, validates the sole existing user, enrolls that user, changes policies, and commits atomically. The setting is an operator input, never a source-controlled ID. `supabase/operations/bootstrap_staff.sql` documents the guard and recovery-only standalone enrollment block. A generic initial database push without this input must fail. Record the migration version consistently with the source-controlled filename.
2. Verify staff access with the actual staff account. The eight existing application tables retain staff SELECT/INSERT/UPDATE/DELETE. Files retain staff upload, read/signed-link, and delete; no Storage UPDATE feature is added. Nonstaff access is denied. Anonymous booking SELECT/INSERT remains only as temporary compatibility for the old deployed form. This stage is **not** a completed security release.
3. **`20260927194215_public_booking_infrastructure.sql`**: add safe public service/slot RPCs, controlled server-only creation, delivery records, and indexes. Existing duplicate occupied slots abort the migration; never delete or merge them automatically. Check that existing business rows and UUIDs remain identical.
4. Deploy `create-booking` with the checked-in configuration and shared dependencies. The gateway permits public intake; the handler validates its narrow booking payload and invokes only the controlled database RPC. Validate hosted origins, public RPC shapes, staff/anonymous boundaries, and the committed-booking notification contract in staging first.
5. Deploy the new frontend with its public environment configuration. Confirm the served frontend uses `get_public_services`, `get_booking_slots`, and `create-booking`, and never directly reads/inserts bookings. Existing dashboard components retain their table operations under staff RLS.
6. Replace `send-booking-email` with this branch's staff-authorized handler in the coordinated cutover window. The old public form calls the original email contract, so changing this handler before replacing that form can disrupt notifications. Gateway `verify_jwt = false` is intentional in source: the handler verifies the user token through Auth and separately checks staff membership. It accepts only `{booking_id}` and never an arbitrary recipient/body.
7. **`20260927194218_public_booking_cutover.sql`**: revoke the remaining anonymous direct service/availability/booking-table privileges and remove compatibility policies. Verify the active eligible staff guard passes. Old cached public forms will now fail safely and must reload. Finish the cutover promptly; delaying it leaves the original anonymous booking read/insert exposure and, until step 6, the original email relay live.
8. Re-run read-only hosted checks and compare row fingerprints. Verify no unrelated data/schema changed. Record deployment versions and final migration history. Only after hosted validation is Phase 1 complete.

Do not perform a real production booking or send test email without an agreed procedure. Staff CRUD and real provider delivery should first be tested against isolated fixtures and a controlled recipient in staging. The read-only production checks cannot prove a real production write/email transaction.

## Expected final permissions

| Surface | Before | After full cutover |
| --- | --- | --- |
| Eight application tables | Every authenticated user had unconditional ALL policies | Explicit eligible staff membership; separate SELECT, INSERT, UPDATE, DELETE policies |
| Bookings | Anonymous SELECT, INSERT, UPDATE, DELETE | No anonymous direct table privileges; controlled creation through Edge Function |
| Services | Anonymous broad SELECT and UPDATE | Safe getter returns active `id` and `name` only; writes and full rows staff-only |
| Availability | Anonymous full table SELECT | Getter returns only free times for a requested date; full rows staff-only |
| Client files | Any authenticated user could upload/read/delete | Verified staff only; bucket remains private |
| Application table grants | TRUNCATE, REFERENCES, TRIGGER granted broadly | Only required staff/service SELECT, INSERT, UPDATE, DELETE grants; no direct anon grants |
| Staff registry / request / delivery records | Absent | Private technical tables, RLS enabled, no direct application-role access |
| Email function | Caller-controlled recipient/details without authorization | Staff-only retry by committed booking ID; public booking handler sends fixed templates after commit |

The platform's managed Storage table grants are left intact; bucket authorization is enforced with Storage RLS. Staff-created signed URLs remain usable until their short existing expiry, so do not distribute them beyond authorized recipients.

## Delivery recovery

Each booking has independent customer/admin delivery records. A five-minute lease prevents simultaneous senders, a stable provider idempotency key protects retries, and the first claim freezes booking details. Failed deliveries have a 60-second retry cooldown; at most five claims per channel are allowed before manual review. Failed notification delivery does not roll back or duplicate the committed booking. Cancelled/completed bookings are suppressed before a new claim.

Staff can retry using the restricted `send-booking-email` endpoint with only the stored booking ID. There is no automatic scheduler in this phase. After 23 hours from the first attempt, delivery requires manual review because the provider's idempotency window is finite. Reconcile provider acceptance before any manual resend; never reset delivery state blindly. Changed sender/admin configuration can also require reconciliation of a pending retry. The endpoint cannot edit the stored snapshot or choose a new recipient.

## Local verification

Use `npm ci`, then `npm test`, `npm run lint:security`, `npm run check:functions`, and `npm run build` with the public frontend variables set securely. `npm audit` checks current dependency advisories. The test suites do not connect to production or send email.

The database suite runs real PostgreSQL through PGlite with synthetic managed-schema fixtures. It checks roles, permissions, data preservation, validation, slot uniqueness, idempotency, quotas, and notification claims. Frontend and handler tests use mocked boundaries. Repeat the hosted boundary tests in staging before rollout.

The repository-wide `npm run lint` currently reports 11 existing React effect-rule failures in unchanged dashboard pages. Security-scoped lint passes. The production build retains its existing large-bundle warning.

## Manual security follow-up

- Confirm dashboard Auth settings safely: signup controls, allowed redirects, session configuration, and intended providers. The connected inspection tools did not verify these settings.
- Enable leaked-password protection if supported by the project plan, and enroll staff in MFA. No Auth settings or password data were changed by this branch.
- Review the Supabase Postgres security update advisory and plan the managed platform update separately; do not combine it with this booking cutover.
- Establish monitoring/reconciliation for pending notification records and retention for request/delivery records. No deletion schedule is added in this phase.

No CRM tables, pipeline UI, import, MCP, OAuth integration, or Sales Agent permissions are part of this release.
