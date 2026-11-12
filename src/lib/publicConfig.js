export function readPublicConfig(env) {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing public Supabase configuration. Set the documented frontend variables.");
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error("Invalid public Supabase URL."); }
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) {
    throw new Error("Public Supabase configuration requires HTTPS.");
  }
  if (key.startsWith("sb_secret_")) throw new Error("Privileged credentials must never be included in the frontend.");
  if (!key.startsWith("sb_publishable_")) {
    let claims;
    try {
      const payload = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      claims = JSON.parse(atob(payload));
    } catch { throw new Error("Use a Supabase publishable key or legacy anonymous key."); }
    if (claims.role !== "anon") throw new Error("Only a public anonymous key is allowed in the frontend.");
  }
  return { url, key };
}
