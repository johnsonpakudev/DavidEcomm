"use client";

import { PriceDisplay } from "@/components/product/price-display";
import type { CartItem, CheckoutEstimate } from "@/lib/cart/types";

export function OrderReview({
  items,
  estimate,
}: {
  items: CartItem[];
  estimate: CheckoutEstimate;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex items-start justify-between gap-4 border-b border-saltwater pb-4"
          >
            <div>
              <p className="font-semibold text-tangaroa">{item.name}</p>
              {item.variantName ? (
                <p className="text-sm text-slate-grey">{item.variantName}</p>
              ) : null}
              <p className="text-sm text-slate-grey">Qty {item.quantity}</p>
            </div>
            <PriceDisplay cents={item.unitPriceCents * item.quantity} />
          </div>
        ))}
      </div>
      <dl className="space-y-3 rounded-md border border-saltwater bg-saltwater-50 p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-grey">Subtotal</dt>
          <dd>
            <PriceDisplay cents={estimate.subtotal_cents} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-grey">Estimated shipping ({estimate.zone})</dt>
          <dd>
            <PriceDisplay cents={estimate.shipping_cents} />
          </dd>
        </div>
        <div className="flex justify-between border-t border-saltwater pt-3 text-base font-semibold text-tangaroa">
          <dt>Total due today</dt>
          <dd>
            <PriceDisplay cents={estimate.total_cents} className="text-2xl" />
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-6 text-slate-grey">{estimate.disclaimer}</p>
      <label className="flex items-center gap-3 text-sm text-slate-grey">
        <input type="checkbox" disabled className="size-4 rounded border-saltwater" />
        Create an account after checkout (coming soon)
      </label>
    </div>
  );
}
