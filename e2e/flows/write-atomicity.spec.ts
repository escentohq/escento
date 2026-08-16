import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { createMusicianProfile, signUp, signUpAs, chooseRole, uniqueEmail } from "./helpers";

/**
 * Failure injection for the transactional profile writes (MVP-03, issue #30).
 *
 * The happy paths are already covered by the wizard and edit specs. What was
 * never covered is the failure *between* the root row and its taxonomy — the
 * exact window the old split PostgREST calls left open. A junction row pointing
 * at a tag id that does not exist violates the foreign key at the end of the
 * function, so it makes that window observable: if the write is transactional,
 * nothing survives.
 */

const MISSING_TAG_ID = "00000000-0000-4000-8000-0000000000ff";

/** A client authenticated as a real test account — RLS and auth.uid() apply. */
async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Local Supabase credentials are not in the worker environment.");

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function anyTagId(client: SupabaseClient, table: "instrument" | "genre"): Promise<string> {
  const { data, error } = await client.from(table).select("id").limit(1).single();
  if (error) throw error;
  return data.id as string;
}

test.describe("profile writes are atomic", () => {
  test("a failed create leaves no profile row behind", async ({ page }) => {
    const creds = await signUp(page, "atomiccreate");
    await chooseRole(page, "MUSICIAN");
    const client = await signedInClient(creds.email, creds.password);

    const displayName = `Rollback ${uniqueEmail("x").split("@")[0]}`;
    const { error } = await client.rpc("create_musician_profile_with_tags", {
      p_profile: { display_name: displayName },
      p_instrument_ids: [MISSING_TAG_ID],
      p_genre_ids: [],
    });

    expect(error).not.toBeNull();

    const { data: rows, error: readError } = await client
      .from("musician_profile")
      .select("id")
      .eq("display_name", displayName);
    expect(readError).toBeNull();
    expect(rows).toHaveLength(0);
  });

  test("a failed edit preserves the previous row and its tags", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "atomicedit");
    const profileId = await createMusicianProfile(page, "Atomic Edit Original");
    const client = await signedInClient(creds.email, creds.password);

    // Seed a real instrument through the same transactional path.
    const instrumentId = await anyTagId(client, "instrument");
    const { error: seedError } = await client.rpc("update_musician_profile_with_tags", {
      p_id: profileId,
      p_profile: {},
      p_instrument_ids: [instrumentId],
      p_genre_ids: null,
    });
    expect(seedError).toBeNull();

    // Now fail on the taxonomy half, after the root row has been written.
    const { error } = await client.rpc("update_musician_profile_with_tags", {
      p_id: profileId,
      p_profile: { display_name: "Atomic Edit Overwritten", bio: "should not survive" },
      p_instrument_ids: [],
      p_genre_ids: [MISSING_TAG_ID],
    });
    expect(error).not.toBeNull();

    const { data: row } = await client
      .from("musician_profile")
      .select("display_name, bio")
      .eq("id", profileId)
      .single();
    expect(row?.display_name).toBe("Atomic Edit Original");
    expect(row?.bio).toBeNull();

    const { data: instruments } = await client
      .from("musician_instrument")
      .select("instrument_id")
      .eq("musician_profile_id", profileId);
    expect(instruments).toHaveLength(1);
    expect(instruments?.[0].instrument_id).toBe(instrumentId);
  });

  test("another account cannot update a profile through the RPC", async ({ page, browser }) => {
    await signUpAs(page, "MUSICIAN", "atomicowner");
    const profileId = await createMusicianProfile(page, "Atomic Owner Only");

    const intruderContext = await browser.newContext();
    const intruderPage = await intruderContext.newPage();
    const intruder = await signUpAs(intruderPage, "MUSICIAN", "atomicintruder");
    const client = await signedInClient(intruder.email, intruder.password);

    const { error } = await client.rpc("update_musician_profile_with_tags", {
      p_id: profileId,
      p_profile: { display_name: "Hijacked" },
      p_instrument_ids: null,
      p_genre_ids: null,
    });
    expect(error).not.toBeNull();

    const { data: row } = await client
      .from("musician_profile")
      .select("display_name")
      .eq("id", profileId)
      .single();
    expect(row?.display_name).toBe("Atomic Owner Only");

    await intruderContext.close();
  });
});
