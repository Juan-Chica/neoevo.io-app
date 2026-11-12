-- OPERATOR-ONLY, explicit bootstrap guard reference/recovery operation.
-- Migration 1 embeds this same guard, so initial enrollment and policy changes are
-- atomic. For initial rollout, set neoevo.bootstrap_user_id using set_config(...,
-- false) in the SAME session before applying migration 1, then clear that setting.
-- Never run an unparameterized generic db-push for the initial rollout.
-- This standalone block may be used only after separately reviewing why the
-- registry is empty; it refuses to change a nonempty registry.
-- Run inside a transaction after setting neoevo.bootstrap_user_id locally to the
-- UUID independently verified in Auth. Do not use an email from a request.
-- Example invocation pattern (replace the placeholder only in the operator's
-- SQL session, never commit an account identifier):
-- BEGIN;
-- SELECT set_config('neoevo.bootstrap_user_id', '<verified-existing-user-uuid>', true);
-- <this DO block>
-- COMMIT;
DO $bootstrap$
DECLARE
  expected_user uuid;
  total_users bigint;
  matching_users bigint;
BEGIN
  expected_user := nullif(current_setting('neoevo.bootstrap_user_id', true), '')::uuid;
  IF expected_user IS NULL THEN
    RAISE EXCEPTION 'STAFF_BOOTSTRAP_REQUIRES_VERIFIED_USER_ID';
  END IF;
  LOCK TABLE private.staff_members IN EXCLUSIVE MODE;
  LOCK TABLE auth.users IN SHARE MODE;
  IF EXISTS (SELECT 1 FROM private.staff_members) THEN
    RAISE EXCEPTION 'STAFF_BOOTSTRAP_ALREADY_COMPLETED';
  END IF;
  SELECT count(*), count(*) FILTER (
    WHERE id = expected_user AND email_confirmed_at IS NOT NULL
      AND is_anonymous IS NOT TRUE AND deleted_at IS NULL
  ) INTO total_users, matching_users FROM auth.users;
  IF total_users <> 1 OR matching_users <> 1 THEN
    RAISE EXCEPTION 'STAFF_BOOTSTRAP_USER_GUARD_FAILED';
  END IF;
  INSERT INTO private.staff_members(user_id, active) VALUES (expected_user, true);
END
$bootstrap$;
