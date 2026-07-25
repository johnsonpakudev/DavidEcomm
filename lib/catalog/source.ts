import { existsSync } from "node:fs";
import { join } from "node:path";

const CATALOG_PRODUCTS_PATH = join(
  process.cwd(),
  "public/data/catalog/products.json",
);

export function hasJsonCatalog(): boolean {
  return existsSync(CATALOG_PRODUCTS_PATH);
}

/** When true, products and categories load from the BDK CSV export, not Supabase seed data. */
export function useJsonCatalog(): boolean {
  const source = process.env.CATALOG_SOURCE ?? "auto";

  if (source === "supabase") {
    return false;
  }

  if (source === "json") {
    return hasJsonCatalog();
  }

  // auto: prefer the built BDK catalog whenever it exists
  return hasJsonCatalog();
}
