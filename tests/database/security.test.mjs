import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const root = new URL('../../', import.meta.url);
const sql = async (path) => readFile(new URL(path, root), 'utf8');
const migrations = [
  'supabase/migrations/20260927194212_staff_security_foundation.sql',
  'supabase/migrations/20260927194215_public_booking_infrastructure.sql',
  'supabase/migrations/20260927194218_public_booking_cutover.sql',
];
const staff = '10000000-0000-4000-8000-000000000001';
const outsider = '10000000-0000-4000-8000-000000000002';
const service = '20000000-0000-4000-8000-000000000001';
const inactiveService = '20000000-0000-4000-8000-000000000002';
const ip = 'a'.repeat(64);
const tables = ['availability','bookings','files','notes','projects','services','settings','tasks'];
let sequence = 1;
const requestId = () => `30000000-0000-4000-8000-${String(sequence++).padStart(12, '0')}`;

async function base(t) {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(await sql('tests/database/fixture.sql'));
  await db.exec(await sql('baseline/schema.sql'));
  await db.query('INSERT INTO auth.users(id,email_confirmed_at) VALUES($1,now())', [staff]);
  await db.query(`INSERT INTO public.services(id,name,description,price_starting,active)
    VALUES($1,'Consultation','Public service',100,true),($2,'Internal','Not public',200,false)`, [service, inactiveService]);
  await db.exec(`INSERT INTO public.availability(day_of_week,start_time,end_time)
    SELECT unnest(ARRAY['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']), '09:00'::time, '17:00'::time`);
  return db;
}

