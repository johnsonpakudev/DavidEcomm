import type { PackageType } from "@/lib/cart/types";

const PACKAGE_TYPE_RANK: Record<PackageType, number> = {
  envelope: 1,
  carton: 2,
  skid: 3,
};

const DEFAULT_WEIGHT_KG = 25;
const DEFAULT_LENGTH_CM = 100;
const DEFAULT_WIDTH_CM = 50;
const DEFAULT_HEIGHT_CM = 50;
const DEFAULT_PACKAGE_TYPE: PackageType = "carton";
const VOLUMETRIC_DIVISOR = 5000;

export interface ShippingLineInput {
  weightKg: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  packageType: PackageType | null;
  quantity: number;
}

export interface PostcodeRange {
  from: number;
  to: number;
}

export interface ShippingZoneConfig {
  slug: string;
  postcodeRanges: PostcodeRange[];
}

export interface ShippingRateConfig {
  zoneSlug: string;
  packageType: PackageType;
  minWeightKg: number;
  maxWeightKg: number | null;
  rateCents: number;
  multiItemSurchargePct: number;
}

export interface ShippingEstimateInput {
  lines: ShippingLineInput[];
  postcode: string;
  zones: ShippingZoneConfig[];
  rates: ShippingRateConfig[];
}

export interface ShippingEstimateResult {
  shippingCents: number;
  zone: string;
  billableWeightKg: number;
  freightClass: PackageType;
  skidItemCount: number;
}

export function normalizePackageType(value: string | null | undefined): PackageType {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "skid") {
    return "skid";
  }

  if (normalized === "envelope") {
    return "envelope";
  }

  return "carton";
}

export function billableWeightKg(line: ShippingLineInput) {
  const weight = line.weightKg ?? DEFAULT_WEIGHT_KG;
  const length = line.lengthCm ?? DEFAULT_LENGTH_CM;
  const width = line.widthCm ?? DEFAULT_WIDTH_CM;
  const height = line.heightCm ?? DEFAULT_HEIGHT_CM;
  const volumetric = (length * width * height) / VOLUMETRIC_DIVISOR;

  return Math.max(weight, volumetric) * line.quantity;
}

export function resolveFreightClass(lines: ShippingLineInput[]): PackageType {
  return lines.reduce<PackageType>((current, line) => {
    const next = line.packageType ?? DEFAULT_PACKAGE_TYPE;
    return PACKAGE_TYPE_RANK[next] > PACKAGE_TYPE_RANK[current] ? next : current;
  }, "envelope");
}

export function resolveZoneSlug(
  postcode: string,
  zones: ShippingZoneConfig[],
): string | null {
  const numericPostcode = Number.parseInt(postcode, 10);

  if (Number.isNaN(numericPostcode)) {
    return null;
  }

  const orderedSlugs = ["metro", "remote", "regional"];

  for (const slug of orderedSlugs) {
    const zone = zones.find((entry) => entry.slug === slug);
    if (!zone) {
      continue;
    }

    const matches = zone.postcodeRanges.some(
      (range) => numericPostcode >= range.from && numericPostcode <= range.to,
    );

    if (matches) {
      return zone.slug;
    }
  }

  return null;
}

export function findShippingRate(
  rates: ShippingRateConfig[],
  zoneSlug: string,
  packageType: PackageType,
  totalWeightKg: number,
) {
  const candidates = rates
    .filter(
      (rate) =>
        rate.zoneSlug === zoneSlug &&
        rate.packageType === packageType &&
        totalWeightKg >= rate.minWeightKg &&
        (rate.maxWeightKg === null || totalWeightKg <= rate.maxWeightKg),
    )
    .sort((a, b) => b.minWeightKg - a.minWeightKg);

  if (candidates.length > 0) {
    return candidates[0];
  }

  return rates
    .filter((rate) => rate.zoneSlug === zoneSlug && rate.packageType === packageType)
    .sort((a, b) => b.rateCents - a.rateCents)[0];
}

export function estimateShipping(input: ShippingEstimateInput): ShippingEstimateResult {
  const zone = resolveZoneSlug(input.postcode, input.zones);

  if (!zone) {
    throw new Error(
      "We couldn't estimate shipping for this postcode. Please contact us.",
    );
  }

  const freightClass = resolveFreightClass(input.lines);
  const billableWeight = input.lines.reduce(
    (total, line) => total + billableWeightKg(line),
    0,
  );
  const skidItemCount = input.lines.reduce((count, line) => {
    const packageType = line.packageType ?? DEFAULT_PACKAGE_TYPE;
    return packageType === "skid" ? count + line.quantity : count;
  }, 0);

  const rate = findShippingRate(
    input.rates,
    zone,
    freightClass,
    billableWeight,
  );

  if (!rate) {
    throw new Error(
      "We couldn't estimate shipping for this order. Please contact us.",
    );
  }

  let shippingCents = rate.rateCents;

  if (skidItemCount >= 2 && rate.multiItemSurchargePct > 0) {
    shippingCents = Math.round(
      shippingCents * (1 + rate.multiItemSurchargePct / 100),
    );
  }

  return {
    shippingCents,
    zone,
    billableWeightKg: billableWeight,
    freightClass,
    skidItemCount,
  };
}
