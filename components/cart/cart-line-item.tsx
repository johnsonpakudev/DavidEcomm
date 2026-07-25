"use client";

import Image from "next/image";
import Link from "next/link";

import { PriceDisplay } from "@/components/product/price-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/lib/cart/types";
import { useCart } from "@/components/cart/cart-provider";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <article className="grid gap-4 border-b border-saltwater py-6 sm:grid-cols-[120px_1fr_auto]">
      <div className="relative aspect-square overflow-hidden rounded-md bg-saltwater-50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-grey">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <Link
            href={`/products/${item.slug}`}
            className="font-heading text-xl text-tangaroa hover:underline"
          >
            {item.name}
          </Link>
          {item.variantName ? (
            <p className="text-sm text-slate-grey">{item.variantName}</p>
          ) : null}
          <p className="text-xs uppercase tracking-[0.12em] text-slate-grey">
            SKU: {item.sku}
          </p>
        </div>
        <PriceDisplay cents={item.unitPriceCents} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-grey" htmlFor={`qty-${item.productId}`}>
            Qty
          </label>
          <Input
            id={`qty-${item.productId}`}
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) =>
              updateQuantity(
                item.productId,
                item.variantId,
                Number.parseInt(event.target.value, 10) || 1,
              )
            }
            className="h-10 w-20"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => removeItem(item.productId, item.variantId)}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="text-right">
        <PriceDisplay cents={item.unitPriceCents * item.quantity} className="text-xl" />
      </div>
    </article>
  );
}
