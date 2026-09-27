# Phase 1 recovery baseline and release gates

This plan was established before changing the application security model. Production has not been modified by this implementation work.

## Verified baseline (2026-09-27)

- Repository: Juan-Chica/neoevo.io-app; baseline commit `e54005691d06a8713ddab4ca9887cbb9612a320d`.
- Supabase: the active NeoEvo project, matched to the repository's existing public project reference. Never copy credentials into this document.
- Existing public tables: availability (7 rows), bookings (0), files (0), notes (0), projects (2), services (4), settings (1), tasks (1). All have UUID primary keys and RLS enabled.
- Existing relationship: bookings.service_id references services.id. Project service names and email references are text, not foreign keys. Preserve their values and existing UUIDs.
- Auth: one confirmed, nonanonymous user. Enrollment must explicitly verify the intended staff identity; never automatically enroll new signups or promote all authenticated users.
- Storage: private client-files bucket, no objects at inspection time.
- Function: send-booking-email, deployed version 1, gateway JWT verification disabled. Its existing handler accepts caller-supplied email details without authorization.
- No application migrations were recorded in the live migration history.

## Recovery material

Keep a protected, untracked export of the eight application tables and catalog metadata, including columns/defaults, constraints, indexes, grants, and RLS policies. Record counts and row fingerprints before and after each production stage. Do not include Auth credentials, tokens, provider secrets, or environment values in reports or source control.

`baseline/schema.sql` represents the audited starting structure and permissions for local verification; it omits business/contact literal defaults and is not a migration to run over production. The protected catalog snapshot retains the exact defaults. Repository history preserves the original frontend and function source. Store a separate deployment/configuration inventory with the recovery material.

An application-table export is not a complete Supabase disaster recovery backup. Before production rollout, confirm the provider backup/restore point and coverage for Auth, Storage metadata and object contents, database roles/extensions, and project configuration. The connected tools do not verify complete provider restore coverage or expose a safe Auth-configuration export. Secure any necessary backups through the Supabase dashboard without pasting credentials into chat.

## Non-destructive rollout

1. Validate the audited baseline against the current live catalog and row counts. Stop on unexpected schema changes, duplicate active booking slots, missing backup coverage, or ambiguous staff identity.
2. Test the three migrations, role matrix, frontend, and notification handlers against an isolated database. Preserve existing business rows exactly; do not rewrite UUIDs, business fields, or existing relationships.
3. Explicitly enroll the verified existing staff identity in the same transaction that activates staff policies. The guarded operator script must not silently enroll future users.
4. Apply the staff foundation and additive booking infrastructure only after recovery and staff-access verification are ready. Verify dashboard operations with that staff account. Anonymous booking reads/inserts remain temporarily available for the old frontend until cutover; this is a documented transitional exposure, not a completed security release.
5. Configure server-only function settings and frontend public settings in their hosting platforms. Stage the controlled booking endpoint and new frontend together. Verify origin handling, public service/slot reads, and the intended booking flow in an isolated environment.
6. Coordinate production cutover: deploy the replacement frontend and function, verify the served version, then apply the final anonymous-access revocation. Cached older clients must reload; never claim old bundles can continue after their direct booking access is revoked.
7. Validate anonymous/nonstaff denial, authorized staff access, catalog/slot reads, storage denial, and function authentication using checks that do not create customer bookings or send real email. A real production booking/email smoke test requires a separately agreed test procedure.

## Recovery decisions

- Every migration is transactional. Precondition failure must roll back its whole stage.
- Do not restore by truncating or overwriting production tables. If rollback becomes necessary, first retain every booking and notification record created since rollout and diagnose the failing component.
- Prefer a corrected frontend/function or narrowly scoped forward migration. Re-enabling anonymous booking reads or arbitrary email sends would restore vulnerabilities and is not an acceptable routine rollback.
- Before final cutover, a frontend rollback is possible while temporary compatibility policies remain. After final cutover, the old frontend requires an insecure database interface and cannot safely be restored alone.
- If the verified deployment/backup prerequisites cannot be met, stop before production changes and leave the tested branch and operator runbook for review. Do not run final cutover merely because source checks passed.

## Scope boundary

This phase introduces staff membership and booking-delivery technical records only. It does not create CRM entities, import leads, add a pipeline, expose MCP/OAuth, or enable Sales Agent access.
