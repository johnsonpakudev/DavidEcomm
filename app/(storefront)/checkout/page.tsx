import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { isCheckoutEnabled } from "@/lib/config/features";

export default function CheckoutPage() {
  if (!isCheckoutEnabled()) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <section className="mx-auto max-w-3xl rounded-md border border-saltwater bg-white p-8">
          <div className="mb-8">
            <p className="brand-eyebrow-dark">Checkout</p>
            <h1 className="font-heading text-4xl text-tangaroa">Secure checkout</h1>
          </div>
          <CheckoutWizard siteUrl={siteUrl} />
        </section>
      </div>
    </div>
  );
}
