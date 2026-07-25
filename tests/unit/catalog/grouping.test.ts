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
