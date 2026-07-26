import { describe, expect, it } from "vitest";

import {
  isValidCheckoutEmail,
  mapStripeAddressToShipping,
} from "@/lib/stripe/map-shipping-address";

describe("mapStripeAddressToShipping", () => {
  it("maps a complete Australian Stripe address value", () => {
    const address = mapStripeAddressToShipping("buyer@example.com", {
      name: "Jane Doe",
      phone: "0412345678",
      address: {
        line1: "1 Martin Place",
        line2: "Level 10",
        city: "Sydney",
        state: "NSW",
        postal_code: "2000",
        country: "AU",
      },
    });

    expect(address).toEqual({
      email: "buyer@example.com",
      phone: "0412345678",
      line1: "1 Martin Place",
      line2: "Level 10",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
    });
  });

  it("rejects incomplete addresses", () => {
    expect(
      mapStripeAddressToShipping("buyer@example.com", {
        name: "Jane Doe",
        phone: "",
        address: {
          line1: "1 Martin Place",
          line2: null,
          city: "Sydney",
          state: "NSW",
          postal_code: "2000",
          country: "AU",
        },
      }),
    ).toBeNull();
  });

  it("rejects non-Australian countries", () => {
    expect(
      mapStripeAddressToShipping("buyer@example.com", {
        name: "Jane Doe",
        phone: "5551234567",
        address: {
          line1: "123 Main St",
          line2: null,
          city: "New York",
          state: "NY",
          postal_code: "10001",
          country: "US",
        },
      }),
    ).toBeNull();
  });
});

describe("isValidCheckoutEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidCheckoutEmail("buyer@example.com")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidCheckoutEmail("not-an-email")).toBe(false);
  });
});
