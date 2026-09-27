import { describe, expect, it } from "vitest";
import { readPublicConfig } from "../../src/lib/publicConfig";

describe("frontend credential boundary", () => {
  it("requires environment configuration", () => expect(() => readPublicConfig({})).toThrow(/Missing/));
  it("rejects secret keys", () => expect(() => readPublicConfig({ VITE_SUPABASE_URL: "https://example.invalid", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fake_test" })).toThrow(/Privileged/));
  it("rejects privileged legacy credentials", () => {
    const fake = "test." + btoa(JSON.stringify({ role: "service_role" })) + ".test";
    expect(() => readPublicConfig({ VITE_SUPABASE_URL: "https://example.invalid", VITE_SUPABASE_PUBLISHABLE_KEY: fake })).toThrow(/anonymous/);
  });
  it("accepts only public configuration", () => {
    expect(readPublicConfig({ VITE_SUPABASE_URL: "https://example.invalid", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fake_test" }).url).toBe("https://example.invalid");
  });
});
