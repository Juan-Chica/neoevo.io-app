import { createBookingHandler } from "../_shared/handlers.js";
import { errorResponse } from "../_shared/http.js";
import { runtimeDependencies } from "../_shared/runtime.ts";

Deno.serve(async (request: Request) => {
  try {
    return await createBookingHandler(runtimeDependencies())(request);
  } catch {
    return errorResponse(new Error("Server configuration unavailable"));
  }
});
