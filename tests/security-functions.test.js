import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";
import { authorizeStaffToken } from "../supabase/functions/_shared/auth.js";
import { createBookingHandler, retryBookingEmailHandler } from "../supabase/functions/_shared/handlers.js";
import { hashClientAddress, PublicError } from "../supabase/functions/_shared/http.js";
import { buildEmail, deliverBookingNotifications } from "../supabase/functions/_shared/notifications.js";

const origin = "https://example.test";
const bookingId = "00000000-0000-4000-8000-000000000001";
const requestId = "00000000-0000-4000-8000-000000000002";
const serviceId = "00000000-0000-4000-8000-000000000003";
const input = { request_id: requestId, service_id: serviceId, customer_name: "Test Person", customer_email: "person@example.test", booking_date: "2026-10-05", booking_time: "10:00", notes: "" };
const committed = { id: bookingId, customer_name: "Stored Person", customer_email: "stored@example.test", service_name: "Consultation", booking_date: "2026-10-05", booking_time: "10:00:00", notes: "Private note" };
const emailConfig = { from: "Booking <booking@example.test>", admin: "admin@example.test" };
const request = (body, extra = {}) => new Request("https://functions.example.test/test", {
  method: "POST", headers: { origin, "content-type": "application/json", ...extra }, body: JSON.stringify(body),
});

function bookingDependencies(overrides = {}) {
  return { allowedOrigins: [origin], rateLimitSecret: "unit-test-only-rate-limit-value", trustedIPHeader: "",
    createBooking: async () => ({ booking_id: bookingId, status: "pending", replayed: false }),
    notify: async () => "sent", ...overrides };
}

test("anonymous and non-staff callers cannot use the old email relay", async () => {
  let sends = 0;
  const handler = retryBookingEmailHandler({ allowedOrigins: [origin], authorizeStaff: async () => false, notify: async () => { sends++; } });
  for (const headers of [{}, { authorization: "Bearer invalid" }]) {
    const response = await handler(request({ booking_id: bookingId, customerEmail: "attacker@example.test" }, headers));
    assert.equal(response.status, 403);
  }
  assert.equal(sends, 0);
});

test("staff must provide only a booking ID; no recipient or content overrides", async () => {
  const received = [];
  const handler = retryBookingEmailHandler({ allowedOrigins: [origin], authorizeStaff: async () => true, notify: async (id) => { received.push(id); return "sent"; } });
  const headers = { authorization: "Bearer test-session" };
  for (const field of ["customerEmail", "to", "html", "subject", "notes"]) {
    const response = await handler(request({ booking_id: bookingId, [field]: "override" }, headers));
    assert.equal(response.status, 400);
  }
  assert.equal((await handler(request({ booking_id: bookingId }, headers))).status, 200);
  assert.deepEqual(received, [bookingId]);
});

test("staff authentication verifies the user first, then current database membership", async () => {
  let membershipCalls = 0;
  const client = (user, error = null, membership = true) => ({ auth: { getUser: async () => ({ data: { user }, error }) }, rpc: async (name) => { assert.equal(name, "is_staff"); membershipCalls++; return { data: membership, error: null }; } });
  assert.equal(await authorizeStaffToken("test", client(null)), false);
  assert.equal(await authorizeStaffToken("test", client({ id: "u" }, { message: "expired" })), false);
  assert.equal(await authorizeStaffToken("test", client({ id: "u", is_anonymous: true })), false);
  assert.equal(membershipCalls, 0);
  assert.equal(await authorizeStaffToken("test", client({ id: "u" }, null, false)), false);
  assert.equal(await authorizeStaffToken("test", client({ id: "u" })), true);
});

test("staff verification outages fail closed without revealing internal errors or sending", async () => {
  let sends = 0;
  const handler = retryBookingEmailHandler({ allowedOrigins: [origin], authorizeStaff: async () => { throw new Error("PRIVATE_AUTH_DETAIL"); }, notify: async () => { sends++; } });
  const response = await handler(request({ booking_id: bookingId }, { authorization: "Bearer test-session" }));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes("PRIVATE_"), false);
  assert.equal(sends, 0);
});

