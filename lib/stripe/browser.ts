import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";

export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export const stripeAppearance: NonNullable<StripeElementsOptions["appearance"]> = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0b1f33",
  },
};

export function checkoutElementsOptions(amountCents: number): StripeElementsOptions {
  return {
    mode: "payment",
    amount: Math.max(amountCents, 100),
    currency: "aud",
    appearance: stripeAppearance,
  };
}
