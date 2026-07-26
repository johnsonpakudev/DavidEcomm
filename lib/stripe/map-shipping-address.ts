import type { StripeAddressElementChangeEvent } from "@stripe/stripe-js";

import type { ShippingAddress } from "@/lib/cart/types";

type StripeAddressValue = StripeAddressElementChangeEvent["value"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidCheckoutEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function mapStripeAddressToShipping(
  email: string,
  value: StripeAddressValue,
): ShippingAddress | null {
  const trimmedEmail = email.trim();

  if (!isValidCheckoutEmail(trimmedEmail)) {
    return null;
  }

  const { address, phone } = value;
  const line1 = address.line1?.trim();
  const suburb = address.city?.trim();
  const state = address.state?.trim();
  const postcode = address.postal_code?.trim();
  const phoneNumber = phone?.trim();

  if (!line1 || !suburb || !state || !postcode || !phoneNumber) {
    return null;
  }

  if (address.country && address.country !== "AU") {
    return null;
  }

  if (!/^\d{4}$/.test(postcode)) {
    return null;
  }

  return {
    email: trimmedEmail,
    phone: phoneNumber,
    line1,
    line2: address.line2?.trim() || "",
    suburb,
    state,
    postcode,
  };
}
