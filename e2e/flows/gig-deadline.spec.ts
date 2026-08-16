import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { createGig, signUpAs } from "./helpers";

/**
 * Deadline lifecycle (MVP-05, issue #33). The audit found a gig with a
 * yesterday deadline still listed and still offering contact, so these cover the
 * three places the state has to agree: the create form, the open directory, and
 * the detail page's contact panel.
 */

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local Supabase credentials are not in the worker environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** `YYYY-MM-DD`, offset by whole days from today in the deadline timezone. */
function deadlineDate(offsetDays: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const shifted = new Date(
    Date.UTC(value("year"), value("month") - 1, value("day") + offsetDays),
  );
  return shifted.toISOString().slice(0, 10);
}

test.describe("gig deadlines", () => {
  test("a past deadline is rejected on create", async ({ page }) => {
    await signUpAs(page, "CREATOR", "deadlinepast");

    await page.goto("/gigs/create");
    await page.locator('input[name="title"]').fill("Past Deadline Gig");
    await page.locator('textarea[name="description"]').fill("This should never be published.");
    await page.locator('select[name="projectType"]').selectOption("FILM");
    await page.locator('select[name="compensationType"]').selectOption("PAID");
    await page.locator('input[name="deadline"]').fill(deadlineDate(-1));
    await page.getByRole("button", { name: "Publish gig" }).click();

    await expect(page.getByText("Choose today or a later date.")).toBeVisible();
    await expect(page).toHaveURL(/\/gigs\/create/);
  });

  test("today's date is still a valid deadline", async ({ page }) => {
    await signUpAs(page, "CREATOR", "deadlinetoday");

    await page.goto("/gigs/create");
    await page.locator('input[name="title"]').fill("Deadline Today Gig");
    await page.locator('textarea[name="description"]').fill("Answerable through the end of today.");
    await page.locator('select[name="projectType"]').selectOption("FILM");
    await page.locator('select[name="compensationType"]').selectOption("PAID");
    await page.locator('input[name="deadline"]').fill(deadlineDate(0));
    await page.getByRole("button", { name: "Publish gig" }).click();

    await expect(page).toHaveURL(/\/gigs\/(?!create$)[^/]+$/, { timeout: 30_000 });
    await expect(page.getByText("Open call")).toBeVisible();
  });

  test("an expired gig leaves the directory and stops offering contact", async ({ page, browser }) => {
    await signUpAs(page, "CREATOR", "deadlineexpire");
    const gigId = await createGig(page, {
      title: "Expiring Directory Gig",
      description: "Live until its deadline passes, then a record of a closed call.",
    });

    // Backdate the deadline directly: waiting a day is not a test strategy, and
    // the create form deliberately refuses to produce this state.
    const admin = adminClient();
    const { error } = await admin
      .from("gig")
      .update({ deadline: deadlineDate(-1) })
      .eq("id", gigId);
    expect(error).toBeNull();

    // Re-save the gig unchanged so the public cache picks the new deadline up —
    // and prove in passing that an already-expired gig is still editable, which
    // is the escape hatch a creator needs to extend it.
    await page.goto(`/gigs/${gigId}/edit`);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(new RegExp(`/gigs/${gigId}$`), { timeout: 30_000 });

    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();

    await visitor.goto("/gigs");
    await expect(visitor.getByText("Expiring Directory Gig")).toHaveCount(0);

    await visitor.goto(`/gigs/${gigId}`);
    await expect(visitor.getByText("Expiring Directory Gig")).toBeVisible();
    await expect(visitor.getByText("Deadline passed")).toBeVisible();
    await expect(visitor.getByRole("button", { name: "Contact Creator" })).toHaveCount(0);

    await visitorContext.close();
  });
});
