import Link from "next/link";

import { CartPageContent } from "@/components/cart/cart-page-content";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { isCheckoutEnabled } from "@/lib/config/features";

export default function CartPage() {
  if (!isCheckoutEnabled()) {
    return (
      <div className="section-space">
        <div className="site-shell space-y-8">
          <Breadcrumbs items={[{ label: "Cart" }]} />
          <section className="mx-auto max-w-3xl rounded-md border border-dashed border-saltwater bg-saltwater-50 p-10 text-center">
            <p className="brand-eyebrow-dark">Cart</p>
            <h1 className="mt-3 font-heading text-4xl text-tangaroa">Your cart is empty</h1>
            <p className="mt-4 text-base text-slate-grey">
              Checkout is intentionally disabled in Phase 1 while we focus on catalog discovery and merchandising.
            </p>
            <Button asChild className="gold-cta mt-6">
              <Link href="/">Continue shopping</Link>
            </Button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <CartPageContent />
      </div>
    </div>
  );
}
