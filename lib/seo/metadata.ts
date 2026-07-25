import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import type { Category, Product } from "@/lib/supabase/types";

export const siteName = brand.name;
export const siteDescription = brand.description;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${siteName} | ${brand.tagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: absoluteUrl("/"),
      title: `${siteName} | ${brand.tagline}`,
      description: siteDescription,
      siteName,
      images: [{ url: absoluteUrl(brand.logo.light) }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${brand.tagline}`,
      description: siteDescription,
      images: [absoluteUrl(brand.logo.light)],
    },
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: absoluteUrl(input.path),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      images: input.image ? [{ url: input.image }] : undefined,
    },
    twitter: {
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

export function buildProductMetadata(product: Product): Metadata {
  return buildPageMetadata({
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.description ||
      siteDescription,
    path: `/products/${product.slug}`,
    image:
      product.og_image_url || product.product_images?.[0]?.url || null,
  });
}

export function buildCategoryMetadata(category: Category): Metadata {
  return buildPageMetadata({
    title: category.meta_title || category.name,
    description:
      category.meta_description ||
      `Shop ${category.name.toLowerCase()} at ${siteName}.`,
    path: `/categories/${category.slug}`,
    image: category.mega_menu_image,
  });
}
