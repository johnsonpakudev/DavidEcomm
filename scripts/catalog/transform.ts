import groupOverridesJson from "@/scripts/catalog/product-groups.json";

import { applyBestSellerFallback } from "@/scripts/catalog/best-sellers";
import {
  buildCategoryTree,
  extractCollectionSlugs,
  pickPrimaryCategoryId,
} from "@/scripts/catalog/categories";
import {
  FINISH_TOKENS,
  groupRows,
  type GroupOverrides,
} from "@/scripts/catalog/grouping";
import { mapRowImages, mapRowSpecifications } from "@/scripts/catalog/map-row";
import type {
  CsvProductRow,
  ImportReport,
  NormalizedCatalog,
  NormalizedProduct,
  NormalizedVariant,
} from "@/scripts/catalog/types";
import { dedupeSlug, deterministicId, priceToCents, slugify } from "@/scripts/catalog/utils";

const overrides = groupOverridesJson as GroupOverrides;

function stripColourFromTitle(title: string): string {
  let name = title;

  for (const token of [...FINISH_TOKENS].sort((left, right) => right.length - left.length)) {
    name = name.replaceAll(token, "");
  }

  return name.replace(/\s+/g, " ").trim();
}

function mapRowAttributes(row: CsvProductRow): Record<string, string> {
  const attributes: Record<string, string> = {};

  if (row.Colour?.trim()) {
    attributes.colour = row.Colour.trim();
  }

  if (row["Product Weight"]?.trim()) {
    attributes.product_weight = row["Product Weight"].trim();
  }

  if (row["Shipping Length"]?.trim()) {
    attributes.shipping_length_cm = row["Shipping Length"].trim();
  }

  if (row["Shipping Width"]?.trim()) {
    attributes.shipping_width_cm = row["Shipping Width"].trim();
  }

  if (row["Shipping Height"]?.trim()) {
    attributes.shipping_height_cm = row["Shipping Height"].trim();
  }

  if (row["Shipping Package Type"]?.trim()) {
    attributes.package_type = row["Shipping Package Type"].trim();
  }

  return attributes;
}

function getBrand(row: CsvProductRow): string | null {
  return row["Specific Brand"]?.trim() || row.Vendor?.trim() || null;
}

function getGtin(row: CsvProductRow): string | null {
  return row["UPC Barcode"]?.trim() || null;
}

function buildVariant(
  row: CsvProductRow,
  productId: string,
  sortOrder: number,
  isDefault: boolean,
  report: ImportReport,
): NormalizedVariant {
  const colour = row.Colour?.trim() || "Default";
  const images = mapRowImages(row, productId);
  const swatchColor = overrides.swatchColors[colour] ?? null;

  if (colour !== "Default" && !swatchColor) {
    report.warnings.push(`Missing swatch color for finish "${colour}" (${row.SKU})`);
  }

  return {
    id: deterministicId("variant", row.SKU),
    sku: row.SKU,
    name: colour,
    option_type: "finish",
    option_value: colour,
    price: priceToCents(row.Price),
    image_url: images[0]?.url ?? null,
    swatch_color: swatchColor,
    is_default: isDefault,
    sort_order: sortOrder,
    sourceRow: row,
  };
}

function buildSearchTokens(product: NormalizedProduct): string {
  const parts = [
    product.name,
    product.brand ?? "",
    product.sku,
    ...product.variants.map((variant) => variant.sku),
    ...product.specifications.map((spec) => `${spec.label} ${spec.value}`),
  ];

  return parts.filter(Boolean).join(" ").toLowerCase();
}

function buildProductFromGroup(
  group: CsvProductRow[],
  categoryIdByPath: Map<string, string>,
  usedSlugs: Set<string>,
  report: ImportReport,
): NormalizedProduct {
  const isGrouped = group.length > 1;
  const sortedRows = [...group].sort((left, right) => left.SKU.localeCompare(right.SKU));
  const defaultRow = sortedRows[0]!;
  const name = isGrouped ? stripColourFromTitle(defaultRow.Title) : defaultRow.Title;
  const slug = dedupeSlug(slugify(name), usedSlugs);
  const productId = deterministicId("product", slug);

  let variants: NormalizedVariant[] = [];
  let price = priceToCents(defaultRow.Price);

  if (isGrouped) {
    variants = sortedRows.map((row, index) =>
      buildVariant(row, productId, index, index === 0, report),
    );
    price = Math.min(...variants.map((variant) => variant.price));
    report.variantsCreated += variants.length;
  }

  report.productsCreated += 1;

  return {
    id: productId,
    slug,
    name,
    description: defaultRow.Description?.trim() || null,
    price,
    category_id: pickPrimaryCategoryId(defaultRow.Tags, categoryIdByPath),
    sku: defaultRow.SKU,
    gtin: getGtin(defaultRow),
    brand: getBrand(defaultRow),
    attributes: mapRowAttributes(defaultRow),
    collection_slugs: extractCollectionSlugs(defaultRow.Tags),
    images: mapRowImages(defaultRow, productId),
    specifications: mapRowSpecifications(defaultRow, productId),
    variants,
    active: true,
  };
}

export function buildCatalogFromRows(rows: CsvProductRow[]): NormalizedCatalog {
  const report: ImportReport = {
    activeRows: rows.length,
    productsCreated: 0,
    variantsCreated: 0,
    categoriesCreated: 0,
    warnings: [],
    errors: [],
  };

  const { categories, categoryIdByPath } = buildCategoryTree(rows);
  report.categoriesCreated = categories.length;

  const groups = groupRows(rows, overrides);
  const usedSlugs = new Set<string>();
  const products: NormalizedProduct[] = [];

  for (const { rows: groupRowsForProduct } of groups) {
    try {
      products.push(
        buildProductFromGroup(groupRowsForProduct, categoryIdByPath, usedSlugs, report),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.errors.push(`Failed to build product: ${message}`);
    }
  }

  const searchIndex = products.map((product) => ({
    productId: product.id,
    slug: product.slug,
    tokens: buildSearchTokens(product),
  }));

  applyBestSellerFallback(products, report);

  return {
    categories,
    products,
    searchIndex,
    report,
  };
}
