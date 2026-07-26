"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { stripeAppearance, stripePromise } from "@/lib/stripe/browser";

function PaymentStepForm({
  orderId,
  returnUrl,
}: {
  orderId: string;
  returnUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${returnUrl}/checkout/confirmation/${orderId}`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="gold-cta h-12 w-full rounded-full"
      >
        {isSubmitting ? "Processing..." : "Place order"}
      </Button>
    </form>
  );
}

export function PaymentForm({
  clientSecret,
  orderId,
  returnUrl,
}: {
  clientSecret: string;
  orderId: string;
  returnUrl: string;
}) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-slate-grey">
        Stripe is not configured. Add your publishable key to continue.
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: stripeAppearance,
      }}
    >
      <PaymentStepForm orderId={orderId} returnUrl={returnUrl} />
    </Elements>
  );
}
