import { test, expect } from "@playwright/test";

import { signUpAs } from "./helpers";

test.describe("account", () => {
  test("user can update display name and see success", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "account-name");

    await page.goto("/account");
    await page.locator('input[name="name"]').fill("Updated Account Name");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Name updated.")).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue("Updated Account Name");
  });

  test("user cannot save an empty display name", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "account-empty-name");

    await page.goto("/account");
    await page.locator('input[name="name"]').fill("");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Add the name musicians should see.")).toBeVisible();
  });
});
