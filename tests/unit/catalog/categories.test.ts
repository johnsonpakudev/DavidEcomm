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
