import { describe, expect, it } from "vitest";

import {
  mapCarousel,
  mapCollection,
  mapHero,
  mapHomepageGlobal,
  mapInspiration,
  mapPromo,
} from "@/lib/homepage/mapper";

describe("homepage mapper", () => {
  it("maps hero slides with external image URLs", () => {
    const hero = mapHero(
      {
        id: "hero-1",
        headline: "Direct from the manufacturer",
        subheadline: "Quality supplies",
        ctaText: "Shop now",
        ctaHref: "/collections/best-sellers",
        externalImageUrl: "https://cdn.shopify.com/example.jpg",
        active: true,
      },
      0,
    );

    expect(hero).toEqual({
      id: "hero-1",
      layout: "standard",
      headline: "Direct from the manufacturer",
      subheadline: "Quality supplies",
      cta_text: "Shop now",
      cta_href: "/collections/best-sellers",
      image_url: "https://cdn.shopify.com/example.jpg",
      sort_order: 0,
      active: true,
      badge: null,
      brand_name: null,
      compare_at_price: null,
      price: null,
    });
  });

  it("skips heroes without image or headline", () => {
    expect(mapHero({ headline: "Missing image" }, 0)).toBeNull();
  });

  it("maps collection cards", () => {
    const collection = mapCollection(
      {
        id: "collection-1",
        name: "Featured",
        slug: "featured",
        description: "Highlighted products",
        ctaText: "Shop featured",
        externalImageUrl: "https://cdn.shopify.com/card.jpg",
      },
      1,
    );

    expect(collection?.slug).toBe("featured");
    expect(collection?.sort_order).toBe(1);
  });

  it("maps promo banners", () => {
    const promo = mapPromo({
      id: "promo-1",
      eyebrow: "Limited time",
      headline: "Clearance favourites",
      subtext: "Save while stocks last",
      ctaText: "Shop clearance",
      ctaHref: "/collections/clearance",
      externalImageUrl: "https://cdn.shopify.com/promo.jpg",
      active: true,
    });

    expect(promo?.headline).toBe("Clearance favourites");
  });

  it("maps inspiration tiles", () => {
    const image = mapInspiration(
      {
        id: "inspiration-1",
        altText: "Bathroom renovation",
        externalImageUrl: "https://cdn.shopify.com/inspiration.jpg",
        active: true,
      },
      2,
    );

    expect(image?.alt_text).toBe("Bathroom renovation");
    expect(image?.sort_order).toBe(2);
  });

  it("maps product carousels", () => {
    const carousel = mapCarousel(
      {
        id: "carousel-1",
        key: "best-sellers",
        title: "Best sellers",
        subtitle: "Customer favourites",
        viewAllHref: "/collections/best-sellers",
        selectionMode: "collection",
        collectionSlug: "best-sellers",
        sort: "featured",
        limit: 4,
        active: true,
      },
      0,
    );

    expect(carousel).toMatchObject({
      key: "best-sellers",
      selectionMode: "collection",
      collectionSlug: "best-sellers",
      limit: 4,
    });
  });

  it("returns null when homepage global is empty", () => {
    expect(mapHomepageGlobal({})).toBeNull();
  });

  it("maps a full homepage global", () => {
    const mapped = mapHomepageGlobal({
      heroes: [
        {
          headline: "Hero",
          externalImageUrl: "https://cdn.shopify.com/hero.jpg",
        },
      ],
      productCarousels: [
        {
          key: "featured",
          title: "Featured products",
          selectionMode: "rule",
          sort: "featured",
          limit: 4,
          active: true,
        },
      ],
    });

    expect(mapped?.heroes).toHaveLength(1);
    expect(mapped?.productCarousels).toHaveLength(1);
  });
});
