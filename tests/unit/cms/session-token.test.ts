import { describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  timingSafeEqualStrings,
} from "@/lib/admin/session-token";

describe("admin session token", () => {
  it("creates a stable hex token", async () => {
    process.env.ADMIN_SESSION_SECRET = "test-session-secret-32-characters";

    const token = await createAdminSessionToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(await createAdminSessionToken()).toBe(token);
  });

  it("compares strings in constant time", () => {
    expect(timingSafeEqualStrings("abc", "abc")).toBe(true);
    expect(timingSafeEqualStrings("abc", "abd")).toBe(false);
    expect(timingSafeEqualStrings("abc", "abcd")).toBe(false);
  });
});
