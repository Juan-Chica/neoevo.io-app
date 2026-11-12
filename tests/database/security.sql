-- Read-only catalog assertions used after the final migration in isolated tests.
-- The same assertions are safe as an operator verification on the deployed DB.
DO $verify$
DECLARE relation_name text; role_name text; signature text;
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class WHERE oid = 'storage.objects'::regclass) THEN
    RAISE EXCEPTION 'STORAGE_RLS_REQUIRED';
  END IF;
  FOREACH relation_name IN ARRAY ARRAY[
    'availability','bookings','files','notes','projects','services','settings','tasks'
  ] LOOP
    IF NOT (SELECT relrowsecurity FROM pg_catalog.pg_class WHERE oid = ('public.' || relation_name)::regclass) THEN
      RAISE EXCEPTION 'RLS_REQUIRED: %', relation_name;
    END IF;
    IF has_table_privilege('anon', 'public.' || relation_name, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') THEN
      RAISE EXCEPTION 'ANONYMOUS_TABLE_GRANT_REMAINS: %', relation_name;
    END IF;
    IF has_table_privilege('authenticated', 'public.' || relation_name, 'TRUNCATE,REFERENCES,TRIGGER') THEN
      RAISE EXCEPTION 'STAFF_EXCESS_TABLE_GRANT: %', relation_name;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname = 'public' AND tablename = relation_name
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles))) THEN
      RAISE EXCEPTION 'PUBLIC_TABLE_POLICY_REMAINS: %', relation_name;
    END IF;
  END LOOP;
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
    FOREACH relation_name IN ARRAY ARRAY['staff_members','booking_requests','notification_delivery'] LOOP
      IF has_table_privilege(role_name, 'private.' || relation_name, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') THEN
        RAISE EXCEPTION 'PRIVATE_TABLE_GRANT_REMAINS: % %', role_name, relation_name;
      END IF;
    END LOOP;
  END LOOP;
  FOREACH signature IN ARRAY ARRAY[
    'public.create_public_booking(uuid,jsonb,text)',
    'public.claim_booking_notification(uuid,text)',
    'public.complete_booking_notification(uuid,text,uuid,boolean)'
  ] LOOP
    IF has_function_privilege('anon', signature, 'EXECUTE')
      OR has_function_privilege('authenticated', signature, 'EXECUTE')
      OR NOT has_function_privilege('service_role', signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'INCORRECT_SERVER_RPC_GRANTS: %', signature;
    END IF;
  END LOOP;
  IF has_function_privilege('anon','public.is_staff()','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.is_staff()','EXECUTE') THEN
    RAISE EXCEPTION 'INCORRECT_STAFF_RPC_GRANTS';
  END IF;
  IF NOT has_function_privilege('anon','public.get_public_services()','EXECUTE')
    OR NOT has_function_privilege('anon','public.get_booking_slots(date)','EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC_BOOKING_READ_RPC_UNAVAILABLE';
  END IF;
END
$verify$;
