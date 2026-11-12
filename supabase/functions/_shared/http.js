export class PublicError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function corsHeaders(request, allowedOrigins) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.includes(origin)) {
    throw new PublicError(403, "origin_denied", "This origin is not permitted.");
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}

export function jsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function errorResponse(error, headers = {}) {
  if (error instanceof PublicError) {
    return jsonResponse({ error: error.code, message: error.message }, error.status, headers);
  }
  // Never return database, provider, credential, or customer details.
  return jsonResponse({ error: "unavailable", message: "The service is temporarily unavailable." }, 503, headers);
}

export async function readJSON(request, maxBytes = 8192) {
  if (request.method !== "POST") {
    throw new PublicError(405, "method_not_allowed", "Use POST.");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new PublicError(415, "invalid_content_type", "Use application/json.");
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > maxBytes) throw new PublicError(413, "body_too_large", "The request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new PublicError(400, "invalid_request", "A JSON object is required.");
  let length = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new PublicError(413, "body_too_large", "The request is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new PublicError(400, "invalid_request", "A valid JSON object is required.");
  }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function exactKeys(body, allowed) {
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    throw new PublicError(400, "invalid_request", "The request contains unsupported fields.");
  }
}

function boundedText(value, max, required = false) {
  if (value == null && !required) return "";
  if (typeof value !== "string" || value.length > max || [...value].some((character) => {
    const code = character.charCodeAt(0);
    return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
  })) {
    throw new PublicError(400, "invalid_request", "A field has an invalid value.");
  }
  const text = value.trim();
  if (required && !text) throw new PublicError(400, "invalid_request", "A required field is missing.");
  return text;
}

export function validateBooking(body) {
  exactKeys(body, ["request_id", "service_id", "customer_name", "customer_email", "customer_phone", "booking_date", "booking_time", "notes"]);
  if (!UUID.test(body.request_id) || !UUID.test(body.service_id)) {
    throw new PublicError(400, "invalid_request", "Valid request and service identifiers are required.");
  }
  const customer_name = boundedText(body.customer_name, 120, true);
  const customer_email = boundedText(body.customer_email, 254, true).toLowerCase();
  const customer_phone = boundedText(body.customer_phone, 40);
  const notes = boundedText(body.notes, 2000);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(customer_email) || /[\r\n]/.test(customer_name + customer_phone)) {
    throw new PublicError(400, "invalid_request", "Contact details are invalid.");
  }
  if (typeof body.booking_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.booking_date) ||
      typeof body.booking_time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.booking_time)) {
    throw new PublicError(400, "invalid_request", "A valid booking date and time are required.");
  }
  // The database validates the real calendar date, local timezone, horizon,
  // service, opening hours, duplicate slot, and retry payload atomically.
  return {
    request_id: body.request_id,
    payload: { service_id: body.service_id, customer_name, customer_email, customer_phone,
      booking_date: body.booking_date, booking_time: body.booking_time, notes },
  };
}

export async function hashClientAddress(request, secret, trustedHeader = "") {
  if (!secret) throw new Error("Missing rate-limit configuration");
  // Configure a header ONLY after verifying that the trusted ingress overwrites
  // it. Never assume a caller-supplied X-Forwarded-For value is trustworthy.
  // Without that verified configuration all requests share one conservative bucket.
  const address = trustedHeader ? request.headers.get(trustedHeader) : null;
  const identifier = address && address.length <= 256 ? address.trim() : "unattributed";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`neoevo-booking-rate-limit-v1:${identifier}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
