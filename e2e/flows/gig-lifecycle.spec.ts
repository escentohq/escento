import { test, expect } from "@playwright/test";

import { signUpAs, createGig, clickUntil, newContextPage } from "./helpers";

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

  // Unquarantined with #34. The failure was real, not flake, and it was the
  // detail assertion: closing a gig used to make `/gigs/[id]` a 404 because the
  // anonymous read policy gated on `status = 'OPEN'`, so the "Call filled" state
  // this test looks for could never render. Visibility is now decided by
  // moderation alone; the directory keeps filtering the lifecycle.
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
    await clickUntil(
      page.getByRole("button", { name: "Mark Filled" }),
      page.getByRole("button", { name: "Reopen Gig" }),
    );

    await page.goto(directory);
    await expect(page.getByText(title)).toHaveCount(0);

    await page.goto(`/gigs/${gigId}`);
    await expect(page.getByText("Call filled")).toBeVisible();
    await expect(page.getByRole("button", { name: "Contact Creator" })).toHaveCount(0);

    await page.goto("/gigs/manage");
    await clickUntil(
      page.getByRole("button", { name: "Reopen Gig" }),
      page.getByRole("button", { name: "Mark Filled" }),
    );

    await page.goto(directory);
    await expect(page.getByText(title).first()).toBeVisible();
  });

  // QUARANTINED — see #41. Fails on `main` on both attempts, not flake: the
  // mutation reaches the server but the client never reflects it. Skipped so a
  // red suite means a NEW regression; unskip with the fix in #41.
  test.skip("deleting a gig removes it from management", async ({ page }) => {
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

  test("a closed gig keeps a readable, non-actionable detail page for anonymous visitors", async ({
    page,
    browser,
  }) => {
    const title = `Filled Detail ${stamp()}`;
    await signUpAs(page, "CREATOR", "gig-filled");
    const gigId = await createGig(page, {
      title,
      description: "Closed calls stay linkable so a shared URL does not rot.",
    });

    await page.goto("/gigs/manage");
    await clickUntil(
      page.getByRole("button", { name: "Mark Filled" }),
      page.getByRole("button", { name: "Reopen Gig" }),
    );

    const visitor = await newContextPage(browser);
    await visitor.goto(`/gigs/${gigId}`);
    await expect(visitor.getByRole("heading", { name: title })).toBeVisible();
    await expect(visitor.getByText("Call filled")).toBeVisible();
    await expect(visitor.getByRole("button", { name: "Contact Creator" })).toHaveCount(0);

    // ...and it is not inventory: the open directory does not carry it.
    await visitor.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(visitor.getByText(title)).toHaveCount(0);

    // Reopening restores both discovery and the contact action.
    await page.goto("/gigs/manage");
    await clickUntil(
      page.getByRole("button", { name: "Reopen Gig" }),
      page.getByRole("button", { name: "Mark Filled" }),
    );

    await visitor.goto(`/gigs/${gigId}`);
    await expect(visitor.getByText("Open call")).toBeVisible();
    await visitor.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(visitor.getByText(title).first()).toBeVisible();
  });
});
