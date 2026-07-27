import type { Field } from "payload";

import { CATEGORY_ICON_KEYS } from "@/lib/homepage/icon-keys";

export const imageFields: Field[] = [
  {
    name: "image",
    type: "upload",
    relationTo: "media",
  },
  {
    name: "externalImageUrl",
    type: "text",
    label: "External image URL",
    admin: {
      description: "Use for existing CDN URLs when not uploading a file.",
    },
  },
];

export const categoryShortcutField: Field = {
  name: "categoryShortcuts",
  type: "array",
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
    },
    {
      name: "iconKey",
      type: "select",
      required: true,
      options: CATEGORY_ICON_KEYS.map((value) => ({ label: value, value })),
    },
  ],
};

export const productCarouselFields: Field[] = [
  {
    name: "key",
    type: "select",
    required: true,
    options: [
      { label: "Featured", value: "featured" },
      { label: "Best sellers", value: "best-sellers" },
      { label: "New arrivals", value: "new-arrivals" },
    ],
  },
  {
    name: "title",
    type: "text",
    required: true,
  },
  {
    name: "subtitle",
    type: "textarea",
  },
  {
    name: "viewAllHref",
    type: "text",
  },
  {
    name: "ctaLabel",
    type: "text",
    defaultValue: "View collection",
  },
  {
    name: "selectionMode",
    type: "select",
    required: true,
    defaultValue: "collection",
    options: [
      { label: "By collection", value: "collection" },
      { label: "Manual product slugs", value: "manual" },
      { label: "Sort rule", value: "rule" },
    ],
  },
  {
    name: "collectionSlug",
    type: "text",
    admin: {
      condition: (_, siblingData) => siblingData?.selectionMode === "collection",
    },
  },
  {
    name: "productSlugs",
    type: "array",
    admin: {
      condition: (_, siblingData) => siblingData?.selectionMode === "manual",
    },
    fields: [
      {
        name: "slug",
        type: "text",
        required: true,
      },
    ],
  },
  {
    name: "sort",
    type: "select",
    defaultValue: "featured",
    options: [
      { label: "Featured", value: "featured" },
      { label: "Newest", value: "newest" },
      { label: "Price low to high", value: "price-asc" },
      { label: "Price high to low", value: "price-desc" },
    ],
    admin: {
      condition: (_, siblingData) =>
        siblingData?.selectionMode === "collection" ||
        siblingData?.selectionMode === "rule",
    },
  },
  {
    name: "limit",
    type: "number",
    defaultValue: 4,
    min: 1,
    max: 12,
  },
  {
    name: "active",
    type: "checkbox",
    defaultValue: true,
  },
];
