# BDK Catalog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the BDK Supply CSV (~2,746 active SKUs) into the DavidEcomm storefront via a build-time transform pipeline, with JSON fallback and Supabase seed support, hybrid variant grouping, generated categories, and responsive UI fixes for real catalog scale.

**Architecture:** A shared `scripts/catalog/` transform parses the CSV once, applies grouping heuristics and category-tree generation, and exports JSON (`public/data/catalog/`) plus SQL (`supabase/seed_catalog.sql`). `lib/catalog/loader.ts` reads JSON when Supabase is unset; existing `lib/products.ts` and `lib/categories.ts` delegate to the loader. UI tasks add pagination, gallery scroll, HTML descriptions, and nav depth handling without rewriting the storefront shell.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, Playwright, `csv-parse` (dev), Zod (validation), existing Supabase schema (`products`, `product_variants`, `product_images`, `product_specifications`, `categories`)

**Spec:** [BDK Catalog Integration Design](../specs/2026-07-26-bdk-catalog-integration-design.md)

## Global Constraints

- Next.js App Router; Server Components by default for PLP/PDP
- Prices stored as **AUD cents** (`Math.round(dollars * 100)`)
- Import **active rows only** (`Status = active`)
- ISR revalidate: category/collection/search `60`, product `300`
- All product images via `next/image`; add `cdn.shopify.com` to `remotePatterns`
- Pagination default `24` products/page, max `48`
- Preserve original CSV **SKU** on every variant row (checkout compatibility)
- Mock homepage content stays in `lib/mock/data.ts` until Phase 3 CMS
- Analytics via `lib/analytics/track.ts` only
- Unit tests in `tests/unit/`; E2E in `tests/e2e/`

---

## File Structure

```
scripts/catalog/
  types.ts                 # NormalizedCatalog, CsvProductRow, GroupOverrides
  utils.ts                 # slugify, priceToCents, deterministicId
  parse-csv.ts             # Read + parse CSV file
  map-row.ts               # CsvProductRow → mapped fields + specs + images
  categories.ts            # Tag paths → category tree
  grouping.ts              # Hybrid grouping heuristics
  transform.ts             # Orchestrator: CSV → NormalizedCatalog
  export-json.ts           # Write public/data/catalog/*.json
  export-sql.ts            # Write supabase/seed_catalog.sql
  validate.ts              # Fail on duplicate slugs/SKUs, invalid prices
  build.ts                 # CLI entry for catalog:build
  product-groups.json      # Manual overrides

lib/catalog/
  loader.ts                # loadCategories(), loadProducts(), loadSearchIndex()
  pagination.ts            # paginateProducts(), PaginatedResult type

tests/unit/catalog/
  utils.test.ts
  categories.test.ts
  grouping.test.ts
  transform.test.ts

public/data/
  BDKSUPPLY All Products.csv   # Source (already present)
  catalog/                       # Generated JSON bundle

supabase/seed_catalog.sql       # Generated SQL seed
```

---

### Task 1: Catalog utilities and types

**Files:**
- Create: `scripts/catalog/types.ts`
- Create: `scripts/catalog/utils.ts`
- Create: `tests/unit/catalog/utils.test.ts`

**Interfaces:**
- Produces: `priceToCents(dollars: string): number`, `slugify(text: string): string`, `deterministicId(namespace: string, value: string): string`, types `CsvProductRow`, `NormalizedProduct`, `NormalizedVariant`, `NormalizedCategory`, `NormalizedCatalog`

- [ ] **Step 1: Write failing utility tests**

Create `tests/unit/catalog/utils.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { deterministicId, priceToCents, slugify } from "@/scripts/catalog/utils";

describe("priceToCents", () => {
  it("converts dollar strings to integer cents", () => {
    expect(priceToCents("1692.42")).toBe(169242);
    expect(priceToCents("6.09")).toBe(609);
  });

  it("throws on invalid prices", () => {
    expect(() => priceToCents("")).toThrow();
    expect(() => priceToCents("-1")).toThrow();
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Wall Hung Vanities")).toBe("wall-hung-vanities");
  });
});

describe("deterministicId", () => {
  it("returns stable uuid-shaped ids", () => {
    const a = deterministicId("product", "vellena-1500-vanity");
    const b = deterministicId("product", "vellena-1500-vanity");
    expect(a).toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- tests/unit/catalog/utils.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement types and utilities**

Create `scripts/catalog/types.ts`:

```typescript
import type {
  Category,
  Product,
  ProductImage,
  ProductSpecification,
  ProductVariant,
} from "@/lib/supabase/types";

