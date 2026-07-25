import { createHash } from "node:crypto";

export function priceToCents(value: string): number {
  const dollars = Number.parseFloat(value);

  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new Error(`Invalid price: ${value}`);
  }

  return Math.round(dollars * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deterministicId(namespace: string, value: string): string {
  const hash = createHash("sha256")
    .update(`${namespace}:${value}`)
    .digest("hex");

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

export function dedupeSlug(base: string, used: Set<string>): string {
  let slug = base;
  let suffix = 2;

  while (used.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(slug);
  return slug;
}
