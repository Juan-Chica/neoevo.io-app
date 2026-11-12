-- Stage 2. Add the restricted booking surface without removing the legacy form.
-- Existing rows are never rewritten or deleted. A conflicting legacy slot aborts
-- this transaction and requires operator review; it is never silently deduplicated.
BEGIN;

DO $preflight$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE status IS DISTINCT FROM 'cancelled'
    GROUP BY booking_date, booking_time HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'BOOKING_SLOT_CONFLICTS_REQUIRE_REVIEW';
  END IF;
END
$preflight$;

CREATE UNIQUE INDEX bookings_one_live_slot
  ON public.bookings(booking_date, booking_time)
  WHERE status IS DISTINCT FROM 'cancelled';
CREATE INDEX bookings_service_id_idx ON public.bookings(service_id);

CREATE TABLE private.booking_requests (
  request_id uuid PRIMARY KEY,
  booking_id uuid UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL,
  payload_hash text NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
  email_hash text NOT NULL CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX booking_requests_email_recent ON private.booking_requests(email_hash, created_at DESC);
CREATE INDEX booking_requests_ip_recent ON private.booking_requests(ip_hash, created_at DESC);
CREATE INDEX booking_requests_recent ON private.booking_requests(created_at DESC);

CREATE TABLE private.notification_delivery (
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('customer', 'admin')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sending','sent','failed','review_required')),
  claim_id uuid,
  claimed_until timestamptz,
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  sent_at timestamptz,
  snapshot jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, channel)
);
ALTER TABLE private.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.notification_delivery ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.booking_requests, private.notification_delivery
  FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.get_public_services()
