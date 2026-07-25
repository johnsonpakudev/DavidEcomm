import { describe, expect, it } from "vitest";

import { hasJsonCatalog, useJsonCatalog } from "@/lib/catalog/source";

describe("catalog source", () => {
  it("detects the built BDK catalog", () => {
    expect(hasJsonCatalog()).toBe(true);
  });

  it("prefers json catalog in auto mode when file exists", () => {
    const original = process.env.CATALOG_SOURCE;
    process.env.CATALOG_SOURCE = "auto";
    expect(useJsonCatalog()).toBe(true);
    process.env.CATALOG_SOURCE = original;
  });

  it("uses supabase when explicitly configured", () => {
    const original = process.env.CATALOG_SOURCE;
    process.env.CATALOG_SOURCE = "supabase";
    expect(useJsonCatalog()).toBe(false);
    process.env.CATALOG_SOURCE = original;
  });
});