export interface CsvProductRow {
  SKU: string;
  Title: string;
  Description: string;
  Vendor: string;
  Tags: string;
  Price: string;
  Status: string;
  Colour: string;
  Warranty: string;
  [key: string]: string;
}

export interface NormalizedVariant {
  id: string;
  sku: string;
  name: string;
  option_type: string;
  option_value: string;
  price: number;
  image_url: string | null;
  swatch_color: string | null;
  is_default: boolean;
  sort_order: number;
  sourceRow: CsvProductRow;
}

export interface NormalizedProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sku: string;
  gtin: string | null;
  brand: string | null;
  attributes: Record<string, string>;
  collection_slugs: string[];
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: NormalizedVariant[];
  active: boolean;
}

export interface NormalizedCategory extends Category {}

export interface NormalizedCatalog {
  categories: NormalizedCategory[];
  products: NormalizedProduct[];
  searchIndex: Array<{
    productId: string;
    slug: string;
    tokens: string;
  }>;
  report: ImportReport;
}

export interface ImportReport {
  activeRows: number;
  productsCreated: number;
  variantsCreated: number;
  categoriesCreated: number;
  warnings: string[];
  errors: string[];
}
```

Create `scripts/catalog/utils.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- tests/unit/catalog/utils.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/catalog/types.ts scripts/catalog/utils.ts tests/unit/catalog/utils.test.ts
git commit -m "feat(catalog): add transform types and utility helpers"
```

---

### Task 2: CSV parser and row mapper

**Files:**
- Create: `scripts/catalog/parse-csv.ts`
- Create: `scripts/catalog/map-row.ts`
- Modify: `package.json` (add `csv-parse` devDependency)
- Test: `tests/unit/catalog/map-row.test.ts`

**Interfaces:**
- Consumes: `priceToCents`, `deterministicId`, `CsvProductRow` from Task 1
- Produces: `parseCatalogCsv(filePath: string): CsvProductRow[]`, `mapRowImages(row: CsvProductRow, productId: string): ProductImage[]`, `mapRowSpecifications(row: CsvProductRow, productId: string): ProductSpecification[]`

- [ ] **Step 1: Add csv-parse**

```bash
npm install -D csv-parse
```

- [ ] **Step 2: Write failing map-row test**

Create `tests/unit/catalog/map-row.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { mapRowImages, mapRowSpecifications } from "@/scripts/catalog/map-row";
import type { CsvProductRow } from "@/scripts/catalog/types";

const sampleRow: CsvProductRow = {
  SKU: "VELPVC150WH-EO-E",
  Title: "Sample Vanity",
  Description: "<p>HTML desc</p>",
  Vendor: "Baiachi",
  Tags: "Bathroom, Clearance",
  Price: "1692.42",
  Status: "active",
  Colour: "Empire Oak",
  Warranty: '{"text":"10 year warranty","url":"https://example.com"}',
  "Image 1": "https://cdn.shopify.com/a.png",
  "Image 2": "",
  "Specific Item Width": "1500mm",
  "Specific Brand": "Baiachi",
};

describe("mapRowImages", () => {
  it("maps non-empty image columns with sort order", () => {
    const images = mapRowImages(sampleRow, "prod-1");
    expect(images).toHaveLength(1);
    expect(images[0]?.url).toContain("shopify.com");
    expect(images[0]?.sort_order).toBe(0);
  });
});

