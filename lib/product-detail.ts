import { unstable_cache } from "next/cache";

import {
  getMockProductDetail,
  getMockProductDetailBySlug,
} from "@/lib/mock/product-detail";
import { prefersJsonCatalog } from "@/lib/catalog/source";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductDetail,
  ProductRelationType,
  ProductReview,
  ProductSpecification,
  ProductVariant,
} from "@/lib/supabase/types";

async function fetchVariants(productId: string) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return null;
  }

  return data as ProductVariant[];
}

async function fetchSpecifications(productId: string) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("product_specifications")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    return null;
  }

  return data as ProductSpecification[];
}

async function fetchReviews(productId: string) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  return data as ProductReview[];
}

async function fetchRelatedProducts(
  productId: string,
  relationType: ProductRelationType,
) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data: relations, error: relationsError } = await supabase
    .from("product_relations")
    .select("related_product_id, sort_order")
    .eq("product_id", productId)
    .eq("relation_type", relationType)
    .order("sort_order", { ascending: true });

  if (relationsError || !relations?.length) {
    return relationsError ? null : [];
  }

  const relatedIds = (relations as Array<{ related_product_id: string }>).map(
    (relation) => relation.related_product_id,
  );

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .in("id", relatedIds)
    .eq("active", true);

  if (productsError || !products) {
    return null;
  }

  const typedProducts = products as Product[];
  const productMap = new Map(
    typedProducts.map((product) => [product.id, product]),
  );

  return relatedIds
    .map((id) => productMap.get(id))
    .filter((product): product is Product => Boolean(product));
}

function buildProductDetail(
  product: Product,
  variants: ProductVariant[],
  specifications: ProductSpecification[],
  reviews: ProductReview[],
  crossSellProducts: Product[],
  relatedProducts: Product[],
): ProductDetail {
  return {
    ...product,
    variants,
    specifications,
    reviews,
    crossSellProducts,
    relatedProducts,
  };
}

async function buildJsonProductDetail(product: Product): Promise<ProductDetail> {
  const variants = product.product_variants ?? [];
  const specifications = product.product_specifications ?? [];
  const relatedProducts = await getRelatedProducts(product);

  return buildProductDetail(product, variants, specifications, [], [], relatedProducts);
}

export async function getProductDetailBySlug(slug: string) {
  const product = await getProductBySlug(slug);

  if (!product) {
    return null;
  }

  if (prefersJsonCatalog()) {
    return buildJsonProductDetail(product);
  }

  const supabase = createPublicClient();

  if (!supabase) {
    return buildJsonProductDetail(product);
  }

  const [variants, specifications, reviews, crossSellProducts, relatedProducts] =
    await Promise.all([
      fetchVariants(product.id),
      fetchSpecifications(product.id),
      fetchReviews(product.id),
      fetchRelatedProducts(product.id, "cross_sell"),
      fetchRelatedProducts(product.id, "related"),
    ]);

  return buildProductDetail(
    product,
    variants ?? [],
    specifications ?? [],
    reviews ?? [],
    crossSellProducts ?? [],
    relatedProducts ?? [],
  );
}

export function getCachedProductDetailBySlug(slug: string) {
  if (prefersJsonCatalog()) {
    return getProductDetailBySlug(slug);
  }

  return unstable_cache(
    async () => getProductDetailBySlug(slug),
    [`product-detail-${slug}`],
    {
      revalidate: 300,
      tags: [`product-${slug}`, `product-detail-${slug}`],
    },
  )();
}

export async function getProductDetailBySlugForMock(slug: string) {
  return getMockProductDetailBySlug(slug);
}
