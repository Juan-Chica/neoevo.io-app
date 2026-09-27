import { PublicError, corsHeaders, errorResponse, exactKeys, hashClientAddress, jsonResponse, readJSON, UUID, validateBooking } from "./http.js";

function prepare(request, dependencies) {
  return corsHeaders(request, dependencies.allowedOrigins);
}

export function createBookingHandler(dependencies) {
  return async (request) => {
    let headers = {};
    try {
      headers = prepare(request, dependencies);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
      const { request_id, payload } = validateBooking(await readJSON(request));
      const ipHash = await hashClientAddress(request, dependencies.rateLimitSecret, dependencies.trustedIPHeader);
      const result = await dependencies.createBooking(request_id, payload, ipHash);
      if (!result?.booking_id || result.status !== "pending") throw new Error("Invalid booking result");
      let notification_status = "pending";
      try { notification_status = await dependencies.notify(result.booking_id); } catch { /* the committed booking remains successful */ }
      return jsonResponse({ booking_id: result.booking_id, status: result.status, replayed: !!result.replayed, notification_status }, result.replayed ? 200 : 201, headers);
    } catch (error) {
      return errorResponse(error, headers);
    }
  };
}

export function retryBookingEmailHandler(dependencies) {
  return async (request) => {
    let headers = {};
    try {
      headers = prepare(request, dependencies);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
      if (request.method !== "POST") throw new PublicError(405, "method_not_allowed", "Use POST.");
      const authorization = request.headers.get("authorization");
      const token = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
      if (!token || !(await dependencies.authorizeStaff(token))) {
        throw new PublicError(403, "staff_required", "Staff authorization is required.");
      }
      const body = await readJSON(request, 1024);
      exactKeys(body, ["booking_id"]);
      if (!UUID.test(body.booking_id)) throw new PublicError(400, "invalid_request", "A valid booking identifier is required.");
      const notification_status = await dependencies.notify(body.booking_id);
      return jsonResponse({ notification_status }, notification_status === "sent" ? 200 : 202, headers);
    } catch (error) {
      return errorResponse(error, headers);
    }
  };
}