test("staff retries report pending delivery without claiming it was sent", async () => {
  const handler = retryBookingEmailHandler({ allowedOrigins: [origin], authorizeStaff: async () => true, notify: async () => "pending" });
  const response = await handler(request({ booking_id: bookingId }, { authorization: "Bearer test-session" }));
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { notification_status: "pending" });
});

test("public intake rejects unknown, malformed, and oversized fields before any write or email", async () => {
  let writes = 0;
  let sends = 0;
  const handler = createBookingHandler(bookingDependencies({ createBooking: async () => { writes++; }, notify: async () => { sends++; } }));
  for (const bad of [{ ...input, to: "other@example.test" }, { ...input, status: "confirmed" }, { ...input, request_id: "not-a-uuid" }, { ...input, customer_email: "a@example.test\r\nBcc: b@example.test" }, { ...input, customer_name: "x".repeat(121) }, { ...input, booking_time: "10:61" }, { ...input, notes: "x".repeat(2001) }]) {
    assert.equal((await handler(request(bad))).status, 400);
  }
  assert.equal((await handler(request({ ...input, notes: "x".repeat(9000) }))).status, 413);
  assert.equal(writes, 0);
  assert.equal(sends, 0);
});

test("a half-hour schedule starting at :15 is checked against database availability", async () => {
  let receivedTime;
  const handler = createBookingHandler(bookingDependencies({ createBooking: async (_id, payload) => {
    receivedTime = payload.booking_time;
    return { booking_id: bookingId, status: "pending", replayed: false };
  } }));
  assert.equal((await handler(request({ ...input, booking_time: "09:15" }))).status, 201);
  assert.equal(receivedTime, "09:15");
});

