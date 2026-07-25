import { beforeEach, describe, expect, it } from "vitest";

import { clearJsonCatalogCache } from "@/lib/catalog/loader";
import { getProductBySlug } from "@/lib/products";

describe("getProductBySlug", () => {
  beforeEach(() => {
    clearJsonCatalogCache();
    process.env.CATALOG_SOURCE = "auto";
  });

  it("finds a BDK catalog product by slug", async () => {
    const slug =
      "package-deal-windsor-600mm-bathroom-vanity-wash-basin-including-mixer-plugwaste";
    const product = await getProductBySlug(slug);

    expect(product).not.toBeNull();
    expect(product?.slug).toBe(slug);
  });
});
