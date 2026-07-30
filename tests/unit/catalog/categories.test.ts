import { describe, expect, it } from "vitest";

import {
  assignMegaMenuImages,
  buildCategoryTree,
  extractCollectionSlugs,
} from "@/scripts/catalog/categories";
import type { CsvProductRow } from "@/scripts/catalog/types";

const row: CsvProductRow = {
  SKU: "TEST-1",
  Title: "Test Vanity",
  Description: "",
  Vendor: "Brand",
  Tags: "Bathroom, Bathroom > Vanities > Wall Hung Vanities, Clearance",
  Price: "10",
  Status: "active",
  Colour: "Chrome",
  Warranty: "",
  "Image 1": "https://cdn.example.com/vanity.jpg",
};

const malformedRow: CsvProductRow = {
  ...row,
  SKU: "TEST-2",
  Tags: "Bathroom;Bathroom, Bathroom > Vanities",
};

describe("buildCategoryTree", () => {
  it("creates nested categories with pillar mapping", () => {
    const { categories, categoryIdByPath } = buildCategoryTree([row]);
    expect(categories.some((cat) => cat.slug === "bathroom")).toBe(true);
    expect(categories.some((cat) => cat.slug === "bathroom-vanities")).toBe(true);
    expect(categories.some((cat) => cat.slug === "bathroom-vanities-wall-hung-vanities")).toBe(
      true,
    );
    expect(categoryIdByPath.get("Bathroom > Vanities > Wall Hung Vanities")).toBeTruthy();
  });

  it("curates mega-menu visibility with allowlisted depth-2 slugs only", () => {
    const { categories } = buildCategoryTree([row]);
    const bathroom = categories.find((cat) => cat.slug === "bathroom");
    const vanities = categories.find((cat) => cat.slug === "bathroom-vanities");
    const wallHung = categories.find((cat) => cat.slug === "bathroom-vanities-wall-hung-vanities");

    expect(bathroom?.show_in_mega_menu).toBe(true);
    expect(vanities?.show_in_mega_menu).toBe(true);
    expect(wallHung?.show_in_mega_menu).toBe(true);
  });

  it("ignores malformed semicolon tags from Shopify exports", () => {
    const { categories } = buildCategoryTree([malformedRow]);
    expect(categories.some((cat) => cat.name.includes(";"))).toBe(false);
    expect(categories.some((cat) => cat.slug === "bathroom-bathroom")).toBe(false);
  });
});

describe("assignMegaMenuImages", () => {
  it("sets the first product image on mega-menu categories", () => {
    const { categories, categoryIdByPath } = buildCategoryTree([row]);
    assignMegaMenuImages(categories, [row], categoryIdByPath);

    const vanities = categories.find((cat) => cat.slug === "bathroom-vanities");
    expect(vanities?.mega_menu_image).toBe("https://cdn.example.com/vanity.jpg");
  });
});

describe("extractCollectionSlugs", () => {
  it("maps clearance tag to collection slug", () => {
    expect(extractCollectionSlugs(row.Tags)).toEqual(["clearance"]);
  });
});
