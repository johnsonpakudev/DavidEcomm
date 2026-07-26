"use client";

import { forwardRef, useImperativeHandle } from "react";
import { AddressElement, useElements } from "@stripe/react-stripe-js";

import { Input } from "@/components/ui/input";
import type { ShippingAddress } from "@/lib/cart/types";
import { mapStripeAddressToShipping } from "@/lib/stripe/map-shipping-address";

export type ShippingFormHandle = {
  collectAddress: (
    email: string,
  ) => Promise<
    { ok: true; address: ShippingAddress } | { ok: false; error: string }
  >;
};

export const ShippingForm = forwardRef<
  ShippingFormHandle,
  {
    email: string;
    onEmailChange: (email: string) => void;
    defaultAddress?: ShippingAddress | null;
  }
>(function ShippingForm({ email, onEmailChange, defaultAddress }, ref) {
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    async collectAddress(emailValue: string) {
      if (!elements) {
        return { ok: false, error: "Address form is still loading. Please try again." };
      }

      const addressElement = elements.getElement(AddressElement);

      if (!addressElement) {
        return { ok: false, error: "Address form is unavailable." };
      }

      const { complete, value } = await addressElement.getValue();

      if (!complete) {
        return {
          ok: false,
          error: "Please select a complete delivery address from the suggestions.",
        };
      }

      const address = mapStripeAddressToShipping(emailValue, value);

      if (!address) {
        return {
          ok: false,
          error: "Please provide a complete Australian delivery address and phone number.",
        };
      }

      return { ok: true, address };
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-tangaroa" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-tangaroa">Delivery address</p>
        <p className="mb-4 text-sm text-slate-grey">
          Start typing your address and select a match to ensure correct delivery.
        </p>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["AU"],
            autocomplete: {
              mode: "automatic",
            },
            fields: {
              phone: "always",
            },
            validation: {
              phone: {
                required: "always",
              },
            },
            defaultValues: defaultAddress
              ? {
                  address: {
                    line1: defaultAddress.line1,
                    line2: defaultAddress.line2 ?? "",
                    city: defaultAddress.suburb,
                    state: defaultAddress.state,
                    postal_code: defaultAddress.postcode,
                    country: "AU",
                  },
                  phone: defaultAddress.phone,
                }
              : undefined,
          }}
        />
      </div>
    </div>
  );
});
