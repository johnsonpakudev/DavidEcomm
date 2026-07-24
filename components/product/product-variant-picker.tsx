"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/supabase/types";

interface ProductVariantPickerProps {
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export function ProductVariantPicker({
  variants,
  basePrice,
  baseSku,
  onVariantChange,
}: ProductVariantPickerProps) {
  const defaultVariant = useMemo(
    () => variants.find((variant) => variant.is_default) ?? variants[0] ?? null,
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? null,
  );

  if (variants.length === 0) {
    return null;
  }

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;

  function handleSelect(variant: ProductVariant) {
    setSelectedVariantId(variant.id);
    onVariantChange?.(variant);
  }

  const optionLabel =
    variants[0]?.option_type === "finish" ? "Finish" : "Option";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-tangaroa">
          {optionLabel}
        </p>
        {selectedVariant ? (
          <p className="text-sm text-slate-grey">{selectedVariant.name}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;

          return (
            <button
              key={variant.id}
              type="button"
              aria-label={`${optionLabel}: ${variant.name}`}
              aria-pressed={isSelected}
              disabled={!variant.in_stock}
              onClick={() => handleSelect(variant)}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors",
                isSelected
                  ? "border-inkjet ring-2 ring-inkjet/20"
                  : "border-saltwater hover:border-warm-stone-600",
                !variant.in_stock && "cursor-not-allowed opacity-40",
              )}
              style={
                variant.swatch_color
                  ? { backgroundColor: variant.swatch_color }
                  : undefined
              }
              title={variant.name}
            >
              {!variant.swatch_color ? variant.name : null}
            </button>
          );
        })}
      </div>
      <div className="text-sm text-slate-grey">
        <p>SKU: {selectedVariant?.sku ?? baseSku}</p>
        {!selectedVariant?.in_stock ? (
          <p className="mt-1 text-sale-red">Selected finish is currently unavailable.</p>
        ) : null}
      </div>
      <input type="hidden" name="variant_id" value={selectedVariant?.id ?? ""} />
      <input
        type="hidden"
        name="variant_price"
        value={selectedVariant?.price ?? basePrice}
      />
    </div>
  );
}