async function bootstrap(db, id = staff) {
  await db.exec('BEGIN');
  try {
    await db.query("SELECT set_config('neoevo.bootstrap_user_id',$1,true)", [id]);
    await db.exec(await sql('supabase/operations/bootstrap_staff.sql'));
    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

async function foundation(db, id = staff) {
  await db.query("SELECT set_config('neoevo.bootstrap_user_id',$1,false)", [id]);
  try {
    await db.exec(await sql(migrations[0]));
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  } finally {
    await db.query("SELECT set_config('neoevo.bootstrap_user_id','',false)");
  }
}

async function secured(t) {
  const db = await base(t);
  await foundation(db);
  await db.exec(await sql(migrations[1]));
  await db.exec(await sql(migrations[2]));
  await db.query('INSERT INTO auth.users(id,email_confirmed_at) VALUES($1,now())', [outsider]);
  return db;
}

async function as(db, role, statement, parameters = [], claims = {}) {
  assert.ok(['anon','authenticated','service_role'].includes(role));
  await db.exec('BEGIN');
  try {
    await db.exec(`SET LOCAL ROLE ${role}`);
    await db.query("SELECT set_config('request.jwt.claims',$1,true)", [JSON.stringify({role, ...claims})]);
    const result = await db.query(statement, parameters);
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

async function futureDate(db, days = 1) {
  return (await db.query("SELECT ((now() AT TIME ZONE 'America/New_York')::date + $1::integer)::text AS date", [days])).rows[0].date;
}

async function payload(db, overrides = {}) {
  return { service_id: service, customer_name: 'Test Customer', customer_email: 'customer@example.test',
    booking_date: await futureDate(db), booking_time: '09:00', notes: 'Synthetic test only', ...overrides };
}

async function create(db, data, id = requestId(), clientIp = ip) {
  const result = await as(db, 'service_role', 'SELECT public.create_public_booking($1,$2::jsonb,$3) AS result', [id, JSON.stringify(data), clientIp]);
  return result.rows[0].result;
}

const hasCode = (code, message) => (error) => error.code === code && (!message || error.message === message);

test('foundation removes destructive public privileges while preserving legacy booking before cutover', async (t) => {
  const db = await base(t);
  await foundation(db);
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.services')).rows.length, 1);
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.availability')).rows.length, 7);
  await as(db, 'anon', `INSERT INTO public.bookings(customer_name,customer_email,booking_date,booking_time)
    VALUES('Legacy test','legacy@example.test',CURRENT_DATE + 1,'09:00')`);
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.bookings')).rows.length, 1);
  for (const statement of ['DELETE FROM public.bookings', "UPDATE public.bookings SET status='cancelled'", 'UPDATE public.services SET active=false', 'TRUNCATE public.settings']) {
    await assert.rejects(as(db, 'anon', statement), hasCode('42501'));
  }
  await db.exec('UPDATE private.staff_members SET active=false');
  await assert.rejects(db.exec(await sql(migrations[2])), /ACTIVE_STAFF_REQUIRED_BEFORE_PUBLIC_CUTOVER/);
  await db.exec('ROLLBACK');
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.bookings')).rows.length, 1);
});

test('staff bootstrap requires exact independently verified sole confirmed user and never enrolls new users', async (t) => {
  const db = await base(t);
  await assert.rejects(foundation(db, ''), /STAFF_BOOTSTRAP_REQUIRES_VERIFIED_USER_ID/);
  await assert.rejects(foundation(db, outsider), /STAFF_BOOTSTRAP_USER_GUARD_FAILED/);
  await db.exec('UPDATE auth.users SET email_confirmed_at=NULL');
  await assert.rejects(foundation(db), /STAFF_BOOTSTRAP_USER_GUARD_FAILED/);
  await db.exec('UPDATE auth.users SET email_confirmed_at=now()');
  await foundation(db);
  await assert.rejects(bootstrap(db), /STAFF_BOOTSTRAP_ALREADY_COMPLETED/);
  await db.query('INSERT INTO auth.users(id,email_confirmed_at) VALUES($1,now())', [outsider]);
  assert.equal((await as(db, 'authenticated', 'SELECT public.is_staff() AS result', [], {sub:staff})).rows[0].result, true);
  assert.equal((await as(db, 'authenticated', 'SELECT public.is_staff() AS result', [], {sub:outsider, user_metadata:{is_staff:true,role:'admin'}})).rows[0].result, false);
  assert.equal((await as(db, 'authenticated', 'SELECT public.is_staff() AS result', [], {sub:staff,is_anonymous:true})).rows[0].result, false);
  await db.exec('UPDATE private.staff_members SET active=false');
  assert.equal((await as(db, 'authenticated', 'SELECT public.is_staff() AS result', [], {sub:staff})).rows[0].result, false);
  await assert.rejects(as(db, 'authenticated', 'UPDATE private.staff_members SET active=true', [], {sub:outsider}), hasCode('42501'));
});

test('final grants, policies and restricted function grants satisfy catalog assertions', async (t) => {
  const db = await secured(t);
  await db.exec(await sql('tests/database/security.sql'));
  const functions = await db.query(`SELECT proname,proconfig FROM pg_proc JOIN pg_namespace ON pronamespace=pg_namespace.oid
    WHERE nspname IN ('public','private') AND prosecdef`);
  assert.ok(functions.rows.length >= 5);
  for (const func of functions.rows) assert.ok(func.proconfig.includes('search_path=""'), func.proname);
});

test('anonymous and nonstaff users cannot read CRM rows or mutate any of the eight tables', async (t) => {
  const db = await secured(t);
  const insertStatements = {
    availability: "INSERT INTO public.availability(day_of_week) VALUES('Funday')",
    bookings: "INSERT INTO public.bookings(customer_name,customer_email,booking_date,booking_time) VALUES('Denied','denied@example.test',CURRENT_DATE + 1,'10:00')",
    files: "INSERT INTO public.files(file_name,file_path) VALUES('test','test')",
    notes: "INSERT INTO public.notes(title) VALUES('Denied')",
    projects: "INSERT INTO public.projects(client_name) VALUES('Denied')",
    services: "INSERT INTO public.services(name) VALUES('Denied')",
    settings: 'INSERT INTO public.settings DEFAULT VALUES',
    tasks: "INSERT INTO public.tasks(title) VALUES('Denied')",
  };
  for (const table of tables) {
    await assert.rejects(as(db, 'anon', `SELECT * FROM public.${table}`), hasCode('42501'));
    await assert.rejects(as(db, 'anon', insertStatements[table]), hasCode('42501'));
    await assert.rejects(as(db, 'anon', `UPDATE public.${table} SET id=id`), hasCode('42501'));
    await assert.rejects(as(db, 'anon', `DELETE FROM public.${table}`), hasCode('42501'));
    assert.equal((await as(db, 'authenticated', `SELECT * FROM public.${table}`, [], {sub:outsider})).rows.length, 0);
    await assert.rejects(as(db, 'authenticated', insertStatements[table], [], {sub:outsider}), hasCode('42501'));
    assert.equal((await as(db, 'authenticated', `UPDATE public.${table} SET id=id RETURNING id`, [], {sub:outsider})).rows.length, 0);
    assert.equal((await as(db, 'authenticated', `DELETE FROM public.${table} RETURNING id`, [], {sub:outsider})).rows.length, 0);
    await assert.rejects(as(db, 'authenticated', `TRUNCATE public.${table}`, [], {sub:staff}), hasCode('42501'));
  }
});

test('explicit staff can create, read, edit and delete rows in all existing tables', async (t) => {
  const db = await secured(t);
  const inserts = {
    availability: "INSERT INTO public.availability(day_of_week) VALUES('Testday')",
    bookings: "INSERT INTO public.bookings(customer_name,customer_email,booking_date,booking_time) VALUES('Staff test','staff-test@example.test',CURRENT_DATE + 1,'16:30')",
    files: "INSERT INTO public.files(file_name,file_path) VALUES('test.txt','test.txt')",
    notes: "INSERT INTO public.notes(title) VALUES('Staff test')",
    projects: "INSERT INTO public.projects(client_name) VALUES('Staff test')",
    services: "INSERT INTO public.services(name) VALUES('Staff test')",
    settings: 'INSERT INTO public.settings DEFAULT VALUES',
    tasks: "INSERT INTO public.tasks(title) VALUES('Staff test')",
  };
  for (const table of tables) {
    const id = (await as(db, 'authenticated', inserts[table] + ' RETURNING id', [], {sub:staff})).rows[0].id;
    assert.equal((await as(db, 'authenticated', `SELECT id FROM public.${table} WHERE id=$1`, [id], {sub:staff})).rows.length, 1);
    assert.equal((await as(db, 'authenticated', `UPDATE public.${table} SET created_at=now() WHERE id=$1 RETURNING id`, [id], {sub:staff})).rows.length, 1);
    assert.equal((await as(db, 'authenticated', `DELETE FROM public.${table} WHERE id=$1 RETURNING id`, [id], {sub:staff})).rows.length, 1);
  }
});

test('Storage upload/read/delete is limited to staff and client-files, without adding replacement access', async (t) => {
  const db = await secured(t);
  await db.exec("INSERT INTO storage.objects(bucket_id,name) VALUES('client-files','private.txt'),('unrelated-bucket','other.txt')");
  for (const [role,claims] of [['anon',{}],['authenticated',{sub:outsider}]]) {
    assert.equal((await as(db, role, 'SELECT * FROM storage.objects', [], claims)).rows.length, 0);
    await assert.rejects(as(db, role, "INSERT INTO storage.objects(bucket_id,name) VALUES('client-files','denied.txt')", [], claims), hasCode('42501'));
    assert.equal((await as(db, role, 'DELETE FROM storage.objects RETURNING id', [], claims)).rows.length, 0);
  }
  assert.equal((await as(db, 'authenticated', 'SELECT * FROM storage.objects', [], {sub:staff})).rows.length, 1);
  await as(db, 'authenticated', "INSERT INTO storage.objects(bucket_id,name) VALUES('client-files','staff.txt')", [], {sub:staff});
  await assert.rejects(as(db, 'authenticated', "INSERT INTO storage.objects(bucket_id,name) VALUES('unrelated-bucket','denied.txt')", [], {sub:staff}), hasCode('42501'));
  assert.equal((await as(db, 'authenticated', "UPDATE storage.objects SET name='replacement.txt' RETURNING id", [], {sub:staff})).rows.length, 0);
  assert.equal((await as(db, 'authenticated', 'DELETE FROM storage.objects RETURNING id', [], {sub:staff})).rows.length, 2);
});

test('public service and slot RPCs expose only safe active metadata and future free 30-minute times', async (t) => {
  const db = await secured(t);
  const date = await futureDate(db);
  const services = (await as(db, 'anon', 'SELECT * FROM public.get_public_services()')).rows;
  assert.equal(services.length, 1);
  assert.deepEqual(Object.keys(services[0]).sort(), ['id','name']);
  const before = (await as(db, 'anon', 'SELECT * FROM public.get_booking_slots($1)', [date])).rows;
  assert.equal(before.length, 16);
  assert.deepEqual(before[0], {booking_time:'09:00'});
  await create(db, await payload(db));
  const after = (await as(db, 'anon', 'SELECT * FROM public.get_booking_slots($1)', [date])).rows;
  assert.equal(after.length, 15);
  assert.ok(!after.some((slot) => slot.booking_time === '09:00'));
  await db.exec("UPDATE public.bookings SET status='cancelled'");
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.get_booking_slots($1)', [date])).rows.length, 16);
  for (const days of [-1,91]) assert.equal((await as(db, 'anon', 'SELECT * FROM public.get_booking_slots($1)', [await futureDate(db,days)])).rows.length, 0);
  await db.exec('UPDATE public.availability SET is_open=false');
  assert.equal((await as(db, 'anon', 'SELECT * FROM public.get_booking_slots($1)', [date])).rows.length, 0);
});

test('booking creation validates input, fixes pending status and rejects unauthorized function callers', async (t) => {
  const db = await secured(t);
  const valid = await payload(db);
  for (const role of ['anon','authenticated']) {
    await assert.rejects(as(db, role, 'SELECT public.create_public_booking($1,$2::jsonb,$3)', [requestId(),JSON.stringify(valid),ip], {sub:staff}), hasCode('42501'));
  }
  const invalid = [
    {...valid,status:'confirmed'}, {...valid,service_id:inactiveService}, {...valid,customer_email:'bad\n@example.test'},
    {...valid,customer_name:''}, {...valid,customer_phone:123}, {...valid,notes:[]}, {...valid,booking_date:'2026-02-30'},
    {...valid,booking_date:await futureDate(db,-1)}, {...valid,booking_date:await futureDate(db,91)}, {...valid,booking_time:'24:00'},
  ];
  for (const data of invalid) await assert.rejects(create(db,data), hasCode('PT400','INVALID_BOOKING_REQUEST'));
  for (const time of ['08:30','09:15','17:00']) await assert.rejects(create(db,{...valid,booking_time:time}), hasCode('PT409','BOOKING_SLOT_UNAVAILABLE'));
  await assert.rejects(create(db,valid,requestId(),'untrusted-ip'), hasCode('PT400'));
  const result = await create(db,{...valid,customer_name:' Test Customer ',customer_email:'CUSTOMER@EXAMPLE.TEST'});
  assert.deepEqual(Object.keys(result).sort(), ['booking_id','replayed','status']);
  assert.equal(result.status,'pending');
  assert.equal(result.replayed,false);
  const row = (await db.query('SELECT customer_name,customer_email,status FROM public.bookings WHERE id=$1',[result.booking_id])).rows[0];
  assert.deepEqual(row,{customer_name:'Test Customer',customer_email:'customer@example.test',status:'pending'});
  assert.equal((await db.query('SELECT count(*)::int AS count FROM private.notification_delivery')).rows[0].count,2);
});

test('idempotency survives retries, detects changed payload and never recreates a deleted booking', async (t) => {
  const db = await secured(t);
  const data = await payload(db);
  const id = requestId();
  const first = await create(db,data,id);
  const replay = await create(db,data,id,'b'.repeat(64));
  assert.equal(replay.booking_id,first.booking_id);
  assert.equal(replay.replayed,true);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM public.bookings')).rows[0].count,1);
  await assert.rejects(create(db,{...data,notes:'Changed'},id), hasCode('PT409','REQUEST_ID_CONFLICT'));
  await assert.rejects(create(db,data), hasCode('PT409','BOOKING_SLOT_UNAVAILABLE'));
  await db.query('DELETE FROM public.bookings WHERE id=$1',[first.booking_id]);
  await assert.rejects(create(db,data,id), hasCode('PT409','BOOKING_NO_LONGER_AVAILABLE'));
});

test('unique slot protection also rejects writes outside the booking RPC and preserves existing duplicates on preflight failure', async (t) => {
  const db = await secured(t);
  const data = await payload(db);
  await create(db,data);
  await assert.rejects(as(db,'authenticated', `INSERT INTO public.bookings(customer_name,customer_email,booking_date,booking_time)
    VALUES('Staff test','another@example.test',$1,'09:00')`,[data.booking_date],{sub:staff}),hasCode('23505'));

  const legacy = await base(t);
  await legacy.exec(`INSERT INTO public.bookings(customer_name,customer_email,booking_date,booking_time)
    SELECT 'Legacy test','legacy@example.test',CURRENT_DATE + 1,'10:00' FROM generate_series(1,2)`);
  await foundation(legacy);
  await assert.rejects(legacy.exec(await sql(migrations[1])), /BOOKING_SLOT_CONFLICTS_REQUIRE_REVIEW/);
  await legacy.exec('ROLLBACK');
  assert.equal((await legacy.query('SELECT count(*)::int AS count FROM public.bookings')).rows[0].count,2);
  assert.equal((await legacy.query("SELECT to_regclass('private.booking_requests') AS relation")).rows[0].relation,null);
});

test('recipient and IP limits are enforced in the same transaction as successful booking creation', async (t) => {
  const db = await secured(t);
  const data = await payload(db);
  for (const time of ['09:00','09:30','10:00']) await create(db,{...data,booking_time:time});
  await assert.rejects(create(db,{...data,booking_time:'10:30'}),hasCode('PT429','BOOKING_RATE_LIMITED'));
  for (const [i,time] of ['10:30','11:00'].entries()) await create(db,{...data,customer_email:`other${i}@example.test`,booking_time:time});
  await assert.rejects(create(db,{...data,customer_email:'last@example.test',booking_time:'11:30'}),hasCode('PT429','BOOKING_RATE_LIMITED'));
  assert.equal((await db.query('SELECT count(*)::int AS count FROM public.bookings')).rows[0].count,5);
});

test('global booking rate limit applies across different IPs and recipients', async (t) => {
  const db = await secured(t);
  await db.exec(`INSERT INTO private.booking_requests(request_id,payload_hash,email_hash,ip_hash)
    SELECT gen_random_uuid(),repeat('1',64),repeat('2',64),repeat('3',64) FROM generate_series(1,50)`);
  await assert.rejects(create(db,await payload(db)),hasCode('PT429','BOOKING_RATE_LIMITED'));
});

test('notification claims isolate channels, freeze retry payloads and complete only the current claim', async (t) => {
  const db = await secured(t);
  const booking = await create(db,await payload(db));
  const claim = async (channel) => (await as(db,'service_role','SELECT public.claim_booking_notification($1,$2) AS result',[booking.booking_id,channel])).rows[0].result;
  const complete = async (channel,id,success) => (await as(db,'service_role','SELECT public.complete_booking_notification($1,$2,$3,$4) AS result',[booking.booking_id,channel,id,success])).rows[0].result;
  const first = await claim('customer');
  assert.equal(first.status,'claimed');
  assert.deepEqual(await claim('customer'),{status:'busy'});
  assert.equal((await claim('admin')).status,'claimed');
  assert.equal(await complete('customer',requestId(),true),false);
  assert.equal(await complete('customer',first.claim_id,false),true);
  assert.deepEqual(await claim('customer'),{status:'busy'});
  await db.exec("UPDATE private.notification_delivery SET last_attempt_at=now()-interval '2 minutes' WHERE channel='customer'");
  await db.query("UPDATE public.bookings SET customer_name='Changed after attempt', customer_email='changed@example.test' WHERE id=$1",[booking.booking_id]);
  await db.query("UPDATE public.services SET name='Changed service' WHERE id=$1",[service]);
  const second = await claim('customer');
  assert.deepEqual(second.booking,first.booking);
  assert.notEqual(second.claim_id,first.claim_id);
  assert.equal(await complete('customer',first.claim_id,true),false);
  assert.equal(await complete('customer',second.claim_id,true),true);
  assert.deepEqual(await claim('customer'),{status:'sent'});
  for (const role of ['anon','authenticated']) {
    await assert.rejects(as(db,role,'SELECT public.claim_booking_notification($1,$2)',[booking.booking_id,'customer'],{sub:staff}),hasCode('42501'));
  }
});

test('expired notification lease can retry, but ambiguity beyond provider window requires review', async (t) => {
  const db = await secured(t);
  const booking = await create(db,await payload(db));
  const claim = async () => (await as(db,'service_role',"SELECT public.claim_booking_notification($1,'customer') AS result",[booking.booking_id])).rows[0].result;
  const first = await claim();
  await db.exec("UPDATE private.notification_delivery SET claimed_until=now()-interval '1 minute' WHERE channel='customer'");
  const retry = await claim();
  assert.equal(retry.status,'claimed');
  assert.notEqual(retry.claim_id,first.claim_id);
  await db.exec("UPDATE private.notification_delivery SET first_attempt_at=now()-interval '24 hours',claimed_until=now()-interval '1 minute' WHERE channel='customer'");
  assert.deepEqual(await claim(),{status:'review_required'});
});

test('policy drift and a public Storage bucket abort foundation without changing prior access', async (t) => {
  const db = await base(t);
  await db.exec('CREATE POLICY unexpected ON public.notes FOR SELECT TO authenticated USING (true)');
  await assert.rejects(foundation(db), /UNREVIEWED_APPLICATION_POLICIES_REQUIRE_REVIEW/);
  assert.equal((await db.query("SELECT to_regclass('private.staff_members') AS relation")).rows[0].relation,null);
  await db.exec('DROP POLICY unexpected ON public.notes');
  await db.exec("CREATE POLICY unexpected ON storage.objects FOR SELECT TO anon USING (bucket_id='unrelated-bucket')");
  await assert.rejects(foundation(db), /UNREVIEWED_STORAGE_POLICIES_REQUIRE_REVIEW/);
  // Even a policy intended for another bucket is preserved for review, not dropped.
  assert.equal((await db.query("SELECT count(*)::int AS count FROM pg_policies WHERE schemaname='storage' AND policyname='unexpected'")).rows[0].count,1);
  await db.exec('DROP POLICY unexpected ON storage.objects');
  await db.exec("UPDATE storage.buckets SET public=true WHERE id='client-files'");
  await assert.rejects(foundation(db), /STORAGE_BUCKET_PRIVACY_GUARD_FAILED/);
});

test('migrations preserve every existing application row and staff booking-service joins', async (t) => {
  const db = await base(t);
  await db.exec(`INSERT INTO public.bookings(service_id,customer_name,customer_email,booking_date,booking_time)
      VALUES('${service}','Existing test','existing@example.test',CURRENT_DATE + 1,'11:30');
    INSERT INTO public.files(file_name,file_path,client_email) VALUES('existing.txt','existing.txt','existing@example.test');
    INSERT INTO public.notes(title,content,related_email) VALUES('Existing note','Preserve this text','existing@example.test');
    INSERT INTO public.projects(client_name,price,status) VALUES('Existing test',500,'lead');
    INSERT INTO public.settings(business_name) VALUES('Existing test settings');
    INSERT INTO public.tasks(title,completed) VALUES('Existing task',false)`);
  const before = {};
  for (const table of tables) before[table] = (await db.query(`SELECT * FROM public.${table} ORDER BY id`)).rows;
  await foundation(db);
  await db.exec(await sql(migrations[1]));
  await db.exec(await sql(migrations[2]));
  for (const table of tables) assert.deepEqual((await db.query(`SELECT * FROM public.${table} ORDER BY id`)).rows,before[table],table);
  const joined = await as(db,'authenticated',`SELECT booking.id,service.name FROM public.bookings booking
    LEFT JOIN public.services service ON service.id=booking.service_id`,[],{sub:staff});
  assert.equal(joined.rows.length,1);
  assert.equal(joined.rows[0].name,'Consultation');
});

test('cancelled or changed bookings do not send stale pending-request notifications', async (t) => {
  const db = await secured(t);
  const booking = await create(db,await payload(db));
  const first = (await as(db,'service_role',"SELECT public.claim_booking_notification($1,'customer') AS result",[booking.booking_id])).rows[0].result;
  await as(db,'service_role',"SELECT public.complete_booking_notification($1,'customer',$2,true)",[booking.booking_id,first.claim_id]);
  await db.query("UPDATE public.bookings SET status='cancelled' WHERE id=$1",[booking.booking_id]);
  assert.deepEqual((await as(db,'service_role',"SELECT public.claim_booking_notification($1,'customer') AS result",[booking.booking_id])).rows[0].result,{status:'sent'});
  assert.deepEqual((await as(db,'service_role',"SELECT public.claim_booking_notification($1,'admin') AS result",[booking.booking_id])).rows[0].result,{status:'review_required'});
});

test('notification retries are bounded and unsupported availability seconds fail closed', async (t) => {
  const db = await secured(t);
  const data = await payload(db);
  const booking = await create(db,data);
  await db.query("UPDATE private.notification_delivery SET status='failed',attempt_count=5,last_attempt_at=now()-interval '2 minutes' WHERE booking_id=$1 AND channel='customer'",[booking.booking_id]);
  assert.deepEqual((await as(db,'service_role',"SELECT public.claim_booking_notification($1,'customer') AS result",[booking.booking_id])).rows[0].result,{status:'review_required'});
  await db.exec("UPDATE public.availability SET start_time='09:00:15'");
  assert.deepEqual((await as(db,'anon','SELECT * FROM public.get_booking_slots($1)',[data.booking_date])).rows,[]);
  await db.exec("UPDATE public.availability SET start_time='09:15:00'");
  const slots = (await as(db,'anon','SELECT * FROM public.get_booking_slots($1)',[data.booking_date])).rows;
  assert.deepEqual(slots[0],{booking_time:'09:15'});
  assert.equal((await create(db,{...data,booking_time:'09:15',customer_email:'minutes@example.test'})).status,'pending');
});

test('cutover aborts if application or Storage RLS was disabled between release stages', async (t) => {
  const db = await base(t);
  await foundation(db);
  await db.exec(await sql(migrations[1]));
  for (const table of [...tables.map((name) => `public.${name}`),'storage.objects']) {
    await db.exec(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
    await assert.rejects(db.exec(await sql(migrations[2])), /RLS_REQUIRED_BEFORE_PUBLIC_CUTOVER/);
    await db.exec('ROLLBACK');
    await db.exec(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  }
  await db.exec(await sql(migrations[2]));
  await db.exec(await sql('tests/database/security.sql'));
});

// PGlite executes real PostgreSQL RLS/functions, but is a single-session engine.
// The unique-index test proves the database invariant; a hosted staging smoke test
// must additionally exercise truly concurrent HTTP requests and managed Storage/Auth.
