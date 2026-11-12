-- Stage 3. Deploy and verify the Edge booking endpoint and RPC-based public form
-- before applying this cutover. It deliberately fails closed for old cached forms.
BEGIN;

REVOKE ALL ON public.bookings, public.services, public.availability FROM anon;
DROP POLICY IF EXISTS legacy_public_booking_read ON public.bookings;
DROP POLICY IF EXISTS legacy_public_booking_insert ON public.bookings;
DROP POLICY IF EXISTS legacy_public_active_services ON public.services;
DROP POLICY IF EXISTS legacy_public_availability ON public.availability;

-- Public visitors use only get_public_services/get_booking_slots and the Edge
-- create-booking endpoint. No public table SELECT includes customer information.
-- Staff retain full dashboard CRUD through the membership policies.
DO $cutover_guard$
DECLARE relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'public.availability','public.bookings','public.files','public.notes',
    'public.projects','public.services','public.settings','public.tasks','storage.objects'
  ] LOOP
    IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class WHERE oid = relation_name::regclass) THEN
      RAISE EXCEPTION 'RLS_REQUIRED_BEFORE_PUBLIC_CUTOVER: %', relation_name;
    END IF;
  END LOOP;
  IF NOT EXISTS (
    SELECT 1 FROM private.staff_members AS staff JOIN auth.users AS account ON account.id = staff.user_id
    WHERE staff.active AND account.email_confirmed_at IS NOT NULL
      AND account.is_anonymous IS NOT TRUE AND account.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'ACTIVE_STAFF_REQUIRED_BEFORE_PUBLIC_CUTOVER';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'client-files' AND public IS FALSE)
    OR EXISTS (
      SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname NOT IN ('neoevo_staff_file_read','neoevo_staff_file_insert','neoevo_staff_file_delete')
    ) THEN
    RAISE EXCEPTION 'STORAGE_CONFIGURATION_REQUIRES_REVIEW';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('bookings','services','availability','files','notes','projects','settings','tasks')
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles))
  ) THEN
    RAISE EXCEPTION 'UNEXPECTED_PUBLIC_POLICY_REQUIRES_REVIEW';
  END IF;
END
$cutover_guard$;

COMMIT;
