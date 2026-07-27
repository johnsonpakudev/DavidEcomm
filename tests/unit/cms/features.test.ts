import { describe, expect, it } from "vitest";

import { isAdminEnabled, isCmsEnabled } from "@/lib/config/features";

describe("feature flags", () => {
  it("disables CMS by default", () => {
    const original = process.env.ENABLE_CMS;
    delete process.env.ENABLE_CMS;
    expect(isCmsEnabled()).toBe(false);
    process.env.ENABLE_CMS = original;
  });

  it("enables CMS when flag is true", () => {
    const original = process.env.ENABLE_CMS;
    process.env.ENABLE_CMS = "true";
    expect(isCmsEnabled()).toBe(true);
    process.env.ENABLE_CMS = original;
  });

  it("disables admin by default", () => {
    const original = process.env.ENABLE_ADMIN;
    delete process.env.ENABLE_ADMIN;
    expect(isAdminEnabled()).toBe(false);
    process.env.ENABLE_ADMIN = original;
  });
});
