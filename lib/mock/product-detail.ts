import type {
  Product,
  ProductDetail,
  ProductRelationType,
  ProductReview,
  ProductSpecification,
  ProductVariant,
} from "@/lib/supabase/types";
import { mockProducts } from "@/lib/mock/data";

const serraProductId = "prod-serra-basin-mixer";

export const mockProductVariants: ProductVariant[] = [
  {
    id: "var-serra-brass",
    product_id: serraProductId,
    sku: "BDK-BBM-BB",
    name: "Brushed Brass",
    option_type: "finish",
    option_value: "Brushed Brass",
    price: 42900,
    compare_at_price: null,
    image_url:
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80",
    swatch_color: "#C7B8A3",
    stock_quantity: 18,
    in_stock: true,
    is_default: true,
    sort_order: 0,
    active: true,
  },
  {
    id: "var-serra-black",
    product_id: serraProductId,
    sku: "BDK-BBM-MB",
    name: "Matte Black",
    option_type: "finish",
    option_value: "Matte Black",
    price: 44900,
    compare_at_price: null,
    image_url:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    swatch_color: "#1E2B3B",
    stock_quantity: 12,
    in_stock: true,
    is_default: false,
    sort_order: 1,
    active: true,
  },
  {
    id: "var-serra-chrome",
    product_id: serraProductId,
    sku: "BDK-BBM-CH",
    name: "Chrome",
    option_type: "finish",
    option_value: "Chrome",
    price: 39900,
    compare_at_price: null,
    image_url:
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80",
    swatch_color: "#C0CFDD",
    stock_quantity: 24,
    in_stock: true,
    is_default: false,
    sort_order: 2,
    active: true,
  },
  {
    id: "var-serra-gold",
    product_id: serraProductId,
    sku: "BDK-BBM-BG",
    name: "Brushed Gold",
    option_type: "finish",
    option_value: "Brushed Gold",
    price: 45900,
    compare_at_price: null,
    image_url:
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80",
    swatch_color: "#AB9678",
    stock_quantity: 9,
    in_stock: true,
    is_default: false,
    sort_order: 3,
    active: true,
  },
];

export const mockProductSpecifications: ProductSpecification[] = [
  {
    id: "spec-serra-1",
    product_id: serraProductId,
    group_name: "General",
    label: "Brand",
    value: "BDK Supply",
    sort_order: 0,
  },
  {
    id: "spec-serra-2",
    product_id: serraProductId,
    group_name: "General",
    label: "Installation",
    value: "Deck mounted",
    sort_order: 1,
  },
  {
    id: "spec-serra-3",
    product_id: serraProductId,
    group_name: "Performance",
    label: "WELS rating",
    value: "5 star / 5.5L per min",
    sort_order: 2,
  },
  {
    id: "spec-serra-4",
    product_id: serraProductId,
    group_name: "Dimensions",
    label: "Height",
    value: "145mm",
    sort_order: 3,
  },
  {
    id: "spec-serra-5",
    product_id: serraProductId,
    group_name: "Warranty",
    label: "Manufacturer warranty",
    value: "15 years",
    sort_order: 4,
  },
];

export const mockProductReviews: ProductReview[] = [
  {
    id: "review-serra-1",
    product_id: serraProductId,
    rating: 5,
    title: "Beautiful finish",
    body: "The brushed brass looks even better in person. Solid feel and smooth operation.",
    author_name: "Sarah M.",
    verified_purchase: true,
    published: true,
    created_at: "2026-06-12T10:00:00.000Z",
  },
  {
    id: "review-serra-2",
    product_id: serraProductId,
    rating: 5,
    title: "Perfect for our ensuite",
    body: "Installed easily and matches our other brass fixtures perfectly.",
    author_name: "James T.",
    verified_purchase: true,
    published: true,
    created_at: "2026-05-28T14:30:00.000Z",
  },
  {
    id: "review-serra-3",
    product_id: serraProductId,
    rating: 4,
    title: "Great quality tap",
    body: "Lovely design and good water flow. Took a week to arrive but worth the wait.",
    author_name: "Emma L.",
    verified_purchase: true,
    published: true,
    created_at: "2026-05-03T09:15:00.000Z",
  },
];

const mockRelationMap: Record<
  string,
  Partial<Record<ProductRelationType, string[]>>
> = {
  [serraProductId]: {
    cross_sell: [
      "prod-mila-vessel-basin",
      "prod-knurled-brass-double-towel-rail",
    ],
    related: ["prod-lucent-shower-rail", "prod-lumen-backlit-led-mirror"],
  },
};

export function getMockProductDetail(product: Product): ProductDetail {
  const variants =
    product.id === serraProductId || product.slug === "serra-brushed-brass-basin-mixer"
      ? mockProductVariants
      : [];

  const specifications =
    product.id === serraProductId || product.slug === "serra-brushed-brass-basin-mixer"
      ? mockProductSpecifications
      : [];

  const reviews =
    product.id === serraProductId || product.slug === "serra-brushed-brass-basin-mixer"
      ? mockProductReviews
      : [];

  const relations = mockRelationMap[product.id] ?? {};

  const crossSellProducts = (relations.cross_sell ?? [])
    .map((id) => mockProducts.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Product => Boolean(candidate));

  const relatedProducts = (relations.related ?? [])
    .map((id) => mockProducts.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Product => Boolean(candidate));

  return {
    ...product,
    variants,
    specifications,
    reviews,
    crossSellProducts,
    relatedProducts,
  };
}

export function getMockProductDetailBySlug(slug: string) {
  const product = mockProducts.find((candidate) => candidate.slug === slug);

  if (!product) {
    return null;
  }

  return getMockProductDetail(product);
}
