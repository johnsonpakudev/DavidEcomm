import Link from "next/link";

import { formatAudPrice } from "@/components/product/price-display";
import { listAdminOrders } from "@/lib/admin/orders";
import type { OrderRecord } from "@/lib/supabase/types";

const STATUS_TABS: Array<{ label: string; value: OrderRecord["status"] | "all" }> =
  [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    email?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status =
    STATUS_TABS.find((tab) => tab.value === params.status)?.value ?? "all";
  const page = Number(params.page ?? "1");
  const { orders, total, pageSize } = await listAdminOrders({
    status,
    email: params.email,
    page: Number.isFinite(page) ? page : 1,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-4xl text-tangaroa">Orders</h1>
          <p className="mt-2 text-sm text-slate-grey">
            {total} order{total === 1 ? "" : "s"} total
          </p>
        </div>
        <form className="flex gap-2">
          <input
            type="search"
            name="email"
            defaultValue={params.email ?? ""}
            placeholder="Search email"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="rounded-md bg-tangaroa px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/orders?status=${tab.value}${
              params.email ? `&email=${encodeURIComponent(params.email)}` : ""
            }`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              status === tab.value
                ? "bg-tangaroa text-white"
                : "bg-white text-tangaroa ring-1 ring-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-warm-stone-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-grey">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-grey">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-t border-gray-100 ${
                    order.isStalePending ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-tangaroa hover:text-warm-stone-600"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-grey">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">{order.guest_email}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatAudPrice(order.total_cents)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-grey">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/orders?status=${status}&page=${page - 1}${
                  params.email
                    ? `&email=${encodeURIComponent(params.email)}`
                    : ""
                }`}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/orders?status=${status}&page=${page + 1}${
                  params.email
                    ? `&email=${encodeURIComponent(params.email)}`
                    : ""
                }`}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
