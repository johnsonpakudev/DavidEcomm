"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { OrderReview } from "@/components/checkout/order-review";
import { PaymentForm } from "@/components/checkout/payment-form";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { Button } from "@/components/ui/button";
import type { CheckoutEstimate, ShippingAddress } from "@/lib/cart/types";
import { track } from "@/lib/analytics/track";

const EMPTY_ADDRESS: ShippingAddress = {
  email: "",
  phone: "",
  line1: "",
  line2: "",
  suburb: "",
  state: "",
  postcode: "",
};

export function CheckoutWizard({ siteUrl }: { siteUrl: string }) {
  const router = useRouter();
  const { items, subtotalCents, itemCount, isReady } = useCart();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [estimate, setEstimate] = useState<CheckoutEstimate | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isReady && items.length === 0) {
      router.replace("/cart");
    }
  }, [isReady, items.length, router]);

  useEffect(() => {
    if (items.length > 0) {
      void track("begin_checkout", {
        cart_value: subtotalCents / 100,
        item_count: itemCount,
      });
    }
  }, [itemCount, items.length, subtotalCents]);

  const cartPayload = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    [items],
  );

  async function handleEstimateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const response = await fetch("/api/shipping/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartPayload,
        postcode: address.postcode,
        state: address.state,
      }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setErrorMessage(data?.error ?? "Unable to calculate shipping.");
      return;
    }

    setEstimate(data as CheckoutEstimate);
    setStep(2);
  }

  async function handleContinueToPayment() {
    setIsLoading(true);
    setErrorMessage(null);

    const response = await fetch("/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartPayload,
        shippingAddress: address,
      }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setErrorMessage(data?.error ?? "Unable to start payment.");
      return;
    }

    setClientSecret(data.clientSecret);
    setOrderId(data.orderId);
    setStep(3);
  }

  if (!isReady) {
    return <p className="text-slate-grey">Loading checkout...</p>;
  }

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-3 text-sm uppercase tracking-[0.16em] text-slate-grey">
        {["Details", "Review", "Payment"].map((label, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isComplete = step > stepNumber;

          return (
            <li
              key={label}
              className={
                isActive || isComplete
                  ? "font-semibold text-tangaroa"
                  : undefined
              }
            >
              {stepNumber}. {label}
            </li>
          );
        })}
      </ol>

      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleEstimateSubmit} className="space-y-6">
          <div>
            <p className="brand-eyebrow-dark">Step 1</p>
            <h2 className="font-heading text-3xl text-tangaroa">Delivery details</h2>
          </div>
          <ShippingForm value={address} onChange={setAddress} />
          <Button
            type="submit"
            disabled={isLoading}
            className="gold-cta h-12 rounded-full px-8"
          >
            {isLoading ? "Calculating..." : "Continue to review"}
          </Button>
        </form>
      ) : null}

      {step === 2 && estimate ? (
        <div className="space-y-6">
          <div>
            <p className="brand-eyebrow-dark">Step 2</p>
            <h2 className="font-heading text-3xl text-tangaroa">Review your order</h2>
          </div>
          <OrderReview items={items} estimate={estimate} />
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              className="gold-cta h-12 rounded-full px-8"
              onClick={handleContinueToPayment}
            >
              {isLoading ? "Preparing payment..." : "Continue to payment"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && clientSecret && orderId ? (
        <div className="space-y-6">
          <div>
            <p className="brand-eyebrow-dark">Step 3</p>
            <h2 className="font-heading text-3xl text-tangaroa">Payment</h2>
          </div>
          <PaymentForm
            clientSecret={clientSecret}
            orderId={orderId}
            returnUrl={siteUrl}
          />
          <Button type="button" variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
        </div>
      ) : null}
    </div>
  );
}
