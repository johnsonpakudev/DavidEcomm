#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_SITE_URL = "https://david-ecomm-johnson-dev1.vercel.app";
const siteUrl = (
  process.argv.find((arg) => arg.startsWith("http")) ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  DEFAULT_SITE_URL
).replace(/\/$/, "");

const localOnly = process.argv.includes("--local");
const sampleSize = 5;

function fail(message) {
  console.error(`✗ ${message}`);
  return message;
}

async function fetchStatus(url) {
  const response = await fetch(url, { redirect: "follow" });

  return {
    url,
    ok: response.ok,
    status: response.status,
  };
}

function validateLocalCatalog() {
  const categoriesPath = resolve("public/data/catalog/categories.json");
  const homepagePath = resolve("public/data/catalog/homepage.json");
  const productsPath = resolve("public/data/catalog/products.json");

  const failures = [];

  const categories = JSON.parse(readFileSync(categoriesPath, "utf8"));
  const homepage = JSON.parse(readFileSync(homepagePath, "utf8"));
  const products = JSON.parse(readFileSync(productsPath, "utf8"));

  const megaMenuCategories = categories.filter((category) => category.show_in_mega_menu);
  const pillars = megaMenuCategories.filter((category) => category.parent_id === null);
  const noisyMegaMenu = megaMenuCategories.filter((category) => category.name.includes(";"));

  if (pillars.length !== 3) {
    failures.push(
      fail(`Expected 3 mega-menu pillars, found ${pillars.length}`),
    );
  }

  if (noisyMegaMenu.length > 0) {
    failures.push(
      fail(`Mega-menu contains ${noisyMegaMenu.length} categories with malformed names`),
    );
  }

  for (const pillar of pillars) {
    const children = megaMenuCategories.filter(
      (category) => category.parent_id === pillar.id,
    );

    if (children.length === 0) {
      failures.push(fail(`Pillar "${pillar.name}" has no curated children`));
    }

    if (children.length > 10) {
      failures.push(
        fail(`Pillar "${pillar.name}" has ${children.length} mega-menu children (expected ≤10)`),
      );
    }
  }

  const categorySlugs = new Set(categories.map((category) => category.slug));

  for (const card of homepage.collectionCards ?? []) {
    if (card.href?.startsWith("/categories/")) {
      const slug = card.href.replace("/categories/", "");

      if (!categorySlugs.has(slug)) {
        failures.push(fail(`Homepage collection links to missing category: ${slug}`));
      }
    }
  }

  if (!Array.isArray(products) || products.length < 2000) {
    failures.push(fail(`Expected 2,000+ products in catalog, found ${products.length}`));
  }

  console.log(
    `Local catalog: ${products.length} products, ${megaMenuCategories.length} mega-menu items`,
  );

  return failures;
}

async function validateRemoteSite() {
  const failures = [];

  const routes = ["/", "/sale", "/search", "/sitemap.xml", "/robots.txt"];

  for (const route of routes) {
    const result = await fetchStatus(`${siteUrl}${route}`);

    if (!result.ok) {
      failures.push(fail(`${route} returned ${result.status}`));
    } else {
      console.log(`✓ ${route}`);
    }
  }

  const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml`);

  if (sitemapResponse.ok) {
    const sitemapXml = await sitemapResponse.text();
    const productUrls = [...sitemapXml.matchAll(/<loc>([^<]*\/products\/[^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );

    if (productUrls.length === 0) {
      failures.push(fail("Sitemap contains no product URLs"));
    } else {
      const sample = productUrls.slice(0, sampleSize);

      for (const url of sample) {
        const result = await fetchStatus(url);

        if (!result.ok) {
          failures.push(fail(`Sample PDP failed: ${url} (${result.status})`));
        } else {
          console.log(`✓ ${url.replace(siteUrl, "")}`);
        }
      }
    }
  }

  return failures;
}

async function main() {
  console.log(`Verifying ${localOnly ? "local catalog" : siteUrl}\n`);

  const failures = localOnly ? validateLocalCatalog() : [...(await validateRemoteSite())];

  if (!localOnly) {
    failures.push(...validateLocalCatalog());
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll production checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
