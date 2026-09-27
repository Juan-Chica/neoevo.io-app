-- Structural baseline from the read-only production catalog audit, 2026-09-27.
-- FOR EMPTY LOCAL/TEST DATABASES ONLY. This is not a production migration.
-- Business/contact literal defaults are intentionally omitted. No customer rows,
-- account identifiers, credentials, or environment values are included.
-- Managed auth/storage schemas must already exist (Supabase, or the test fixture).

CREATE TABLE public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL UNIQUE,
  is_open boolean DEFAULT true,
  start_time time without time zone,
  end_time time without time zone,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_starting integer,
  duration_minutes integer DEFAULT 30,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  booking_date date NOT NULL,
  booking_time time without time zone NOT NULL,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  category text DEFAULT 'general',
  client_email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text DEFAULT 'general',
  related_email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text,
  service_name text,
  price integer,
  status text DEFAULT 'lead',
  due_date date,
  website_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text,
  contact_email text,
  phone text,
  website text,
  meeting_link text,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false,
  due_date date,
  related_email text,
  created_at timestamptz DEFAULT now()
);

-- Reproduce audited privileges and policies so tests prove the migrations remove
-- the original exposures. These permissions must never be used as a new setup.
DO $baseline$
DECLARE relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'availability','bookings','files','notes','projects','services','settings','tasks'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO authenticated, service_role', relation_name);
    EXECUTE format('GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE public.%I TO anon', relation_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      'Authenticated users manage ' || relation_name, relation_name
    );
  END LOOP;
END
$baseline$;

GRANT ALL ON public.availability, public.bookings, public.services, public.settings TO anon;
CREATE POLICY "Public can read availability" ON public.availability FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read bookings" ON public.bookings FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete bookings" ON public.bookings FOR DELETE TO anon USING (true);
CREATE POLICY "Anyone can update services" ON public.services FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read active services" ON public.services FOR SELECT TO anon USING (active = true);
CREATE POLICY "Authenticated users can view files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'client-files');
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-files');
CREATE POLICY "Authenticated users can delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-files');
