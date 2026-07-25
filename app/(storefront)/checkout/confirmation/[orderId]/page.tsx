import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClearCartOnConfirmation } from "@/components/checkout/clear-cart-on-confirmation";
import { PriceDisplay } from "@/components/product/price-display";
import { Button } from "@/components/ui/button";
import { isCheckoutEnabled } from "@/lib/config/features";
import { getOrderById } from "@/lib/checkout/get-order";

export default async function CheckoutConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  if (!isCheckoutEnabled()) {
    notFound();
  }

  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const address = order.shipping_address;

  return (
    <div className="section-space">
      <ClearCartOnConfirmation />
      <div className="site-shell space-y-8">
        <Breadcrumbs
          items={[
            { label: "Checkout", href: "/checkout" },
            { label: "Confirmation" },
          ]}
        />
        <section className="mx-auto max-w-3xl space-y-8 rounded-md border border-saltwater bg-white p-8">
          <div className="space-y-3 text-center">
            <p className="brand-eyebrow-dark">Order confirmed</p>
            <h1 className="font-heading text-4xl text-tangaroa">Thank you for your order</h1>
            <p className="text-slate-grey">
              {order.status === "paid"
                ? "Your payment was received successfully."
                : "Your payment is being processed. We will email you once it is confirmed."}
            </p>
          </div>

          <dl className="grid gap-3 rounded-md bg-saltwater-50 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-grey">Order reference</dt>
              <dd className="font-semibold text-tangaroa">{order.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-grey">Email</dt>
              <dd>{order.guest_email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-grey">Shipping zone</dt>
              <dd className="capitalize">{order.shipping_zone ?? "Estimated"}</dd>
            </div>
          </dl>

          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-tangaroa">Items</h2>
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-saltwater pb-4"
              >
                <div>
                  <p className="font-semibold text-tangaroa">{item.product_name}</p>
                  {item.variant_name ? (
                    <p className="text-sm text-slate-grey">{item.variant_name}</p>
                  ) : null}
                  <p className="text-sm text-slate-grey">Qty {item.quantity}</p>
                </div>
                <PriceDisplay cents={item.unit_price * item.quantity} />
              </div>
            ))}
          </div>

          <dl className="space-y-3 border-t border-saltwater pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-grey">Subtotal</dt>
              <dd>
                <PriceDisplay cents={order.subtotal_cents} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-grey">Estimated shipping</dt>
              <dd>
                <PriceDisplay cents={order.shipping_cents} />
              </dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-tangaroa">
              <dt>Total paid</dt>
              <dd>
                <PriceDisplay cents={order.total_cents} className="text-2xl" />
              </dd>
            </div>
          </dl>

          <div className="rounded-md bg-saltwater-50 p-5 text-sm text-slate-grey">
            <p className="font-semibold text-tangaroa">Delivery address</p>
            <p className="mt-2">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.suburb}{" "}
              {address.state} {address.postcode}
            </p>
            <p className="mt-4">{order.shipping_disclaimer}</p>
          </div>

          <Button asChild className="gold-cta h-12 w-full rounded-full">
            <Link href="/">Continue shopping</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
