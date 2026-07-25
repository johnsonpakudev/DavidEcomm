import type {
  Category,
  Product,
  ProductImage,
  ProductSpecification,
  ProductVariant,
} from "@/lib/supabase/types";

export interface CsvProductRow {
  SKU: string;
  Title: string;
  Description: string;
  Vendor: string;
  Tags: string;
  Price: string;
  Status: string;
  Colour: string;
  Warranty: string;
  [key: string]: string;
}

export interface NormalizedVariant {
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
  sourceRow: CsvProductRow;
}

export interface NormalizedProduct {
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
  variants: NormalizedVariant[];
  active: boolean;
}

export interface NormalizedCategory extends Category {}

export interface NormalizedCatalog {
  categories: NormalizedCategory[];
  products: NormalizedProduct[];
  searchIndex: Array<{
    productId: string;
    slug: string;
    tokens: string;
  }>;
  report: ImportReport;
}

export interface ImportReport {
  activeRows: number;
  productsCreated: number;
  variantsCreated: number;
  categoriesCreated: number;
  warnings: string[];
  errors: string[];
}
