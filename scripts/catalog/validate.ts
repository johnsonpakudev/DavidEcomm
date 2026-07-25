import type { NormalizedCatalog } from "@/scripts/catalog/types";

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return [...duplicates];
}

export function validateCatalog(catalog: NormalizedCatalog): void {
  if (catalog.products.length === 0) {
    throw new Error("Catalog validation failed: zero products");
  }

  const slugs = catalog.products.map((product) => product.slug);
  const duplicateSlugs = duplicateValues(slugs);

  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Catalog validation failed: duplicate product slugs (${duplicateSlugs.join(", ")})`,
    );
  }

  const skus = catalog.products.flatMap((product) =>
    product.variants.length > 0
      ? product.variants.map((variant) => variant.sku)
      : [product.sku],
  );
  const duplicateSkus = duplicateValues(skus);

  if (duplicateSkus.length > 0) {
    throw new Error(
      `Catalog validation failed: duplicate SKUs (${duplicateSkus.slice(0, 10).join(", ")}${duplicateSkus.length > 10 ? ", ..." : ""})`,
    );
  }

  for (const product of catalog.products) {
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new Error(`Catalog validation failed: invalid price on product ${product.slug}`);
    }

    for (const variant of product.variants) {
      if (!Number.isFinite(variant.price) || variant.price < 0) {
        throw new Error(`Catalog validation failed: invalid price on variant ${variant.sku}`);
      }
    }
  }
}
