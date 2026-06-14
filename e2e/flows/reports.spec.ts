import { test, expect } from "@playwright/test";

import { newCreatorWithGig, newMusician } from "./helpers";

test("musician can report a gig with validation and success path", async ({ browser }) => {
  const { gigId } = await newCreatorWithGig(browser, "report-creator", "Report Target Gig");
  const reporter = await newMusician(browser, "report-musician");

  await reporter.goto(`/gigs/${gigId}`);
  await reporter.getByRole("button", { name: "Report" }).click();

  await reporter.locator('input[name="subject"]').fill("hi");
  await reporter.locator('textarea[name="description"]').fill("too short");
  await reporter.getByRole("button", { name: "Send report" }).click();
  await expect(reporter.getByText("Subject is too short.")).toBeVisible();

  await reporter.locator('input[name="subject"]').fill("Suspicious listing behavior");
  await reporter.locator('textarea[name="description"]').fill(
    "The gig repeatedly reposts with inconsistent details and asks for payment off-platform.",
  );
  await reporter.getByRole("button", { name: "Send report" }).click();

  await expect(
    reporter.getByText("Thanks. Your report has been sent to the Escento team."),
  ).toBeVisible();
});
