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

  test("user previews, crops, and uploads a profile picture", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "account-picture");
    await page.goto("/account");

    const dataUrl = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.fillStyle = "#0055FF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#FFFFFF";
      context.fillRect(80, 40, 160, 160);
      return canvas.toDataURL("image/jpeg", 0.9);
    });

    const pictureInput = page.locator('input[name="profilePicture"]');
    await page.waitForFunction(() => {
      const input = document.querySelector('input[name="profilePicture"]');
      return Boolean(
        input &&
          Object.keys(input).some((key) => key.startsWith("__reactProps$")),
      );
    });
    await pictureInput.setInputFiles({
      name: "profile-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from(dataUrl.split(",")[1], "base64"),
    });

    await expect(page.getByRole("group", { name: "Crop profile picture" })).toBeVisible();
    await expect(page.getByLabel("Zoom")).toBeVisible();
    await page.getByLabel("Zoom").fill("1.4");
    await page.getByRole("button", { name: "Update picture" }).click();

    await expect(page.getByText("Profile picture updated.")).toBeVisible();
    await expect(page.getByRole("group", { name: "Crop profile picture" })).toHaveCount(0);
  });
});
