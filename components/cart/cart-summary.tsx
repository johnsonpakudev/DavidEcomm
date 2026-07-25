"use client";

import Link from "next/link";

import { PriceDisplay } from "@/components/product/price-display";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

export function CartSummary({ checkoutHref = "/checkout" }: { checkoutHref?: string }) {
  const { subtotalCents, itemCount } = useCart();

  return (
    <aside className="rounded-md border border-saltwater bg-saltwater-50 p-6">
      <h2 className="font-heading text-2xl text-tangaroa">Order summary</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-grey">Items ({itemCount})</dt>
          <dd>
            <PriceDisplay cents={subtotalCents} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-grey">Shipping</dt>
          <dd className="text-slate-grey">Calculated at checkout</dd>
        </div>
      </dl>
      <div className="mt-6 flex items-center justify-between border-t border-saltwater pt-4">
        <span className="font-semibold text-tangaroa">Subtotal</span>
        <PriceDisplay cents={subtotalCents} className="text-2xl" />
      </div>
      <Button asChild className="gold-cta mt-6 h-12 w-full rounded-full">
        <Link href={checkoutHref}>Proceed to checkout</Link>
      </Button>
    </aside>
  );
}
