import { test, expect } from "@playwright/test";

import { signUpAs, createGig, newContextPage } from "./helpers";

const stamp = () => Date.now().toString(36);

/**
 * Gig lifecycle write flows: edit, close/reopen (directory visibility),
 * delete, and the cross-creator ownership guard.
 */
test.describe("gig lifecycle", () => {
  test("editing a gig updates its detail page", async ({ page }) => {
    const updated = `Edited ${stamp()}`;
    await signUpAs(page, "CREATOR", "gig-edit");
    const gigId = await createGig(page, {
      title: `Edit Me ${stamp()}`,
      description: "Original brief for an automated edit test.",
    });

    await page.goto(`/gigs/${gigId}/edit`);
    await page.locator('input[name="title"]').fill(updated);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await page.waitForURL(new RegExp(`/gigs/${gigId}$`));
    await expect(page.getByRole("heading", { name: updated })).toBeVisible();
  });

  test("closing a gig hides it from the directory; reopening restores it", async ({ page }) => {
    const title = `Lifecycle ${stamp()}`;
    // Filter the directory to just this gig so the assertion is immune to other
    // gigs accumulating in the directory (the new gig may otherwise be far down
    // a long, animated list).
    const directory = `/gigs?q=${encodeURIComponent(title)}`;
    await signUpAs(page, "CREATOR", "gig-close");
    const gigId = await createGig(page, {
      title,
      description: "A gig to close and reopen in an automated test.",
    });

    await page.goto(directory);
    await expect(page.getByText(title).first()).toBeVisible();

    // Close/reopen buttons live on /gigs/manage and redirect back to it, so a
    // URL wait is a no-op. Sync on the manage card's button state instead, which
    // the action revalidates — this guarantees the status change has committed
    // before we re-check the directory.
    await page.goto("/gigs/manage");
    await page.getByRole("button", { name: "Mark Filled" }).click();
    await expect(page.getByRole("button", { name: "Reopen Gig" })).toBeVisible();

    await page.goto(directory);
    await expect(page.getByText(title)).toHaveCount(0);

    await page.goto(`/gigs/${gigId}`);
    await expect(page.getByText("Filled", { exact: true })).toBeVisible();

    await page.goto("/gigs/manage");
    await page.getByRole("button", { name: "Reopen Gig" }).click();
    await expect(page.getByRole("button", { name: "Mark Filled" })).toBeVisible();

    await page.goto(directory);
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test("deleting a gig removes it from management", async ({ page }) => {
    const title = `Delete Me ${stamp()}`;
    await signUpAs(page, "CREATOR", "gig-del");
    await createGig(page, { title, description: "A gig to delete in an automated test." });

    await page.goto("/gigs/manage");
    await expect(page.getByText(title)).toBeVisible();

    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Delete gig", exact: true }).click();

    // The delete action redirects back to /gigs/manage (a no-op URL wait), so
    // assert directly that the gig card is gone from management.
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test("a creator cannot edit another creator's gig", async ({ browser }) => {
    const owner = await newContextPage(browser);
    await signUpAs(owner, "CREATOR", "gig-own");
    const gigId = await createGig(owner, {
      title: `Owned ${stamp()}`,
      description: "Owned gig for an ownership guard test.",
    });

    const intruder = await newContextPage(browser);
    await signUpAs(intruder, "CREATOR", "gig-intruder");
    await intruder.goto(`/gigs/${gigId}/edit`);

    // The edit route redirects non-owners back to management.
    await expect(intruder).toHaveURL(/\/gigs\/manage$/);
  });
});
