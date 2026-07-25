import { describe, expect, it } from "vitest";

import { sanitizeProductDescription } from "@/lib/product-description";

describe("sanitizeProductDescription", () => {
  it("allows basic product html", () => {
    const html = "<p>Line<br>Important notes:</p>";
    expect(sanitizeProductDescription(html)).toContain("<p>");
  });

  it("strips script tags", () => {
    expect(
      sanitizeProductDescription('<script>alert(1)</script><p>Safe</p>'),
    ).not.toContain("script");
  });
});
