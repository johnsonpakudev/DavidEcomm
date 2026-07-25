import { describe, expect, it } from "vitest";

import { deterministicId, priceToCents, slugify } from "@/scripts/catalog/utils";

describe("priceToCents", () => {
  it("converts dollar strings to integer cents", () => {
    expect(priceToCents("1692.42")).toBe(169242);
    expect(priceToCents("6.09")).toBe(609);
  });

  it("throws on invalid prices", () => {
    expect(() => priceToCents("")).toThrow();
    expect(() => priceToCents("-1")).toThrow();
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Wall Hung Vanities")).toBe("wall-hung-vanities");
  });
});

describe("deterministicId", () => {
  it("returns stable uuid-shaped ids", () => {
    const a = deterministicId("product", "vellena-1500-vanity");
    const b = deterministicId("product", "vellena-1500-vanity");
    expect(a).toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
