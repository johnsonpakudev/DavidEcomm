import { describe, expect, it } from "vitest";

import { applyBestSellerFallback } from "@/scripts/catalog/best-sellers";
import { buildHomepageManifest } from "@/scripts/catalog/homepage";
import { parseCatalogCsv } from "@/scripts/catalog/parse-csv";
import { buildCatalogFromRows } from "@/scripts/catalog/transform";
import type { ImportReport, NormalizedProduct } from "@/scripts/catalog/types";

function emptyReport(): ImportReport {
  return {
    activeRows: 0,
    productsCreated: 0,
    variantsCreated: 0,
    categoriesCreated: 0,
    warnings: [],
    errors: [],
  };
}

describe("applyBestSellerFallback", () => {
  it("adds best-sellers slug to matched products", () => {
    const products: NormalizedProduct[] = [
      {
        id: "p1",
        slug: "ivana-600",
        name: "Ivana 600mm PVC Water Proof Bathroom Vanity Cabinet",
        description: null,
        price: 10000,
        category_id: null,
        sku: "IVAPVC60",
        gtin: null,
        brand: "Baiachi",
        attributes: {},
        collection_slugs: [],
        images: [
          {
            id: "img-1",
            product_id: "p1",
            url: "https://cdn.shopify.com/example.png",
            alt_text: "Ivana vanity",
            sort_order: 0,
          },
        ],
        specifications: [],
        variants: [],
        active: true,
      },
    ];

    const report = emptyReport();
    applyBestSellerFallback(products, report);

    expect(products[0]?.collection_slugs).toContain("best-sellers");
  });
});

describe("buildHomepageManifest", () => {
  it("builds catalog-driven homepage content without unsplash urls", () => {
    const catalog = buildCatalogFromRows(parseCatalogCsv().slice(0, 250));

    const manifest = buildHomepageManifest({
      products: catalog.products,
      categories: catalog.categories,
      report: catalog.report,
    });

    const serialized = JSON.stringify(manifest);

    expect(manifest.heroes.length).toBeGreaterThan(0);
    expect(manifest.collections.map((item) => item.slug)).toEqual([
      "featured",
      "clearance",
      "bundle-deals",
    ]);
    expect(manifest.categoryShortcuts.length).toBeGreaterThan(0);
    expect(manifest.inspiration.length).toBeGreaterThan(0);
    expect(serialized).not.toContain("unsplash.com");
    expect(serialized).toContain("cdn.shopify.com");
  });

  it("uses BDK brand messaging on the primary hero slide", () => {
    const catalog = buildCatalogFromRows(parseCatalogCsv().slice(0, 250));
    const manifest = buildHomepageManifest({
      products: catalog.products,
      categories: catalog.categories,
      report: catalog.report,
    });

    expect(manifest.heroes[0]?.headline).toMatch(/direct from the manufacturer/i);
  });
});
