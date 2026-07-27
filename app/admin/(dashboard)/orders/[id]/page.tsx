import Link from "next/link";
import { notFound } from "next/navigation";

import { formatAudPrice } from "@/components/product/price-display";
import { getAdminOrderById } from "@/lib/admin/orders";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const address = order.shipping_address as Record<string, string>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/orders" className="text-sm font-semibold text-tangaroa">
          ← Back to orders
        </Link>
        <h1 className="mt-4 font-heading text-4xl text-tangaroa">
          Order {order.id.slice(0, 8)}
        </h1>
        <p className="mt-2 text-sm text-slate-grey">
          Placed {formatDate(order.created_at)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-grey">
            Customer
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-slate-grey">Email</dt>
              <dd className="font-semibold text-tangaroa">{order.guest_email}</dd>
            </div>
            <div>
              <dt className="text-slate-grey">Phone</dt>
              <dd>{order.guest_phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-grey">Status</dt>
              <dd className="capitalize">{order.status}</dd>
            </div>
            {order.stripe_payment_intent_id ? (
              <div>
                <dt className="text-slate-grey">Stripe</dt>
                <dd>
                  <a
                    href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                    className="font-semibold text-tangaroa hover:text-warm-stone-600"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View payment
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-grey">
            Shipping
          </h2>
          <address className="mt-4 space-y-1 text-sm not-italic text-tangaroa">
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>
              {address.suburb} {address.state} {address.postcode}
            </p>
          </address>
        </section>
      </div>

      <section className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-warm-stone-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-grey">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <p className="font-semibold text-tangaroa">{item.product_name}</p>
                  {item.variant_name ? (
                    <p className="text-slate-grey">{item.variant_name}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{item.sku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatAudPrice(item.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-grey">Subtotal</dt>
            <dd>{formatAudPrice(order.subtotal_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-grey">Shipping</dt>
            <dd>{formatAudPrice(order.shipping_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-grey">Tax</dt>
            <dd>{formatAudPrice(order.tax_cents ?? 0)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-tangaroa">
            <dt>Total</dt>
            <dd>{formatAudPrice(order.total_cents)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
