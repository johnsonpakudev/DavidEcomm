import { describe, expect, it } from "vitest";

import {
  buildMegaMenuVisualChildrenIndex,
  getMegaMenuVisualChildren,
} from "@/lib/navigation/mega-menu";
import type { Category } from "@/lib/supabase/types";

function category(partial: Partial<Category> & Pick<Category, "id" | "slug" | "name">): Category {
  return {
    parent_id: null,
    nav_pillar: null,
    icon_key: null,
    mega_menu_image: null,
    mega_menu_order: 0,
    show_in_mega_menu: false,
    meta_title: null,
    meta_description: null,
    ...partial,
  };
}

describe("mega menu helpers", () => {
  const pillar = category({
    id: "pillar",
    slug: "bathroom",
    name: "Bathroom",
    show_in_mega_menu: true,
  });
  const vanities = category({
    id: "vanities",
    slug: "bathroom-vanities",
    name: "Vanities",
    parent_id: "pillar",
    show_in_mega_menu: true,
    mega_menu_order: 0,
  });
  const wallHung = category({
    id: "wall-hung",
    slug: "bathroom-vanities-wall-hung-vanities",
    name: "Wall Hung Vanities",
    parent_id: "vanities",
    show_in_mega_menu: true,
    mega_menu_order: 1,
  });
  const freestanding = category({
    id: "freestanding",
    slug: "bathroom-vanities-freestanding-vanities",
    name: "Freestanding Vanities",
    parent_id: "vanities",
    show_in_mega_menu: true,
    mega_menu_order: 0,
  });

  it("indexes curated visual children under L2 categories", () => {
    const index = buildMegaMenuVisualChildrenIndex([
      pillar,
      vanities,
      wallHung,
      freestanding,
    ]);

    expect(index.get("vanities")?.map((item) => item.slug)).toEqual([
      "bathroom-vanities-freestanding-vanities",
      "bathroom-vanities-wall-hung-vanities",
    ]);
  });

  it("falls back to the parent category when no visual children exist", () => {
    const index = buildMegaMenuVisualChildrenIndex([pillar, vanities]);

    expect(getMegaMenuVisualChildren(vanities, index)).toEqual([vanities]);
  });
});
