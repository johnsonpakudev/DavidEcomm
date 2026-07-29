import type { GlobalConfig } from "payload";

import {
  categoryShortcutField,
  imageFields,
  productCarouselFields,
} from "@/payload/fields/shared";
import { revalidateHomepage } from "@/payload/hooks/revalidateHomepage";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  hooks: {
    afterChange: [revalidateHomepage],
  },
  fields: [
    {
      name: "heroes",
      type: "array",
      label: "Hero carousel",
      maxRows: 5,
      labels: {
        singular: "Slide",
        plural: "Slides",
      },
      admin: {
        description:
          "Homepage hero carousel. Choose Promo for product offer slides with badge, brand, pricing, and CTA over the background image.",
        initCollapsed: false,
      },
      fields: [
        {
          name: "layout",
          type: "select",
          label: "Slide layout",
          required: true,
          defaultValue: "promo",
          options: [
            { label: "Promo (product offer overlay)", value: "promo" },
            { label: "Standard (headline on dark scrim)", value: "standard" },
          ],
          admin: {
            description:
              "Promo matches the Baiachi toilet hero: left gradient, pricing, and feature icons.",
          },
        },
        {
          name: "headline",
          type: "text",
          label: "Headline",
          required: true,
          admin: {
            description: "Product name for promo slides, or main headline for standard slides.",
          },
        },
        {
          name: "subheadline",
          type: "textarea",
          label: "Subheadline",
          admin: {
            description: "Tagline for promo slides (e.g. Modern design. Everyday comfort.).",
          },
        },
        {
          name: "ctaText",
          type: "text",
          label: "CTA text",
        },
        {
          name: "ctaHref",
          type: "text",
          label: "CTA link",
        },
        {
          name: "badge",
          type: "text",
          label: "Promo badge",
          defaultValue: "ON SPECIAL",
          admin: {
            condition: (_, siblingData) => siblingData?.layout === "promo",
            description: "Eyebrow pill above the brand name (e.g. ON SPECIAL).",
          },
        },
        {
          name: "brandName",
          type: "text",
          label: "Brand name",
          admin: {
            condition: (_, siblingData) => siblingData?.layout === "promo",
            description: "Large brand title shown above the product name.",
          },
        },
        {
          name: "compareAtPrice",
          type: "number",
          label: "Was price (AUD)",
          admin: {
            condition: (_, siblingData) => siblingData?.layout === "promo",
            description: "Original price in whole dollars (e.g. 399 for $399).",
          },
        },
        {
          name: "price",
          type: "number",
          label: "Now price (AUD)",
          admin: {
            condition: (_, siblingData) => siblingData?.layout === "promo",
            description: "Sale price in whole dollars (e.g. 279 for $279).",
          },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Background image",
        },
        {
          name: "externalImageUrl",
          type: "text",
          label: "External image URL",
          admin: {
            description:
              "Background image URL. Use /Carousel.png for the bathroom hero photo.",
          },
        },
        {
          name: "active",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      name: "collections",
      type: "array",
      maxRows: 6,
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "ctaText",
          type: "text",
          defaultValue: "Shop collection",
        },
        ...imageFields,
      ],
    },
    {
      name: "promo",
      type: "group",
      fields: [
        {
          name: "eyebrow",
          type: "text",
        },
        {
          name: "headline",
          type: "text",
          required: true,
        },
        {
          name: "subtext",
          type: "textarea",
        },
        {
          name: "ctaText",
          type: "text",
        },
        {
          name: "ctaHref",
          type: "text",
        },
        ...imageFields,
        {
          name: "active",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      name: "inspiration",
      type: "array",
      maxRows: 8,
      fields: [
        ...imageFields,
        {
          name: "altText",
          type: "text",
          required: true,
        },
        {
          name: "active",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    categoryShortcutField,
    {
      name: "productCarousels",
      type: "array",
      maxRows: 4,
      fields: productCarouselFields,
    },
  ],
};
