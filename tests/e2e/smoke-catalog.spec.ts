import { expect, test } from "@playwright/test";

test("homepage renders hero and featured products", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /premium fixtures for the spaces that matter most/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /featured products/i }),
  ).toBeVisible();
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
  await expect(page.getByRole("heading", { name: /bathroom/i })).toBeVisible();
  await expect(page.locator('[href^="/products/"]').first()).toBeVisible();
});

test("search finds a known sku", async ({ page }) => {
  await page.goto("/search?q=VELPVC150WH-EO-E");
  await expect(page.locator("text=VELPVC150WH-EO-E").first()).toBeVisible();
});
