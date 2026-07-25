"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

export function CartNavLink() {
  const { itemCount, isReady } = useCart();

  return (
    <Button asChild variant="ghost" size="icon" aria-label="Cart">
      <Link href="/cart" className="relative">
        <ShoppingCart className="size-5" />
        {isReady && itemCount > 0 ? (
          <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-inkjet px-1 text-[10px] text-white">
            {itemCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