describe("mapRowSpecifications", () => {
  it("maps Specific columns and warranty json", () => {
    const specs = mapRowSpecifications(sampleRow, "prod-1");
    expect(specs.some((spec) => spec.label === "Item Width")).toBe(true);
    expect(specs.some((spec) => spec.label === "Warranty")).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- tests/unit/catalog/map-row.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement parser and mapper**

Create `scripts/catalog/parse-csv.ts`:

```typescript
import { readFileSync } from "node:fs";

import { parse } from "csv-parse/sync";

import type { CsvProductRow } from "@/scripts/catalog/types";

const CSV_PATH = "public/data/BDKSUPPLY All Products.csv";

export function parseCatalogCsv(filePath = CSV_PATH): CsvProductRow[] {
  const content = readFileSync(filePath, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as CsvProductRow[];

  return rows.filter((row) => row.Status?.toLowerCase() === "active");
}
```

Create `scripts/catalog/map-row.ts`:

```typescript
import { deterministicId } from "@/scripts/catalog/utils";
import type { CsvProductRow } from "@/scripts/catalog/types";
import type { ProductImage, ProductSpecification } from "@/lib/supabase/types";

const IMAGE_COLUMNS = Array.from({ length: 15 }, (_, index) => `Image ${index + 1}`);

const SPEC_GROUP_RULES: Array<{ match: RegExp; group: string }> = [
  { match: /height|length|width|weight|thickness|measurement|size|volume/i, group: "Dimensions" },
  { match: /material|glass|stone|plumbing/i, group: "Materials" },
  { match: /wels|watermark|certified|safety/i, group: "Compliance" },
];

function specGroup(label: string): string {
  return SPEC_GROUP_RULES.find((rule) => rule.match.test(label))?.group ?? "Details";
}

function titleCase(label: string): string {
  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapRowImages(row: CsvProductRow, productId: string): ProductImage[] {
  return IMAGE_COLUMNS.flatMap((column, index) => {
    const url = row[column]?.trim();
    if (!url) return [];

    return [{
      id: deterministicId("image", `${productId}:${index}`),
      product_id: productId,
      url,
      alt_text: row.Title,
      sort_order: index,
    }];
  });
}

export function mapRowSpecifications(
  row: CsvProductRow,
  productId: string,
): ProductSpecification[] {
  const specs: ProductSpecification[] = [];
  let sortOrder = 0;

  for (const [key, rawValue] of Object.entries(row)) {
    if (!key.startsWith("Specific ") || !rawValue?.trim()) continue;

    const label = titleCase(key.replace(/^Specific /, ""));

    specs.push({
      id: deterministicId("spec", `${productId}:${key}`),
      product_id: productId,
      group_name: specGroup(label),
      label,
      value: rawValue.trim(),
      sort_order: sortOrder++,
    });
  }

  if (row.Warranty?.trim()) {
    try {
      const warranty = JSON.parse(row.Warranty) as { text?: string; url?: string };
      if (warranty.text) {
        specs.push({
          id: deterministicId("spec", `${productId}:warranty`),
          product_id: productId,
          group_name: "Details",
          label: "Warranty",
          value: warranty.url ? `${warranty.text} (${warranty.url})` : warranty.text,
          sort_order: sortOrder++,
        });
      }
    } catch {
      // ignore malformed warranty json
    }
  }

  return specs;
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test -- tests/unit/catalog/map-row.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/catalog/parse-csv.ts scripts/catalog/map-row.ts tests/unit/catalog/map-row.test.ts
git commit -m "feat(catalog): add CSV parser and row field mappers"
```

---

### Task 3: Category tree generator

**Files:**
- Create: `scripts/catalog/categories.ts`
- Create: `scripts/catalog/product-groups.json` (initial overrides + swatch colors)
- Test: `tests/unit/catalog/categories.test.ts`

**Interfaces:**
- Consumes: `slugify`, `deterministicId`, `CsvProductRow`
- Produces: `buildCategoryTree(rows: CsvProductRow[]): { categories: NormalizedCategory[]; collectionTagsBySku: Map<string, string[]>; categoryIdByPath: Map<string, string> }`

- [ ] **Step 1: Write failing category tests**

Create `tests/unit/catalog/categories.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { buildCategoryTree, extractCollectionSlugs } from "@/scripts/catalog/categories";
import type { CsvProductRow } from "@/scripts/catalog/types";

const row: CsvProductRow = {
  SKU: "TEST-1",
  Title: "Test",
  Description: "",
  Vendor: "Brand",
  Tags: "Bathroom, Bathroom > Vanities > Wall Hung Vanities, Clearance",
  Price: "10",
  Status: "active",
  Colour: "Chrome",
  Warranty: "",
};

describe("buildCategoryTree", () => {
  it("creates nested categories with pillar mapping", () => {
    const { categories, categoryIdByPath } = buildCategoryTree([row]);
    expect(categories.some((cat) => cat.slug === "bathroom")).toBe(true);
    expect(categories.some((cat) => cat.slug === "wall-hung-vanities")).toBe(true);
    expect(categoryIdByPath.get("Bathroom > Vanities > Wall Hung Vanities")).toBeTruthy();
  });

  it("sets show_in_mega_menu only for depth 1-2", () => {
    const { categories } = buildCategoryTree([row]);
    const vanity = categories.find((cat) => cat.slug === "vanities");
    const wallHung = categories.find((cat) => cat.slug === "wall-hung-vanities");
    expect(vanity?.show_in_mega_menu).toBe(true);
    expect(wallHung?.show_in_mega_menu).toBe(false);
  });
});

describe("extractCollectionSlugs", () => {
  it("maps clearance tag to collection slug", () => {
    expect(extractCollectionSlugs(row.Tags)).toEqual(["clearance"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/catalog/categories.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement category builder**

Create `scripts/catalog/categories.ts` with:

- `PILLAR_TAGS` map: `Bathroom` → `bathroom`, etc.
- `COLLECTION_TAGS` map: `Clearance` → `clearance`, `Featured` → `featured`, `Bundle Deals` → `bundle-deals`
- `buildCategoryTree(rows)`:
  - Collect all tag paths from rows (split tags on `, `)
  - Skip collection-only tags for tree building
  - For each path split on ` > `, upsert nodes with parent links
  - Assign `nav_pillar` from root when in `PILLAR_TAGS`
  - Depth 1–2: `show_in_mega_menu: true`; depth 3+: `false`
  - `mega_menu_order` = sibling index
- `pickPrimaryCategoryId(tags, categoryIdByPath)`: longest category path wins
- `extractCollectionSlugs(tags: string): string[]`

Create initial `scripts/catalog/product-groups.json`:

```json
{
  "forceGroup": {},
  "forceStandalone": [],
  "swatchColors": {
    "Empire Oak": "#C4A882",
    "Wash White": "#F5F5F0",
    "Matte Black": "#1E2B3B",
    "Brushed Brass": "#C7B8A3",
    "Chrome": "#C0CFDD"
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/catalog/categories.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/catalog/categories.ts scripts/catalog/product-groups.json tests/unit/catalog/categories.test.ts
git commit -m "feat(catalog): generate category tree from CSV tags"
```

---

### Task 4: Product grouping engine

**Files:**
- Create: `scripts/catalog/grouping.ts`
- Test: `tests/unit/catalog/grouping.test.ts`

**Interfaces:**
- Consumes: `CsvProductRow`, overrides from `product-groups.json`, `deterministicId`, `slugify`, `dedupeSlug`
- Produces: `groupRows(rows: CsvProductRow[], overrides: GroupOverrides): Array<{ key: string; rows: CsvProductRow[] }>`

- [ ] **Step 1: Write failing grouping tests**

Create `tests/unit/catalog/grouping.test.ts` with fixtures:

```typescript
import { describe, expect, it } from "vitest";

import { basinSuffix, buildGroupKey, groupRows } from "@/scripts/catalog/grouping";
import type { CsvProductRow } from "@/scripts/catalog/types";

function row(partial: Partial<CsvProductRow>): CsvProductRow {
  return {
    SKU: "SKU",
    Title: "Title",
    Description: "",
    Vendor: "",
    Tags: "",
    Price: "10",
    Status: "active",
    Colour: "",
    Warranty: "",
    ...partial,
  };
}

describe("basinSuffix", () => {
  it("returns final sku segment", () => {
    expect(basinSuffix("VELPVC150WH-EO-E")).toBe("E");
    expect(basinSuffix("VELPVC150WH-EO-ED")).toBe("ED");
  });
});

describe("groupRows", () => {
  it("groups colour variants with same basin suffix", () => {
    const rows = [
      row({
        SKU: "VELPVC150WH-EO-E",
        Title: "Vellena 1500mm PVC Water Proof Empire Oak Wall Hung Bathroom Vanity Poly Marble Basin",
        Colour: "Empire Oak",
        "Specific Size": "1500mm",
        "Specific Type": "Wall Hung Vanity",
      }),
      row({
        SKU: "VELPVC150WH-WW-E",
        Title: "Vellena 1500mm PVC Water Proof Wash White Wall Hung Bathroom Vanity Poly Marble Basin",
        Colour: "Wash White",
        "Specific Size": "1500mm",
        "Specific Type": "Wall Hung Vanity",
      }),
    ];

    const groups = groupRows(rows, { forceGroup: {}, forceStandalone: [], swatchColors: {} });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.rows).toHaveLength(2);
  });

  it("keeps single and double basin separate", () => {
    const rows = [
      row({
        SKU: "VELPVC150WH-EO-E",
        Title: "Vellena 1500mm PVC Water Proof Empire Oak Wall Hung Bathroom Vanity Poly Marble Basin",
        Colour: "Empire Oak",
        "Specific Size": "1500mm",
        "Specific Type": "Wall Hung Vanity",
      }),
      row({
        SKU: "VELPVC150WH-EO-ED",
        Title: "Vellena 1500mm PVC Water Proof Empire Oak Wall Hung Bathroom Vanity Double Poly Marble Basin",
        Colour: "Empire Oak",
        "Specific Size": "1500mm",
        "Specific Type": "Wall Hung Vanity",
      }),
    ];

    const groups = groupRows(rows, { forceGroup: {}, forceStandalone: [], swatchColors: {} });
    expect(groups).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/catalog/grouping.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement grouping**

Create `scripts/catalog/grouping.ts` implementing:

- `FINISH_TOKENS` array from spec (Empire Oak, Wash White, Matte Black, Brushed Brass, Chrome, White Oak, Natural Oak)
- `normalizeTitle(title: string): string`
- `basinSuffix(sku: string): string`
- `buildGroupKey(row: CsvProductRow): string`
- `groupRows(rows, overrides)`:
  - Apply `forceStandalone` first
  - Apply `forceGroup` bucket merge
  - Default bucket by `buildGroupKey`
  - Only merge buckets with 2+ rows AND distinct `Colour` values

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/catalog/grouping.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/catalog/grouping.ts tests/unit/catalog/grouping.test.ts
git commit -m "feat(catalog): add hybrid variant grouping heuristics"
```

---

### Task 5: Transform orchestrator, validation, and JSON export

**Files:**
- Create: `scripts/catalog/transform.ts`
- Create: `scripts/catalog/validate.ts`
- Create: `scripts/catalog/export-json.ts`
- Create: `scripts/catalog/build.ts`
- Modify: `package.json` (add `catalog:build`, `catalog:validate` scripts)
- Test: `tests/unit/catalog/transform.test.ts`

**Interfaces:**
- Consumes: all Task 1–4 modules
- Produces: `buildCatalog(): NormalizedCatalog`, writes:
  - `public/data/catalog/products.json`
  - `public/data/catalog/categories.json`
  - `public/data/catalog/search-index.json`

- [ ] **Step 1: Write failing transform smoke test**

Create `tests/unit/catalog/transform.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { buildCatalogFromRows } from "@/scripts/catalog/transform";
import { parseCatalogCsv } from "@/scripts/catalog/parse-csv";

describe("buildCatalogFromRows", () => {
  it("builds products with unique slugs and variant skus", () => {
    const rows = parseCatalogCsv().slice(0, 50);
    const catalog = buildCatalogFromRows(rows);
    const slugs = catalog.products.map((product) => product.slug);
    const skus = catalog.products.flatMap((product) =>
      product.variants.length > 0
        ? product.variants.map((variant) => variant.sku)
        : [product.sku],
    );

    expect(catalog.products.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/catalog/transform.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transform + export + CLI**

`transform.ts` responsibilities:

- Load overrides JSON
- `buildCategoryTree(rows)`
- `groupRows(rows, overrides)`
- For each group:
  - Create parent product from first/default row
  - Strip colour tokens from grouped parent name
  - Map images/specs from default variant
  - Build `variants[]` with `option_type: "finish"`, swatch from overrides
  - Set `product.sku` to default variant SKU
  - Set `collection_slugs`, `category_id`, `brand`, `price` (min variant price or default)
- Build `searchIndex` tokens: name, brand, sku, spec values
- Populate `report` warnings/errors

`validate.ts`: throw on duplicate slugs/SKUs, zero products, invalid prices

`export-json.ts`: `writeFileSync` pretty JSON to `public/data/catalog/`

`build.ts`:

```typescript
import { buildCatalogFromRows } from "./transform";
import { parseCatalogCsv } from "./parse-csv";
import { exportCatalogJson } from "./export-json";
import { validateCatalog } from "./validate";

const rows = parseCatalogCsv();
const catalog = buildCatalogFromRows(rows);
validateCatalog(catalog);
exportCatalogJson(catalog);
console.log(catalog.report);
```

Add to `package.json`:

```json
"catalog:build": "tsx scripts/catalog/build.ts",
"catalog:validate": "tsx scripts/catalog/build.ts --validate-only"
```

Also add devDependency: `tsx`

- [ ] **Step 4: Run unit tests and build**

Run: `npm run test -- tests/unit/catalog/transform.test.ts`
Run: `npm run catalog:build`
Expected: JSON files created under `public/data/catalog/`, report printed with ~2746 active rows

- [ ] **Step 5: Commit generated JSON + scripts**

```bash
git add scripts/catalog/*.ts scripts/catalog/product-groups.json public/data/catalog/ package.json package-lock.json tests/unit/catalog/transform.test.ts
git commit -m "feat(catalog): add transform pipeline and JSON export"
```

---

### Task 6: Catalog loader and data-layer integration

**Files:**
- Create: `lib/catalog/loader.ts`
- Create: `lib/catalog/pagination.ts`
- Modify: `lib/products.ts`
- Modify: `lib/categories.ts`
- Modify: `lib/product-detail.ts`
- Test: `tests/unit/catalog/loader.test.ts`

**Interfaces:**
- Consumes: JSON files from Task 5
- Produces:
  - `getJsonCategories(): Promise<Category[]>`
  - `getJsonProducts(): Promise<Product[]>`
  - `paginateProducts(products: Product[], { page, limit }): PaginatedResult<Product>`

- [ ] **Step 1: Write loader test**

Create `tests/unit/catalog/loader.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { getJsonCategories, getJsonProducts } from "@/lib/catalog/loader";

describe("catalog loader", () => {
  it("loads generated categories and products", async () => {
    const [categories, products] = await Promise.all([
      getJsonCategories(),
      getJsonProducts(),
    ]);

    expect(categories.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]?.product_images?.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/catalog/loader.test.ts`
Expected: FAIL until Task 5 JSON exists

- [ ] **Step 3: Implement loader + wire data layer**

Create `lib/catalog/loader.ts`:

```typescript
import categoriesJson from "@/public/data/catalog/categories.json";
import productsJson from "@/public/data/catalog/products.json";
import searchIndexJson from "@/public/data/catalog/search-index.json";
import type { Category, Product } from "@/lib/supabase/types";

export async function getJsonCategories(): Promise<Category[]> {
  return categoriesJson as Category[];
}

export async function getJsonProducts(): Promise<Product[]> {
  return productsJson as Product[];
}

export async function getJsonSearchIndex() {
  return searchIndexJson as Array<{ productId: string; slug: string; tokens: string }>;
}
```

Update `tsconfig.json` to allow JSON imports if needed (`resolveJsonModule: true` — likely already set).

Modify `lib/categories.ts`:

```typescript
import { getJsonCategories } from "@/lib/catalog/loader";

export async function getCategories() {
  const categories = await fetchSupabaseCategories();
  if (categories) return categories;
  return getJsonCategories();
}
```

Modify `lib/products.ts`:

- Replace `mockProducts` fallback with `getJsonProducts()`
- Extend `ProductFilters` with `page?: number`
- Add `getProductsPaginated()` returning `{ products, total, page, pageCount }`
- Use `getJsonSearchIndex()` for JSON-path search token matching

Modify `lib/product-detail.ts`:

- When Supabase absent, assemble variants/specs from JSON product embedded arrays (export must include `product_variants` and `product_specifications` fields on each product OR separate files — prefer embedding in `products.json` as nested arrays matching `ProductDetail` needs)

- [ ] **Step 4: Run tests + typecheck**

Run: `npm run test -- tests/unit/catalog/loader.test.ts`
Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/catalog/ lib/products.ts lib/categories.ts lib/product-detail.ts tests/unit/catalog/loader.test.ts
git commit -m "feat(catalog): load generated JSON catalog in data layer"
```

---

### Task 7: Supabase SQL export and seed command

**Files:**
- Create: `scripts/catalog/export-sql.ts`
- Modify: `scripts/catalog/build.ts` (also emit SQL)
- Create: `scripts/catalog/seed.ts`
- Modify: `package.json` (`catalog:seed` script)

**Interfaces:**
- Consumes: `NormalizedCatalog` from Task 5
- Produces: `supabase/seed_catalog.sql` with TRUNCATE + INSERT for categories, products, product_images, product_variants, product_specifications

- [ ] **Step 1: Implement SQL exporter**

`export-sql.ts` generates:

```sql
begin;
truncate product_specifications, product_variants, product_images, products, categories cascade;
-- insert categories (parents before children)
-- insert products
-- insert images, variants, specifications
commit;
```

Use dollar-quoting for HTML descriptions. Chunk inserts if file exceeds ~10MB (write `seed_catalog.sql` + optional `seed_catalog_part2.sql` if needed).

- [ ] **Step 2: Add seed CLI**

`scripts/catalog/seed.ts` reads `DATABASE_URL` from env (document in `.env.example`) and executes SQL via `pg` client OR prints instructions to run via Supabase SQL editor.

Add devDependency `pg` if using direct execution.

Add script:

```json
"catalog:seed": "tsx scripts/catalog/seed.ts"
```

- [ ] **Step 3: Run build + verify SQL**

Run: `npm run catalog:build`
Expected: `supabase/seed_catalog.sql` created; spot-check one product insert has cents price and SKU

- [ ] **Step 4: Commit**

```bash
git add scripts/catalog/export-sql.ts scripts/catalog/seed.ts supabase/seed_catalog.sql package.json .env.example
git commit -m "feat(catalog): add Supabase seed export and seed command"
```

---

### Task 8: Shopify images and PDP responsive fixes

**Files:**
- Modify: `next.config.ts`
- Modify: `components/product/product-detail-experience.tsx`
- Modify: `components/product/product-gallery.tsx`
- Create: `lib/product-description.ts`
- Test: `tests/unit/product-description.test.ts`

**Interfaces:**
- Consumes: HTML `product.description` from catalog
- Produces: `sanitizeProductDescription(html: string): string`

- [ ] **Step 1: Write sanitizer test**

```typescript
import { describe, expect, it } from "vitest";
import { sanitizeProductDescription } from "@/lib/product-description";

describe("sanitizeProductDescription", () => {
  it("allows basic product html", () => {
    const html = "<p>Line<br>Important notes:</p>";
    expect(sanitizeProductDescription(html)).toContain("<p>");
  });

  it("strips script tags", () => {
    expect(sanitizeProductDescription('<script>alert(1)</script><p>Safe</p>')).not.toContain("script");
  });
});
```

- [ ] **Step 2: Implement config + UI fixes**

`next.config.ts` add:

```typescript
{ protocol: "https", hostname: "cdn.shopify.com" },
```

`lib/product-description.ts`: minimal allowlist sanitizer (`p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `a[href]`)

`product-detail-experience.tsx`:

- Responsive title classes: `text-2xl sm:text-3xl lg:text-4xl text-balance`
- Render description via sanitized HTML inside `prose prose-sm max-w-none`

`product-gallery.tsx`:

- Replace thumbnail grid with horizontal scroll container:
  - `flex gap-3 overflow-x-auto pb-2`
  - thumb sizes `h-16 w-16 sm:h-20 sm:w-20 shrink-0`

- [ ] **Step 3: Run tests + manual smoke**

Run: `npm run test -- tests/unit/product-description.test.ts`
Run: `npm run dev` → open a real product PDP
Expected: Shopify images load; description formatted; thumbnails scroll on narrow viewport

- [ ] **Step 4: Commit**

```bash
git add next.config.ts components/product/product-detail-experience.tsx components/product/product-gallery.tsx lib/product-description.ts tests/unit/product-description.test.ts
git commit -m "fix(catalog): support Shopify images and PDP responsive layout"
```

---

### Task 9: PLP pagination (category, collection, search)

**Files:**
- Modify: `lib/catalog/pagination.ts`
- Modify: `lib/products.ts`
- Modify: `app/(storefront)/categories/[slug]/page.tsx`
- Modify: `app/(storefront)/collections/[slug]/page.tsx`
- Modify: `app/(storefront)/search/page.tsx`
- Create: `components/product/product-pagination.tsx`

**Interfaces:**
- Consumes: `getProductsPaginated(filters)` → `{ products, total, page, pageCount }`
- Produces: `<ProductPagination page={page} pageCount={pageCount} />`

- [ ] **Step 1: Implement pagination helper**

`lib/catalog/pagination.ts`:

```typescript
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export function paginate<T>(items: T[], page = 1, limit = 24): PaginatedResult<T> {
  const safeLimit = Math.min(Math.max(limit, 1), 48);
  const safePage = Math.max(page, 1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    total,
    page: safePage,
    pageCount,
  };
}
```

- [ ] **Step 2: Add paginated query to products layer**

Extend `getProducts` or add `getProductsPaginated` using `searchParams.page` default 1.

- [ ] **Step 3: Update PLP pages**

Each page reads `searchParams.page`, calls paginated getter, passes total count to hero ("2,746 products" not "24 products").

Create `components/product/product-pagination.tsx` with prev/next + page numbers, preserving sort query params.

- [ ] **Step 4: Run dev smoke**

Run: `npm run dev`
Visit: `/categories/bathroom?page=2`
Expected: second page of products; total count stable

- [ ] **Step 5: Commit**

```bash
git add lib/catalog/pagination.ts lib/products.ts app/(storefront)/categories/[slug]/page.tsx app/(storefront)/collections/[slug]/page.tsx app/(storefront)/search/page.tsx components/product/product-pagination.tsx
git commit -m "feat(catalog): add paginated product listing pages"
```

---

### Task 10: Navigation updates for deep categories

**Files:**
- Modify: `components/layout/mega-menu.tsx`
- Modify: `components/layout/site-header.tsx`

**Interfaces:**
- Consumes: generated categories with depth 3+ children via `categoryChildren` map

- [ ] **Step 1: Mega-menu thumbnail cap**

In `mega-menu.tsx`:

- Slice `visualChildren` to 8 items
- Add link: `View all {selectedChild.name}` → `/categories/${selectedChild.slug}`
- Add `line-clamp-2` to labels
- Fallback tile when `mega_menu_image` is null (initials or text tile)

- [ ] **Step 2: Mobile nav depth 3 links**

In `site-header.tsx` mobile accordion:

- For each L2 child, also list L3 children from `categories.filter(c => c.parent_id === child.id).slice(0, 8)`
- Indent L3 links with `pl-4 text-xs`

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`
Expected: mega-menu shows real BDK categories; no layout overflow; mobile sheet shows L2 + sample L3 links

- [ ] **Step 4: Commit**

```bash
git add components/layout/mega-menu.tsx components/layout/site-header.tsx
git commit -m "feat(catalog): update nav for generated category depth"
```

---

### Task 11: E2E tests and CI validation

**Files:**
- Modify: `tests/e2e/smoke-catalog.spec.ts`
- Modify: `.github/workflows/ci.yml` (if present)
- Modify: `package.json` (wire `catalog:validate` into CI)

**Interfaces:**
- Consumes: built catalog JSON committed in repo

- [ ] **Step 1: Extend Playwright smoke tests**

Update `tests/e2e/smoke-catalog.spec.ts`:

```typescript
test("category PLP shows paginated real products", async ({ page }) => {
  await page.goto("/categories/bathroom");
  await expect(page.getByRole("heading", { name: /bathroom/i })).toBeVisible();
  await expect(page.locator('[href^="/products/"]').first()).toBeVisible();
});

test("search finds a known sku", async ({ page }) => {
  await page.goto("/search?q=VELPVC150WH-EO-E");
  await expect(page.locator("text=VELPVC150WH-EO-E").first()).toBeVisible();
});
```

- [ ] **Step 2: Add CI step**

In CI workflow after install:

```yaml
- run: npm run catalog:validate
- run: npm run test
- run: npm run test:e2e
```

- [ ] **Step 3: Run full test suite**

Run: `npm run catalog:validate && npm run test && npm run test:e2e`
Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/smoke-catalog.spec.ts .github/workflows/ci.yml package.json
git commit -m "test(catalog): add catalog validation and e2e coverage"
```

---

## Self-Review Checklist

| Spec requirement | Task |
|------------------|------|
| Shared transform pipeline | Task 5 |
| JSON fallback loader | Task 6 |
| Supabase seed | Task 7 |
| Active-only import | Task 2 `parse-csv.ts` |
| Hybrid grouping + overrides | Tasks 4, 5 |
| Category tree + mega-menu curation | Task 3, 10 |
| Field mapping (price, specs, images) | Task 2, 5 |
| Shopify CDN images | Task 8 |
| PLP pagination | Task 9 |
| PDP HTML + gallery scroll | Task 8 |
| Search index | Tasks 5, 6 |
| Import validation report | Tasks 5, 11 |
| Unit + E2E tests | Tasks 1–5, 11 |

No TBD placeholders remain.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-26-bdk-catalog-integration.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — implement tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
