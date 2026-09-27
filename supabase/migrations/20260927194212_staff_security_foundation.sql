-- Stage 1. Keep the old public booking form operational until the RPC cutover.
-- The operator must set neoevo.bootstrap_user_id in this same database session
-- to the independently verified existing account UUID before running the migration.
-- Guarded enrollment and authorization changes commit atomically. No auto-enrollment.
BEGIN;

DO $policy_preflight$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('availability','bookings','files','notes','projects','services','settings','tasks')
      AND NOT (
        policyname = 'Authenticated users manage ' || tablename
        OR (tablename = 'availability' AND policyname = 'Public can read availability')
        OR (tablename = 'bookings' AND policyname IN (
          'Anyone can create bookings','Anyone can read bookings','Anyone can update bookings','Anyone can delete bookings'))
        OR (tablename = 'services' AND policyname IN (
          'Anyone can update services','Anyone can view active services','Public can read active services'))
      )
  ) THEN
    RAISE EXCEPTION 'UNREVIEWED_APPLICATION_POLICIES_REQUIRE_REVIEW';
  END IF;
END
$policy_preflight$;

DO $storage_preflight$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'client-files' AND public IS FALSE) THEN
    RAISE EXCEPTION 'STORAGE_BUCKET_PRIVACY_GUARD_FAILED';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class WHERE oid = 'storage.objects'::regclass)
    OR EXISTS (
      SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname NOT IN (
          'Authenticated users can view files', 'Authenticated users can upload files', 'Authenticated users can delete files'
        )
    ) THEN
    RAISE EXCEPTION 'UNREVIEWED_STORAGE_POLICIES_REQUIRE_REVIEW';
  END IF;
END
$storage_preflight$;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE TABLE private.staff_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.staff_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.staff_members FROM PUBLIC, anon, authenticated, service_role;

-- Keep this guard equivalent to operations/bootstrap_staff.sql. The explicit ID
-- is supplied only in the operator session, never stored in repository source.
DO $bootstrap$
DECLARE expected_user uuid; total_users bigint; matching_users bigint;
BEGIN
  expected_user := nullif(current_setting('neoevo.bootstrap_user_id', true), '')::uuid;
  IF expected_user IS NULL THEN RAISE EXCEPTION 'STAFF_BOOTSTRAP_REQUIRES_VERIFIED_USER_ID'; END IF;
  LOCK TABLE private.staff_members IN EXCLUSIVE MODE;
  LOCK TABLE auth.users IN SHARE MODE;
  IF EXISTS (SELECT 1 FROM private.staff_members) THEN RAISE EXCEPTION 'STAFF_BOOTSTRAP_ALREADY_COMPLETED'; END IF;
  SELECT count(*), count(*) FILTER (
    WHERE id = expected_user AND email_confirmed_at IS NOT NULL
      AND is_anonymous IS NOT TRUE AND deleted_at IS NULL
  ) INTO total_users, matching_users FROM auth.users;
  IF total_users <> 1 OR matching_users <> 1 THEN RAISE EXCEPTION 'STAFF_BOOTSTRAP_USER_GUARD_FAILED'; END IF;
  INSERT INTO private.staff_members(user_id, active) VALUES (expected_user, true);
END
$bootstrap$;

CREATE FUNCTION private.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT coalesce(auth.jwt() ->> 'is_anonymous', 'false') = 'false'
    AND EXISTS (
      SELECT 1
      FROM private.staff_members AS staff
      JOIN auth.users AS account ON account.id = staff.user_id
      WHERE staff.user_id = (SELECT auth.uid()) AND staff.active
        AND account.email_confirmed_at IS NOT NULL
        AND account.is_anonymous IS NOT TRUE AND account.deleted_at IS NULL
    )
$function$;
REVOKE ALL ON FUNCTION private.is_staff() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff() TO authenticated;

CREATE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT private.is_staff()
$function$;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Replace only the audited application policies, including permissive policies whose
-- OR-combination previously defeated the intended active-service filter.
DO $policies$
DECLARE relation_name text; existing_policy record;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'availability','bookings','files','notes','projects','services','settings','tasks'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated, service_role', relation_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated, service_role', relation_name);
    FOR existing_policy IN
      SELECT policyname FROM pg_catalog.pg_policies
      WHERE schemaname = 'public' AND tablename = relation_name
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', existing_policy.policyname, relation_name);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING ((SELECT private.is_staff()))', relation_name);
    EXECUTE format(
      'CREATE POLICY staff_insert ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_staff()))', relation_name);
    EXECUTE format(
      'CREATE POLICY staff_update ON public.%I FOR UPDATE TO authenticated USING ((SELECT private.is_staff())) WITH CHECK ((SELECT private.is_staff()))', relation_name);
    EXECUTE format(
      'CREATE POLICY staff_delete ON public.%I FOR DELETE TO authenticated USING ((SELECT private.is_staff()))', relation_name);
  END LOOP;
END
$policies$;

-- Temporary compatibility only: migration 3 removes these table grants/policies.
GRANT SELECT, INSERT ON public.bookings TO anon;
CREATE POLICY legacy_public_booking_read ON public.bookings FOR SELECT TO anon USING (true);
CREATE POLICY legacy_public_booking_insert ON public.bookings FOR INSERT TO anon WITH CHECK (true);
GRANT SELECT ON public.services, public.availability TO anon;
CREATE POLICY legacy_public_active_services ON public.services FOR SELECT TO anon USING (active IS TRUE);
CREATE POLICY legacy_public_availability ON public.availability FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
CREATE POLICY neoevo_staff_file_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'client-files' AND (SELECT private.is_staff()));
CREATE POLICY neoevo_staff_file_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-files' AND (SELECT private.is_staff()));
CREATE POLICY neoevo_staff_file_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-files' AND (SELECT private.is_staff()));
-- Existing UI does not replace files, so no new Storage UPDATE capability.

COMMIT;
