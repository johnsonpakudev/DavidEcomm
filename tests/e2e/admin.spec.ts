import { test, expect } from "@playwright/test";

test.describe("admin auth", () => {
  test("redirects unauthenticated users to login when admin is enabled", async ({
    page,
  }) => {
    test.skip(process.env.ENABLE_ADMIN !== "true", "Admin routes are disabled");

    const response = await page.goto("/admin/orders");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
