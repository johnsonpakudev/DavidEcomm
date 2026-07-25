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
