import { describe, expect, it } from "vitest";

import {
  clearJsonCatalogCache,
  getJsonCategories,
  getJsonProducts,
} from "@/lib/catalog/loader";

describe("catalog loader", () => {
  it("loads generated categories and products", async () => {
    clearJsonCatalogCache();

    const [categories, products] = await Promise.all([
      getJsonCategories(),
      getJsonProducts(),
    ]);

    expect(categories.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.product_images?.length).toBeGreaterThan(0);
  });

  it("maps json variants and specifications to product fields", async () => {
    clearJsonCatalogCache();

    const products = await getJsonProducts();
    const groupedProduct = products.find(
      (product) => (product.product_variants?.length ?? 0) > 1,
    );

    expect(groupedProduct).toBeDefined();
    expect(groupedProduct?.product_variants?.[0]?.product_id).toBe(groupedProduct?.id);
    expect((groupedProduct?.product_specifications?.length ?? 0)).toBeGreaterThan(0);
  });
});
