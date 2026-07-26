import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { buildHomepageManifest } from "@/scripts/catalog/homepage";
import type {
  NormalizedCatalog,
  NormalizedProduct,
  NormalizedVariant,
} from "@/scripts/catalog/types";

const OUTPUT_DIR = "public/data/catalog";

type ExportedVariant = Omit<NormalizedVariant, "sourceRow">;

function serializeVariant(variant: NormalizedVariant): ExportedVariant {
  const { sourceRow: _sourceRow, ...exported } = variant;
  return exported;
}

function serializeProduct(product: NormalizedProduct) {
  return {
    ...product,
    variants: product.variants.map(serializeVariant),
  };
}

export function exportCatalogJson(catalog: NormalizedCatalog): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const homepage = buildHomepageManifest({
    products: catalog.products,
    categories: catalog.categories,
    report: catalog.report,
  });

  writeFileSync(
    join(OUTPUT_DIR, "products.json"),
    `${JSON.stringify(catalog.products.map(serializeProduct), null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(OUTPUT_DIR, "categories.json"),
    `${JSON.stringify(catalog.categories, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(OUTPUT_DIR, "search-index.json"),
    `${JSON.stringify(catalog.searchIndex, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(OUTPUT_DIR, "homepage.json"),
    `${JSON.stringify(homepage, null, 2)}\n`,
    "utf8",
  );
}
