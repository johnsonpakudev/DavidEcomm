import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ProductBadge } from "@/lib/supabase/types";

import type {
  NormalizedCatalog,
  NormalizedCategory,
  NormalizedProduct,
  NormalizedVariant,
} from "@/scripts/catalog/types";

const OUTPUT_DIR = "supabase";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function resolveBadge(collectionSlugs: string[]): ProductBadge {
  if (collectionSlugs.includes("clearance")) {
    return "sale";
  }

  return null;
}

function pickDollarTag(value: string, prefix: string): string {
  let tag = prefix;
  let counter = 0;

  while (value.includes(`$${tag}$`)) {
    counter += 1;
    tag = `${prefix}${counter}`;
  }

  return tag;
}

function sqlLiteral(value: string | null): string {
  if (value === null) {
    return "null";
  }

  const tag = pickDollarTag(value, "v");
  return `$${tag}$${value}$${tag}$`;
}

function sqlBoolean(value: boolean): string {
  return value ? "true" : "false";
}

function sqlJson(value: unknown): string {
  return sqlLiteral(JSON.stringify(value));
}

function sqlTextArray(values: string[]): string {
  if (values.length === 0) {
    return "array[]::text[]";
  }

  return `array[${values.map((value) => sqlLiteral(value)).join(", ")}]::text[]`;
}

function sortCategories(categories: NormalizedCategory[]): NormalizedCategory[] {
  const byId = new Map(categories.map((category) => [category.id, category]));

  function depth(category: NormalizedCategory): number {
    let current = category;
    let level = 0;

    while (current.parent_id) {
      const parent = byId.get(current.parent_id);
      if (!parent) {
        break;
      }

      current = parent;
      level += 1;
    }

    return level;
  }

  return [...categories].sort((left, right) => {
    const depthDiff = depth(left) - depth(right);

    if (depthDiff !== 0) {
      return depthDiff;
    }

    return left.mega_menu_order - right.mega_menu_order;
  });
}

function buildCategoryInsert(categories: NormalizedCategory[]): string {
  if (categories.length === 0) {
    return "";
  }

  const values = sortCategories(categories)
    .map(
      (category) =>
        `(${[
          sqlLiteral(category.id),
          sqlLiteral(category.name),
          sqlLiteral(category.slug),
          category.parent_id ? sqlLiteral(category.parent_id) : "null",
          category.nav_pillar ? sqlLiteral(category.nav_pillar) : "null",
          category.icon_key ? sqlLiteral(category.icon_key) : "null",
          category.mega_menu_image ? sqlLiteral(category.mega_menu_image) : "null",
          String(category.mega_menu_order),
          sqlBoolean(category.show_in_mega_menu),
          category.meta_title ? sqlLiteral(category.meta_title) : "null",
          category.meta_description ? sqlLiteral(category.meta_description) : "null",
        ].join(", ")})`,
    )
    .join(",\n  ");

  return `insert into categories (
  id, name, slug, parent_id, nav_pillar, icon_key, mega_menu_image,
  mega_menu_order, show_in_mega_menu, meta_title, meta_description
) values
  ${values};`;
}

function buildProductInsert(products: NormalizedProduct[]): string {
  if (products.length === 0) {
    return "";
  }

  const values = products
    .map((product) => {
      const badge = resolveBadge(product.collection_slugs);
      const featured = product.collection_slugs.includes("featured");

      return `(${[
        sqlLiteral(product.id),
        sqlLiteral(product.name),
        sqlLiteral(product.slug),
        product.description ? sqlLiteral(product.description) : "null",
        String(product.price),
        product.category_id ? sqlLiteral(product.category_id) : "null",
        sqlLiteral(product.sku),
        product.gtin ? sqlLiteral(product.gtin) : "null",
        product.brand ? sqlLiteral(product.brand) : "null",
        sqlJson(product.attributes),
        "null",
        "null",
        product.images[0]?.url ? sqlLiteral(product.images[0].url) : "null",
        sqlBoolean(true),
        sqlBoolean(product.active),
        sqlBoolean(featured),
        badge ? sqlLiteral(badge) : "null",
        sqlTextArray(product.collection_slugs),
        "0",
        "0",
      ].join(", ")})`;
    })
    .join(",\n  ");

  return `insert into products (
  id, name, slug, description, price, category_id, sku, gtin, brand, attributes,
  meta_title, meta_description, og_image_url, in_stock, active, featured, badge,
  collection_slugs, rating, review_count
) values
  ${values};`;
}

