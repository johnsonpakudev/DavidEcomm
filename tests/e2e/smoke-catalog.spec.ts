import { expect, test } from "@playwright/test";

test("homepage renders hero and featured products", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('img[src*="Carousel.png"]')).toBeVisible();
  await expect(page.getByText(/australia wide shipping/i)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /shop by essentials/i }),
  ).toBeVisible();
  await expect(page.getByAltText("On clearance")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /featured products/i }),
  ).toBeVisible();
  await expect(page.locator('a[href^="/categories/bathroom-vanities"]').first()).toBeVisible();
  await expect(page.locator("text=unsplash.com")).toHaveCount(0);
});

test("product page renders JSON-LD", async ({ page }) => {
  await page.goto(
    "/products/vellena-1500mm-pvc-water-proof-wall-hung-bathroom-vanity-poly-marble-basin",
  );

  await expect(
    page.getByRole("heading", {
      name: /vellena 1500mm pvc water proof wall hung bathroom vanity poly marble basin/i,
    }),
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test("category PLP shows paginated real products", async ({ page }) => {
  await page.goto("/categories/bathroom");
  await expect(
    page.getByRole("heading", { name: "Bathroom", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[href^="/products/"]').first()).toBeVisible();
});

test("search finds a known sku", async ({ page }) => {
  await page.goto("/search?q=VELPVC150WH-EO-E");
  await expect(page.locator("text=VELPVC150WH-EO-E").first()).toBeVisible();
});