RETURNS TABLE(id uuid, name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT service.id, service.name
  FROM public.services AS service
  WHERE service.active IS TRUE
  ORDER BY service.created_at, service.id
$function$;
REVOKE ALL ON FUNCTION public.get_public_services() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_services() TO anon, authenticated, service_role;

CREATE FUNCTION public.get_booking_slots(p_date date)
RETURNS TABLE(booking_time text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT DISTINCT to_char(slot.local_start, 'HH24:MI') AS booking_time
  FROM public.availability AS availability
  CROSS JOIN LATERAL pg_catalog.generate_series(
    p_date + availability.start_time,
    p_date + availability.end_time - interval '30 minutes',
    interval '30 minutes'
  ) AS slot(local_start)
  WHERE p_date BETWEEN (now() AT TIME ZONE 'America/New_York')::date
      AND (now() AT TIME ZONE 'America/New_York')::date + 90
    AND lower(btrim(availability.day_of_week)) =
      (ARRAY['sunday','monday','tuesday','wednesday','thursday','friday','saturday'])[
        extract(dow FROM p_date)::integer + 1]
    AND availability.is_open IS TRUE
    AND availability.start_time < availability.end_time
    AND extract(second FROM availability.start_time) = 0
    AND extract(second FROM availability.end_time) = 0
    AND slot.local_start > now() AT TIME ZONE 'America/New_York'
    -- Reject local times that do not exist when the clocks move forward.
    AND (slot.local_start AT TIME ZONE 'America/New_York') AT TIME ZONE 'America/New_York' = slot.local_start
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings AS booking
      WHERE booking.booking_date = p_date
        AND booking.booking_time = slot.local_start::time
        AND booking.status IS DISTINCT FROM 'cancelled'
    )
  ORDER BY booking_time
$function$;
REVOKE ALL ON FUNCTION public.get_booking_slots(date) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_booking_slots(date) TO anon, authenticated, service_role;

CREATE FUNCTION public.create_public_booking(p_request_id uuid, p_payload jsonb, p_ip_hash text)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  service_uuid uuid;
  chosen_date date;
  chosen_time time;
  customer_name_value text;
  email_value text;
  phone_value text;
  notes_value text;
  normalized_payload jsonb;
  request_hash text;
  recipient_hash text;
  existing_request private.booking_requests%ROWTYPE;
  new_booking_id uuid;
  current_time_value timestamptz;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
    RAISE SQLSTATE '42501' USING MESSAGE = 'SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_request_id IS NULL OR p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$'
    OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object'
    OR octet_length(p_payload::text) > 16384 THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_payload) AS field(name)
    WHERE field.name <> ALL (ARRAY['service_id','customer_name','customer_email','customer_phone','booking_date','booking_time','notes'])
  ) OR EXISTS (
    SELECT 1 FROM unnest(ARRAY['service_id','customer_name','customer_email','booking_date','booking_time']) AS field(name)
    WHERE jsonb_typeof(p_payload -> field.name) IS DISTINCT FROM 'string'
  ) OR EXISTS (
    SELECT 1 FROM unnest(ARRAY['customer_phone','notes']) AS field(name)
    WHERE p_payload ? field.name AND jsonb_typeof(p_payload -> field.name) NOT IN ('string','null')
  ) THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END IF;

  customer_name_value := btrim(p_payload ->> 'customer_name');
  email_value := lower(btrim(p_payload ->> 'customer_email'));
  phone_value := nullif(btrim(p_payload ->> 'customer_phone'), '');
  notes_value := nullif(btrim(p_payload ->> 'notes'), '');
  IF length(customer_name_value) NOT BETWEEN 1 AND 120 OR customer_name_value ~ '[[:cntrl:]]'
    OR length(email_value) NOT BETWEEN 3 AND 254
    OR length(split_part(email_value, '@', 1)) > 64
    OR email_value !~ $email$^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$$email$
    OR length(phone_value) > 40 OR phone_value ~ '[[:cntrl:]]'
    OR length(notes_value) > 2000
    OR (p_payload ->> 'service_id') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR (p_payload ->> 'booking_date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    OR (p_payload ->> 'booking_time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:00)?$' THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END IF;
  BEGIN
    service_uuid := (p_payload ->> 'service_id')::uuid;
    chosen_date := (p_payload ->> 'booking_date')::date;
    chosen_time := (p_payload ->> 'booking_time')::time;
  EXCEPTION WHEN data_exception THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END;
  normalized_payload := jsonb_build_object(
    'service_id', service_uuid, 'customer_name', customer_name_value,
    'customer_email', email_value, 'customer_phone', phone_value,
    'booking_date', chosen_date, 'booking_time', chosen_time, 'notes', notes_value
  );
  request_hash := encode(sha256(convert_to(normalized_payload::text, 'UTF8')), 'hex');
  recipient_hash := encode(sha256(convert_to(email_value, 'UTF8')), 'hex');

  -- One short transaction lock makes idempotency/rate counters race-safe. The
  -- unique slot index also protects writes that do not use this RPC.
  PERFORM pg_advisory_xact_lock(17862026, 1);
  SELECT * INTO existing_request FROM private.booking_requests WHERE request_id = p_request_id;
  IF FOUND THEN
    IF existing_request.payload_hash <> request_hash THEN
      RAISE SQLSTATE 'PT409' USING MESSAGE = 'REQUEST_ID_CONFLICT';
    END IF;
    IF existing_request.booking_id IS NULL THEN
      RAISE SQLSTATE 'PT409' USING MESSAGE = 'BOOKING_NO_LONGER_AVAILABLE';
    END IF;
    RETURN jsonb_build_object('booking_id', existing_request.booking_id, 'status', 'pending', 'replayed', true);
  END IF;
  current_time_value := clock_timestamp();
  IF chosen_date NOT BETWEEN (current_time_value AT TIME ZONE 'America/New_York')::date
      AND (current_time_value AT TIME ZONE 'America/New_York')::date + 90 THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END IF;
  IF (SELECT count(*) FROM private.booking_requests WHERE created_at > current_time_value - interval '10 minutes') >= 50
    OR (SELECT count(*) FROM private.booking_requests WHERE created_at > current_time_value - interval '1 day') >= 500
    OR (SELECT count(*) FROM private.booking_requests WHERE ip_hash = p_ip_hash AND created_at > current_time_value - interval '15 minutes') >= 5
    OR (SELECT count(*) FROM private.booking_requests WHERE ip_hash = p_ip_hash AND created_at > current_time_value - interval '1 day') >= 20
    OR (SELECT count(*) FROM private.booking_requests WHERE email_hash = recipient_hash AND created_at > current_time_value - interval '1 hour') >= 3
    OR (SELECT count(*) FROM private.booking_requests WHERE email_hash = recipient_hash AND created_at > current_time_value - interval '1 day') >= 5 THEN
    RAISE SQLSTATE 'PT429' USING MESSAGE = 'BOOKING_RATE_LIMITED';
  END IF;

  PERFORM 1 FROM public.services WHERE id = service_uuid AND active IS TRUE FOR SHARE;
  IF NOT FOUND THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_BOOKING_REQUEST';
  END IF;
  PERFORM 1 FROM public.availability
    WHERE lower(btrim(day_of_week)) = (ARRAY['sunday','monday','tuesday','wednesday','thursday','friday','saturday'])[extract(dow FROM chosen_date)::integer + 1]
    FOR SHARE;
  IF (chosen_date + chosen_time) AT TIME ZONE 'America/New_York' <= clock_timestamp() OR NOT EXISTS (
    SELECT 1 FROM public.get_booking_slots(chosen_date) AS slot
    WHERE slot.booking_time = to_char(chosen_date + chosen_time, 'HH24:MI')
  ) THEN
    RAISE SQLSTATE 'PT409' USING MESSAGE = 'BOOKING_SLOT_UNAVAILABLE';
  END IF;

  INSERT INTO public.bookings (
    service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, status
  ) VALUES (
    service_uuid, customer_name_value, email_value, phone_value, chosen_date, chosen_time, notes_value, 'pending'
  ) RETURNING id INTO new_booking_id;
  INSERT INTO private.booking_requests(request_id, booking_id, payload_hash, email_hash, ip_hash)
    VALUES(p_request_id, new_booking_id, request_hash, recipient_hash, p_ip_hash);
  INSERT INTO private.notification_delivery(booking_id, channel)
    VALUES(new_booking_id, 'customer'), (new_booking_id, 'admin');
  RETURN jsonb_build_object('booking_id', new_booking_id, 'status', 'pending', 'replayed', false);
