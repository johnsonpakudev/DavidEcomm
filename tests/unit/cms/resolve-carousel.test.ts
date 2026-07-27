import { describe, expect, it } from "vitest";

import { DEFAULT_PRODUCT_CAROUSELS } from "@/lib/homepage/defaults";
import { getActiveCarousels } from "@/lib/homepage/resolve-carousel";

describe("resolve carousel helpers", () => {
  it("returns defaults when no active carousels are configured", () => {
    expect(getActiveCarousels([])).toEqual(DEFAULT_PRODUCT_CAROUSELS);
  });

  it("filters inactive carousels", () => {
    const active = getActiveCarousels([
      {
        ...DEFAULT_PRODUCT_CAROUSELS[0]!,
        active: false,
      },
      DEFAULT_PRODUCT_CAROUSELS[1]!,
    ]);

    expect(active).toHaveLength(1);
    expect(active[0]?.key).toBe("best-sellers");
  });
});