function buildImageInsert(products: NormalizedProduct[]): string {
  const images = products.flatMap((product) => product.images);

  if (images.length === 0) {
    return "";
  }

  const values = images
    .map(
      (image) =>
        `(${[
          sqlLiteral(image.id),
          sqlLiteral(image.product_id),
          sqlLiteral(image.url),
          sqlLiteral(image.alt_text),
          String(image.sort_order),
        ].join(", ")})`,
    )
    .join(",\n  ");

  return `insert into product_images (id, product_id, url, alt_text, sort_order) values
  ${values};`;
}

function buildVariantInsert(products: NormalizedProduct[]): string {
  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({ productId: product.id, variant })),
  );

  if (variants.length === 0) {
    return "";
  }

  const values = variants
    .map(({ productId, variant }) => buildVariantValue(productId, variant))
    .join(",\n  ");

  return `insert into product_variants (
  id, product_id, sku, name, option_type, option_value, price, compare_at_price,
  image_url, swatch_color, stock_quantity, in_stock, is_default, sort_order, active
) values
  ${values};`;
}

function buildVariantValue(productId: string, variant: NormalizedVariant): string {
  return `(${[
    sqlLiteral(variant.id),
    sqlLiteral(productId),
    sqlLiteral(variant.sku),
    sqlLiteral(variant.name),
    sqlLiteral(variant.option_type),
    sqlLiteral(variant.option_value),
    String(variant.price),
    "null",
    variant.image_url ? sqlLiteral(variant.image_url) : "null",
    variant.swatch_color ? sqlLiteral(variant.swatch_color) : "null",
    "0",
    sqlBoolean(true),
    sqlBoolean(variant.is_default),
    String(variant.sort_order),
    sqlBoolean(true),
  ].join(", ")})`;
}

function buildSpecificationInsert(products: NormalizedProduct[]): string {
  const specifications = products.flatMap((product) => product.specifications);

  if (specifications.length === 0) {
    return "";
  }

  const values = specifications
    .map(
      (spec) =>
        `(${[
          sqlLiteral(spec.id),
          sqlLiteral(spec.product_id),
          spec.group_name ? sqlLiteral(spec.group_name) : "null",
          sqlLiteral(spec.label),
          sqlLiteral(spec.value),
          String(spec.sort_order),
        ].join(", ")})`,
    )
    .join(",\n  ");

  return `insert into product_specifications (
  id, product_id, group_name, label, value, sort_order
) values
  ${values};`;
}

function buildStatements(catalog: NormalizedCatalog): string[] {
  const statements: string[] = [];
  const { categories, products } = catalog;

  const categoryInsert = buildCategoryInsert(categories);
  if (categoryInsert) {
    statements.push(categoryInsert);
  }

  const batchSize = 100;

  for (let index = 0; index < products.length; index += batchSize) {
    const batch = products.slice(index, index + batchSize);

    for (const builder of [
      buildProductInsert,
      buildImageInsert,
      buildVariantInsert,
      buildSpecificationInsert,
    ]) {
      const statement = builder(batch);
      if (statement) {
        statements.push(statement);
      }
    }
  }

  return statements;
}

function writeSqlFiles(statements: string[]): string[] {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const preamble = [
    "-- Generated by npm run catalog:build",
    "-- Do not edit manually",
    "begin;",
    "truncate product_specifications, product_variants, product_images, products, categories cascade;",
    "",
  ].join("\n");
  const footer = "\ncommit;\n";

  const files: string[] = [];
  let currentBody = "";
  let partIndex = 0;
  let isFirstFile = true;

  function flush(isFinal: boolean): void {
    if (!currentBody.trim()) {
      return;
    }

    partIndex += 1;
    const filename =
      partIndex === 1 ? "seed_catalog.sql" : `seed_catalog_part${partIndex}.sql`;
    const filepath = join(OUTPUT_DIR, filename);
    const prefix = isFirstFile ? `${preamble}\n` : "";
    const suffix = isFinal ? footer : "";
    const content = `${prefix}${currentBody}${suffix}`;

    writeFileSync(filepath, content, "utf8");
    files.push(filepath);
    currentBody = "";
    isFirstFile = false;
  }

  for (const statement of statements) {
    const nextBody = currentBody ? `${currentBody}\n${statement}\n` : `${statement}\n`;
    const prefix = isFirstFile ? `${preamble}\n` : "";
    const projectedSize = Buffer.byteLength(`${prefix}${nextBody}`, "utf8");

    if (currentBody && projectedSize > MAX_FILE_BYTES) {
      flush(false);
    }

    currentBody = nextBody;
  }

  flush(true);
  return files;
}

export function exportCatalogSql(catalog: NormalizedCatalog): string[] {
  return writeSqlFiles(buildStatements(catalog));
}
