import { describe, expect, it } from "vitest";

import {
  billableWeightKg,
  estimateShipping,
  resolveZoneSlug,
} from "@/lib/shipping/estimate";

const zones = [
  {
    slug: "metro",
    postcodeRanges: [{ from: 2000, to: 2234 }],
  },
  {
    slug: "regional",
    postcodeRanges: [{ from: 200, to: 9999 }],
  },
];

const rates = [
  {
    zoneSlug: "metro",
    packageType: "carton" as const,
    minWeightKg: 0,
    maxWeightKg: 20,
    rateCents: 2995,
    multiItemSurchargePct: 0,
  },
  {
    zoneSlug: "metro",
    packageType: "skid" as const,
    minWeightKg: 0,
    maxWeightKg: null,
    rateCents: 9900,
    multiItemSurchargePct: 15,
  },
  {
    zoneSlug: "regional",
    packageType: "carton" as const,
    minWeightKg: 0,
    maxWeightKg: null,
    rateCents: 3995,
    multiItemSurchargePct: 0,
  },
];

describe("shipping estimate", () => {
  it("resolves metro postcodes before regional catch-all", () => {
    expect(resolveZoneSlug("2000", zones)).toBe("metro");
    expect(resolveZoneSlug("2500", zones)).toBe("regional");
  });

  it("uses volumetric weight for bulky items", () => {
    const weight = billableWeightKg({
      weightKg: 10,
      lengthCm: 156,
      widthCm: 54,
      heightCm: 88,
      packageType: "skid",
      quantity: 1,
    });

    expect(weight).toBeGreaterThan(10);
  });

  it("estimates shipping for a metro carton order", () => {
    const result = estimateShipping({
      postcode: "2000",
      zones,
      rates,
      lines: [
        {
          weightKg: 8,
          lengthCm: 60,
          widthCm: 40,
          heightCm: 30,
          packageType: "carton",
          quantity: 1,
        },
      ],
    });

    expect(result.zone).toBe("metro");
    expect(result.shippingCents).toBe(2995);
  });

  it("applies skid surcharge for multi-skid carts", () => {
    const result = estimateShipping({
      postcode: "2000",
      zones,
      rates,
      lines: [
        {
          weightKg: 40,
          lengthCm: 120,
          widthCm: 60,
          heightCm: 80,
          packageType: "skid",
          quantity: 2,
        },
      ],
    });

    expect(result.shippingCents).toBe(Math.round(9900 * 1.15));
  });
});