EXCEPTION WHEN unique_violation THEN
  RAISE SQLSTATE 'PT409' USING MESSAGE = 'BOOKING_SLOT_UNAVAILABLE';
END
$function$;
REVOKE ALL ON FUNCTION public.create_public_booking(uuid, jsonb, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_public_booking(uuid, jsonb, text) TO service_role;

CREATE FUNCTION public.claim_booking_notification(p_booking_id uuid, p_channel text)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  delivery private.notification_delivery%ROWTYPE;
  booking_snapshot jsonb;
  booking_status text;
  new_claim uuid;
  current_time_value timestamptz := clock_timestamp();
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
    RAISE SQLSTATE '42501' USING MESSAGE = 'SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_booking_id IS NULL OR p_channel IS NULL OR p_channel NOT IN ('customer','admin') THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_NOTIFICATION_REQUEST';
  END IF;
  SELECT jsonb_build_object(
    'id', booking.id, 'customer_name', booking.customer_name,
    'customer_email', booking.customer_email, 'booking_date', booking.booking_date,
    'booking_time', booking.booking_time, 'notes', booking.notes,
    'service_name', coalesce(service.name, 'Consultation')
  ), booking.status INTO booking_snapshot, booking_status
  FROM public.bookings AS booking LEFT JOIN public.services AS service ON service.id = booking.service_id
  WHERE booking.id = p_booking_id FOR SHARE OF booking;
  IF NOT FOUND THEN
    RAISE SQLSTATE 'PT404' USING MESSAGE = 'BOOKING_NOT_FOUND';
  END IF;
  INSERT INTO private.notification_delivery(booking_id, channel)
    VALUES(p_booking_id, p_channel) ON CONFLICT DO NOTHING;
  SELECT * INTO delivery FROM private.notification_delivery
    WHERE booking_id = p_booking_id AND channel = p_channel FOR UPDATE;
  current_time_value := clock_timestamp();
  IF delivery.status = 'sent' THEN RETURN jsonb_build_object('status','sent'); END IF;
  IF booking_status IS DISTINCT FROM 'pending' OR delivery.status = 'review_required'
    OR delivery.first_attempt_at < current_time_value - interval '23 hours' THEN
    UPDATE private.notification_delivery SET status = 'review_required', updated_at = current_time_value
      WHERE booking_id = p_booking_id AND channel = p_channel;
    RETURN jsonb_build_object('status','review_required');
  END IF;
  IF delivery.status = 'sending' AND delivery.claimed_until > current_time_value THEN
    RETURN jsonb_build_object('status','busy');
  END IF;
  IF delivery.attempt_count >= 5 THEN
    UPDATE private.notification_delivery SET status = 'review_required', updated_at = current_time_value
      WHERE booking_id = p_booking_id AND channel = p_channel;
    RETURN jsonb_build_object('status','review_required');
  END IF;
  IF delivery.status = 'failed' AND delivery.last_attempt_at > current_time_value - interval '1 minute' THEN
    RETURN jsonb_build_object('status','busy');
  END IF;
  new_claim := gen_random_uuid();
  UPDATE private.notification_delivery SET
    status = 'sending', claim_id = new_claim, claimed_until = current_time_value + interval '5 minutes',
    first_attempt_at = coalesce(first_attempt_at, current_time_value), last_attempt_at = current_time_value,
    attempt_count = attempt_count + 1, snapshot = coalesce(snapshot, booking_snapshot), updated_at = current_time_value
    WHERE booking_id = p_booking_id AND channel = p_channel
    RETURNING snapshot INTO booking_snapshot;
  RETURN jsonb_build_object('status','claimed','claim_id',new_claim,'booking',booking_snapshot);
END
$function$;
REVOKE ALL ON FUNCTION public.claim_booking_notification(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_booking_notification(uuid, text) TO service_role;

CREATE FUNCTION public.complete_booking_notification(p_booking_id uuid, p_channel text, p_claim_id uuid, p_success boolean)
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE changed_rows integer;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
    RAISE SQLSTATE '42501' USING MESSAGE = 'SERVICE_ROLE_REQUIRED';
  END IF;
  IF p_booking_id IS NULL OR p_claim_id IS NULL OR p_success IS NULL
    OR p_channel IS NULL OR p_channel NOT IN ('customer','admin') THEN
    RAISE SQLSTATE 'PT400' USING MESSAGE = 'INVALID_NOTIFICATION_REQUEST';
  END IF;
  UPDATE private.notification_delivery SET
    status = CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
    sent_at = CASE WHEN p_success THEN clock_timestamp() ELSE sent_at END,
    claimed_until = NULL, updated_at = clock_timestamp()
    WHERE booking_id = p_booking_id AND channel = p_channel AND claim_id = p_claim_id AND status = 'sending';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  RETURN changed_rows = 1;
END
$function$;
REVOKE ALL ON FUNCTION public.complete_booking_notification(uuid, text, uuid, boolean) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_booking_notification(uuid, text, uuid, boolean) TO service_role;

COMMIT;
