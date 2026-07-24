export type NavPillarKey =
  | "bathroom"
  | "doors-hardware"
  | "kitchen-laundry";

export type ProductBadge = "best_seller" | "new" | "sale" | null;

export type ProductRelationType = "related" | "cross_sell" | "upsell";

export type ProductReviewSource =
  | "native"
  | "import"
  | "google"
  | "trustpilot"
  | "yotpo"
  | "feefo"
  | "productreview"
  | "manual";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  nav_pillar: NavPillarKey | null;
  icon_key: string | null;
  mega_menu_image: string | null;
  mega_menu_order: number;
  show_in_mega_menu: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  option_type: string;
  option_value: string;
  price: number | null;
  compare_at_price: number | null;
  image_url: string | null;
  swatch_color: string | null;
  stock_quantity: number;
  in_stock: boolean;
  is_default: boolean;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  group_name: string | null;
  label: string;
  value: string;
  sort_order: number;
}

export interface ProductRelation {
  id: string;
  product_id: string;
  related_product_id: string;
  relation_type: ProductRelationType;
  sort_order: number;
  created_at?: string;
  related_product?: Product | null;
}

export interface ProductReview {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  verified_purchase: boolean;
  published: boolean;
  source: ProductReviewSource;
  external_id: string | null;
  source_url: string | null;
  imported_at: string | null;
  author_location: string | null;
  locale: string;
  include_in_rating: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sku: string;
  gtin: string | null;
  brand: string | null;
  attributes: Record<string, string>;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  stock_quantity?: number;
  in_stock: boolean;
  active: boolean;
  featured: boolean;
  badge: ProductBadge;
  collection_slugs: string[];
  rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string;
  product_images?: ProductImage[];
  categories?: Category | null;
  product_variants?: ProductVariant[];
  product_specifications?: ProductSpecification[];
  product_reviews?: ProductReview[];
}

export interface ProductDetail extends Product {
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  reviews: ProductReview[];
  crossSellProducts: Product[];
  relatedProducts: Product[];
}

export interface HomepageHero {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
  sort_order: number;
  active?: boolean;
}

export interface HomepagePromo {
  id: string;
  eyebrow: string | null;
  headline: string;
  subtext: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string | null;
  active?: boolean;
}

export interface HomepageCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string;
  cta_text: string;
  sort_order: number;
}

export interface InspirationImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  active?: boolean;
}

export interface FooterLink {
  id: string;
  column_name: string;
  label: string;
  href: string;
  sort_order: number;
}

export interface SiteConfig {
  promo_text: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  trading_hours: string | null;
  social_links: Record<string, string>;
}

export interface NavigationPillar {
  slug: NavPillarKey;
  label: string;
  category: Category;
  children: Category[];
}

export interface SearchResult {
  query: string;
  products: Product[];
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
      };
      products: {
        Row: Product;
      };
      product_images: {
        Row: ProductImage;
      };
      product_variants: {
        Row: ProductVariant;
      };
      product_specifications: {
        Row: ProductSpecification;
      };
      product_relations: {
        Row: ProductRelation;
      };
      product_reviews: {
        Row: ProductReview;
      };
      homepage_heroes: {
        Row: HomepageHero;
      };
      homepage_promos: {
        Row: HomepagePromo;
      };
      homepage_collections: {
        Row: HomepageCollection;
      };
      inspiration_images: {
        Row: InspirationImage;
      };
      footer_links: {
        Row: FooterLink;
      };
      site_config: {
        Row: SiteConfig & { id?: number };
      };
    };
  };
}
