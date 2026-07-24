"use client";

import { useMemo, useState } from "react";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductSpecifications } from "@/components/product/product-specifications";
import { ProductVariantPicker } from "@/components/product/product-variant-picker";
import { PriceDisplay } from "@/components/product/price-display";
import { StarRating } from "@/components/product/star-rating";
import { Button } from "@/components/ui/button";
import type { ProductDetail, ProductVariant } from "@/lib/supabase/types";

export function ProductDetailExperience({
  product,
}: {
  product: ProductDetail;
}) {
  const defaultVariant = useMemo(
    () =>
      product.variants.find((variant) => variant.is_default) ??
      product.variants[0] ??
      null,
    [product.variants],
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    defaultVariant,
  );

  const displayPrice = selectedVariant?.price ?? product.price;
  const galleryImages = useMemo(() => {
    if (!selectedVariant?.image_url || !product.product_images?.length) {
      return product.product_images ?? [];
    }

    return [
      {
        ...product.product_images[0],
        id: `${product.product_images[0].id}-${selectedVariant.id}`,
        url: selectedVariant.image_url,
        alt_text: `${product.name} — ${selectedVariant.name}`,
      },
      ...product.product_images.slice(1),
    ];
  }, [product.name, product.product_images, selectedVariant]);

  return (
    <>
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={galleryImages} />
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="brand-eyebrow-dark">{product.brand}</p>
            <h1 className="font-heading text-4xl text-tangaroa md:text-5xl">
              {product.name}
            </h1>
            <StarRating rating={product.rating} count={product.review_count} />
          </div>
          <PriceDisplay cents={displayPrice} className="text-3xl" />
          <ProductVariantPicker
            variants={product.variants}
            basePrice={product.price}
            baseSku={product.sku}
            onVariantChange={setSelectedVariant}
          />
          {product.attributes && Object.keys(product.attributes).length > 0 ? (
            <div className="space-y-3 border-y border-saltwater py-5 text-sm text-slate-grey">
              {Object.entries(product.attributes).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold uppercase tracking-[0.12em] text-tangaroa">
                    {key}:
                  </span>{" "}
                  {value}
                </p>
              ))}
            </div>
          ) : null}
          <p className="leading-7 text-slate-grey">{product.description}</p>
          <Button
            type="button"
            disabled
            className="gold-cta h-12 w-full rounded-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            Add to cart coming soon
          </Button>
          <ProductReviews
            reviews={product.reviews}
            rating={product.rating}
            reviewCount={product.review_count}
          />
        </div>
      </section>

      {product.specifications.length > 0 ? (
        <ProductSpecifications specifications={product.specifications} />
      ) : null}
    </>
  );
}
