import { createClient } from "@supabase/supabase-js";
import { PublicError } from "./http.js";
import { deliverBookingNotifications } from "./notifications.js";
import { authorizeStaffToken } from "./auth.js";

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error("Missing server configuration");
  return value;
}

function serverKey(group: string, legacy: string): string {
  const keys = Deno.env.get(group);
  if (keys) {
    const key = JSON.parse(keys).default;
    if (typeof key === "string" && key) return key;
  }
  return required(legacy);
}

function allowedOrigins(): string[] {
  const origins = required("ALLOWED_ORIGINS").split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => {
    const parsed = new URL(origin);
    const localHTTP = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
    return parsed.origin !== origin || (parsed.protocol !== "https:" && !localHTTP);
  })) throw new Error("Invalid origin configuration");
  return origins;
}

function bookingError(error: { code?: string }): never {
  if (["PT409", "23505"].includes(error.code ?? "")) throw new PublicError(409, "booking_conflict", "This time or request is no longer available.");
  if (error.code === "PT429") throw new PublicError(429, "booking_rate_limited", "Too many booking requests. Please try again later.");
  if (["PT400", "22023", "22007", "22008", "22P02", "23503", "23514"].includes(error.code ?? "")) {
    throw new PublicError(400, "invalid_booking", "The booking details are invalid.");
  }
  throw new Error("Booking request failed");
}

export function runtimeDependencies() {
  const url = required("SUPABASE_URL");
  const publicKey = serverKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
  const privilegedKey = serverKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  // Never returned to the browser. Staff authorization precedes privileged RPCs.
  const admin = createClient(url, privilegedKey, options);
  const emailConfig = {
    from: Deno.env.get("BOOKING_EMAIL_FROM") || "NeoEvo <info@neoevo.io>",
    admin: Deno.env.get("BOOKING_EMAIL_ADMIN") || "info@neoevo.io",
  };
  const notifications = {
    emailConfig,
    async claim(bookingId: string, channel: string) {
      const { data, error } = await admin.rpc("claim_booking_notification", { p_booking_id: bookingId, p_channel: channel });
      if (error) throw new Error("Notification unavailable");
      return data;
    },
    async finish(bookingId: string, channel: string, claimId: string, success: boolean) {
      const { data, error } = await admin.rpc("complete_booking_notification", {
        p_booking_id: bookingId, p_channel: channel, p_claim_id: claimId, p_success: success,
      });
      if (error) throw new Error("Notification unavailable");
      return data === true;
    },
    async send(email: object, idempotencyKey: string) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${required("RESEND_API_KEY")}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(email),
        signal: AbortSignal.timeout(10000),
      });
      // Provider responses can contain recipient details; never return or log them.
      await response.body?.cancel();
      if (!response.ok) throw new Error("Notification delivery unavailable");
    },
  };
  return {
    allowedOrigins: allowedOrigins(),
    rateLimitSecret: Deno.env.get("BOOKING_RATE_LIMIT_SECRET") || privilegedKey,
    trustedIPHeader: Deno.env.get("BOOKING_CLIENT_IP_HEADER") || "",
    async createBooking(requestId: string, payload: object, ipHash: string) {
      const { data, error } = await admin.rpc("create_public_booking", { p_request_id: requestId, p_payload: payload, p_ip_hash: ipHash });
      if (error) bookingError(error);
      return data;
    },
    async authorizeStaff(token: string) {
      const userClient = createClient(url, publicKey, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
      return authorizeStaffToken(token, userClient);
    },
    notify: (bookingId: string) => deliverBookingNotifications(bookingId, notifications),
  };
}
