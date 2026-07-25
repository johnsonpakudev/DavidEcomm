import { describe, expect, it } from "vitest";

import { parseCatalogCsv } from "@/scripts/catalog/parse-csv";
import { buildCatalogFromRows } from "@/scripts/catalog/transform";

describe("buildCatalogFromRows", () => {
  it("builds products with unique slugs and variant skus", () => {
    const rows = parseCatalogCsv().slice(0, 50);
    const catalog = buildCatalogFromRows(rows);
    const slugs = catalog.products.map((product) => product.slug);
    const skus = catalog.products.flatMap((product) =>
      product.variants.length > 0
        ? product.variants.map((variant) => variant.sku)
        : [product.sku],
    );

    expect(catalog.products.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
  });
});