test("public intake requires an allowlisted origin, JSON, POST, and valid JSON body", async () => {
  const handler = createBookingHandler(bookingDependencies());
  assert.equal((await handler(request(input, { origin: "https://untrusted.example" }))).status, 403);
  assert.equal((await handler(request(input, { origin: "null" }))).status, 403);
  assert.equal((await handler(request(input, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await handler(new Request("https://functions.example.test", { headers: { origin } }))).status, 405);
  assert.equal((await handler(new Request("https://functions.example.test", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{broken" }))).status, 400);
  const preflight = await handler(new Request("https://functions.example.test", { method: "OPTIONS", headers: { origin } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
});

test("a failed database booking never triggers an email, and internal errors stay private", async () => {
  let sends = 0;
  const handler = createBookingHandler(bookingDependencies({ createBooking: async () => { throw new Error("PRIVATE_DATABASE_OR_CREDENTIAL_DETAIL"); }, notify: async () => { sends++; } }));
  const response = await handler(request(input));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes("PRIVATE_"), false);
  assert.equal(sends, 0);
});

test("safe conflict and rate-limit errors preserve their response code", async () => {
  for (const status of [409, 429]) {
    const handler = createBookingHandler(bookingDependencies({ createBooking: async () => { throw new PublicError(status, "test_code", "Safe message"); } }));
    assert.equal((await handler(request(input))).status, status);
  }
});

test("notification failure leaves a committed booking successful and retryable", async () => {
  let passedId;
  const handler = createBookingHandler(bookingDependencies({ notify: async (id) => { passedId = id; throw new Error("PRIVATE_PROVIDER_DETAIL"); } }));
  const response = await handler(request(input));
  assert.equal(response.status, 201);
  assert.equal(passedId, bookingId);
  assert.deepEqual(await response.json(), { booking_id: bookingId, status: "pending", replayed: false, notification_status: "pending" });
});

test("request retries pass the same idempotency ID and return the original booking", async () => {
  let seen;
  const handler = createBookingHandler(bookingDependencies({ createBooking: async (id, payload, hash) => {
    seen = { id, payload, hash }; return { booking_id: bookingId, status: "pending", replayed: true };
  } }));
  const response = await handler(request(input));
  assert.equal(response.status, 200);
  assert.equal(seen.id, requestId);
  assert.equal(seen.payload.customer_email, input.customer_email);
  assert.match(seen.hash, /^[a-f0-9]{64}$/);
  assert.equal("request_id" in seen.payload, false);
});

test("untrusted forwarded IPs cannot rotate the fallback rate bucket", async () => {
  const one = request(input, { "x-forwarded-for": "192.0.2.1" });
  const two = request(input, { "x-forwarded-for": "192.0.2.2" });
  assert.equal(await hashClientAddress(one, "test-secret"), await hashClientAddress(two, "test-secret"));
  assert.notEqual(await hashClientAddress(one, "test-secret", "x-forwarded-for"), await hashClientAddress(two, "test-secret", "x-forwarded-for"));
});

test("notification retries use committed recipient, stable key, and independent durable channel claims", async () => {
  const sent = new Set();
  const delivered = [];
  let failAdmin = true;
  const dependencies = { emailConfig,
    claim: async (_id, channel) => sent.has(channel) ? { status: "sent" } : { status: "claimed", claim_id: `${channel}-claim`, booking: committed },
    finish: async (_id, channel, _claim, success) => { if (success) sent.add(channel); return true; },
    send: async (email, key) => { if (key.endsWith("/admin") && failAdmin) throw new Error("PRIVATE_PROVIDER_DETAIL"); delivered.push({ email, key }); },
  };
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "pending");
  failAdmin = false;
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "sent");
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "sent");
  assert.equal(delivered.length, 2);
  assert.deepEqual(delivered[0].email.to, [committed.customer_email]);
  assert.deepEqual(delivered[1].email.to, [emailConfig.admin]);
  assert.deepEqual(delivered.map(({ key }) => key), [`neoevo-booking/${bookingId}/customer`, `neoevo-booking/${bookingId}/admin`]);
});

test("busy and expired provider-idempotency windows cause no additional delivery", async () => {
  let sends = 0;
  const dependencies = { emailConfig, claim: async (_id, channel) => ({ status: channel === "customer" ? "busy" : "review_required" }), send: async () => { sends++; } };
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "pending");
  assert.equal(sends, 0);
});

test("an uncertain completion retries the same provider payload and key without a second delivery", async () => {
  const providerAccepted = new Map();
  const ledger = new Set();
  let completionUnavailable = true;
  let sendAttempts = 0;
  const dependencies = { emailConfig,
    claim: async (_id, channel) => ledger.has(channel) ? { status: "sent" } : { status: "claimed", claim_id: channel, booking: committed },
    send: async (email, key) => {
      sendAttempts++;
      if (providerAccepted.has(key)) assert.equal(JSON.stringify(email), providerAccepted.get(key));
      else providerAccepted.set(key, JSON.stringify(email));
    },
    finish: async (_id, channel, _claim, success) => {
      if (completionUnavailable) throw new Error("PRIVATE_DATABASE_ERROR");
      if (success) ledger.add(channel);
      return true;
    },
  };
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "pending");
  completionUnavailable = false;
  assert.equal(await deliverBookingNotifications(bookingId, dependencies), "sent");
  assert.equal(sendAttempts, 4);
  assert.equal(providerAccepted.size, 2);
});

test("emails escape stored HTML and ICS and support Unicode without leaking notes to customers", () => {
  const booking = { ...committed, customer_name: '<img src=x onerror="bad()"> José', service_name: "Service\r\nATTENDEE:bad@example.test;value\rATTENDEE:other@example.test", notes: "<script>private</script>" };
  const customer = buildEmail(booking, "customer", emailConfig);
  const admin = buildEmail(booking, "admin", emailConfig);
  assert.equal(customer.html.includes("<img"), false);
  assert.equal(customer.html.includes("private"), false);
  assert.equal(admin.html.includes("<script>"), false);
  assert.equal(admin.html.includes("&lt;script&gt;private&lt;/script&gt;"), true);
  const calendar = Buffer.from(customer.attachments[0].content, "base64").toString("utf8");
  assert.equal(calendar.includes("\r\nATTENDEE:"), false);
  assert.equal(calendar.includes("\rATTENDEE:"), false);
  assert.equal(calendar.includes("STATUS:TENTATIVE"), true);
  assert.equal(calendar.includes("TZID:America/New_York"), true);
});
