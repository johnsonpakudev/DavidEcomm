"use client";

import Link from "next/link";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function CartPageContent() {
  const { items, isReady } = useCart();

  if (!isReady) {
    return <p className="text-slate-grey">Loading cart...</p>;
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-md border border-dashed border-saltwater bg-saltwater-50 p-10 text-center">
        <p className="brand-eyebrow-dark">Cart</p>
        <h1 className="mt-3 font-heading text-4xl text-tangaroa">Your cart is empty</h1>
        <p className="mt-4 text-base text-slate-grey">
          Browse the catalog and add products to start checkout.
        </p>
        <Button asChild className="gold-cta mt-6">
          <Link href="/">Continue shopping</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-saltwater bg-white p-6">
        <h1 className="font-heading text-4xl text-tangaroa">Your cart</h1>
        <div className="mt-6">
          {items.map((item) => (
            <CartLineItem
              key={`${item.productId}-${item.variantId ?? "base"}`}
              item={item}
            />
          ))}
        </div>
      </section>
      <CartSummary />
    </div>
  );
}
