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
      maxRows: 5,
      fields: [
        {
          name: "headline",
          type: "text",
          required: true,
        },
        {
          name: "subheadline",
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
