import bestSellerConfig from "@/scripts/catalog/best-sellers.json";

import type { ImportReport, NormalizedProduct } from "@/scripts/catalog/types";

interface BestSellerPattern {
  sku?: string;
  nameIncludes?: string;
}

function matchesPattern(product: NormalizedProduct, pattern: BestSellerPattern): boolean {
  if (pattern.sku && product.sku === pattern.sku) {
    return true;
  }

  if (pattern.nameIncludes) {
    return product.name.includes(pattern.nameIncludes);
  }

  return false;
}

export function applyBestSellerFallback(
  products: NormalizedProduct[],
  report: ImportReport,
): void {
  const patterns = bestSellerConfig.patterns as BestSellerPattern[];

  for (const pattern of patterns) {
    const match = products.find((product) => matchesPattern(product, pattern));

    if (!match) {
      const label = pattern.sku ?? pattern.nameIncludes ?? "unknown";
      report.warnings.push(`Best-seller pattern not found in catalog: ${label}`);
      continue;
    }

    if (!match.collection_slugs.includes("best-sellers")) {
      match.collection_slugs = [...match.collection_slugs, "best-sellers"].sort();
    }
  }
}
