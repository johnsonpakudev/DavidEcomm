import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  Category,
  Product,
  ProductBadge,
  ProductImage,
  ProductSpecification,
  ProductVariant,
} from "@/lib/supabase/types";

const CATALOG_DIR = join(process.cwd(), "public/data/catalog");

interface JsonCatalogVariant {
  id: string;
  sku: string;
  name: string;
  option_type: string;
  option_value: string;
  price: number;
  image_url: string | null;
  swatch_color: string | null;
  is_default: boolean;
  sort_order: number;
}

interface JsonCatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sku: string;
  gtin: string | null;
  brand: string | null;
  attributes: Record<string, string>;
  collection_slugs: string[];
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: JsonCatalogVariant[];
  active: boolean;
}

export interface JsonSearchIndexEntry {
  productId: string;
  slug: string;
  tokens: string;
}

let categoriesCache: Category[] | null = null;
let productsCache: Product[] | null = null;
let searchIndexCache: JsonSearchIndexEntry[] | null = null;

function readCatalogJson<T>(filename: string): T {
  const content = readFileSync(join(CATALOG_DIR, filename), "utf8");
  return JSON.parse(content) as T;
}

function resolveBadge(collectionSlugs: string[]): ProductBadge {
  if (collectionSlugs.includes("clearance")) {
    return "sale";
  }

  return null;
}

function mapVariant(productId: string, variant: JsonCatalogVariant): ProductVariant {
  return {
    id: variant.id,
    product_id: productId,
    sku: variant.sku,
    name: variant.name,
    option_type: variant.option_type,
    option_value: variant.option_value,
    price: variant.price,
    compare_at_price: null,
    image_url: variant.image_url,
    swatch_color: variant.swatch_color,
    stock_quantity: 0,
    in_stock: true,
    is_default: variant.is_default,
    sort_order: variant.sort_order,
    active: true,
  };
}

function mapJsonProduct(raw: JsonCatalogProduct, categoryById: Map<string, Category>): Product {
  const productImages = raw.images;
  const productVariants = raw.variants.map((variant) => mapVariant(raw.id, variant));
  const productSpecifications = raw.specifications;
  const category = raw.category_id ? categoryById.get(raw.category_id) ?? null : null;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    price: raw.price,
    category_id: raw.category_id,
    sku: raw.sku,
    gtin: raw.gtin,
    brand: raw.brand,
    attributes: raw.attributes,
    meta_title: null,
    meta_description: null,
    og_image_url: productImages[0]?.url ?? null,
    in_stock: true,
    active: raw.active,
    featured: raw.collection_slugs.includes("featured"),
    badge: resolveBadge(raw.collection_slugs),
    collection_slugs: raw.collection_slugs,
    rating: 0,
    review_count: 0,
    product_images: productImages,
    categories: category,
    product_variants: productVariants,
    product_specifications: productSpecifications,
  };
}

export async function getJsonCategories(): Promise<Category[]> {
  if (categoriesCache) {
    return categoriesCache;
  }

  categoriesCache = readCatalogJson<Category[]>("categories.json");
  return categoriesCache;
}

export async function getJsonProducts(): Promise<Product[]> {
  if (productsCache) {
    return productsCache;
  }

  const [categories, rawProducts] = await Promise.all([
    getJsonCategories(),
    Promise.resolve(readCatalogJson<JsonCatalogProduct[]>("products.json")),
  ]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  productsCache = rawProducts.map((product) => mapJsonProduct(product, categoryById));
  return productsCache;
}

export async function getJsonSearchIndex(): Promise<JsonSearchIndexEntry[]> {
  if (searchIndexCache) {
    return searchIndexCache;
  }

  searchIndexCache = readCatalogJson<JsonSearchIndexEntry[]>("search-index.json");
  return searchIndexCache;
}

export function clearJsonCatalogCache(): void {
  categoriesCache = null;
  productsCache = null;
  searchIndexCache = null;
}
