import { describe, expect, it } from "vitest";

import { toGig, toProfile, toPublicProfile } from "@/lib/api/normalizers";

/**
 * The snake_case -> camelCase mapping and junction flattening is exactly the
 * code that breaks quietly on a column rename: the query still succeeds, the
 * field just arrives as `undefined` and renders as blank.
 */

const gigRow = {
  id: "g1",
  creator_id: "u1",
  title: "Bassist for a weekend session",
  description: "Two days, original material.",
  project_type: "RECORDING",
  location: "Austin",
  location_display_name: "Austin, TX",
  location_place_id: "place-1",
  location_lat: 30.2672,
  location_lng: -97.7431,
  location_city: "Austin",
  location_state: "TX",
  location_country: "US",
  location_provider: "geoapify",
  provider_place_id: "geo-1",
  is_remote: false,
  compensation_type: "PAID",
  compensation_details: "$400 flat",
  deadline: "2026-09-01",
  status: "OPEN",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  gig_instrument: [{ instrument: { name: "Bass" } }, { instrument: { name: "Guitar" } }],
  gig_genre: [{ genre: { name: "Indie" } }],
};

describe("toGig", () => {
  it("maps every column to its camelCase field", () => {
    const gig = toGig(gigRow);
    expect(gig).toMatchObject({
      id: "g1",
      creatorId: "u1",
      projectType: "RECORDING",
      locationDisplayName: "Austin, TX",
      locationPlaceId: "place-1",
      providerPlaceId: "geo-1",
      isRemote: false,
      compensationType: "PAID",
      compensationDetails: "$400 flat",
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
    });
  });

  it("flattens junction rows to plain name arrays", () => {
    const gig = toGig(gigRow);
    expect(gig.instruments).toEqual(["Bass", "Guitar"]);
    expect(gig.genres).toEqual(["Indie"]);
  });

  it("defaults missing junctions and location visibility rather than throwing", () => {
    const gig = toGig({ id: "g2" });
    expect(gig.instruments).toEqual([]);
    expect(gig.genres).toEqual([]);
    expect(gig.locationVisibility).toBe("public_region");
    expect(gig.distanceMiles).toBeNull();
  });

  it("drops junction rows whose joined tag is missing", () => {
    const gig = toGig({ ...gigRow, gig_instrument: [{ instrument: null }, { instrument: { name: "Bass" } }] });
    expect(gig.instruments).toEqual(["Bass"]);
  });

  it("carries the creator summary and distance through untouched", () => {
    const gig = toGig(gigRow, { id: "u1", name: "Ada", email: null }, 12.5);
    expect(gig.creator).toEqual({ id: "u1", name: "Ada", email: null });
    expect(gig.distanceMiles).toBe(12.5);
  });
});

const profileRow = {
  id: "p1",
  user_id: "u1",
  display_name: "Ada Lovelace",
  bio: "Session bassist.",
  school: "UT Austin",
  location_display_name: "Austin, TX",
  location_lat: 30.2672,
  location_lng: -97.7431,
  is_remote: true,
  seeking_paid: true,
  seeking_unpaid: false,
  years_experience: 6,
  availability_text: "Weekends",
  contact_email: "ada@example.com",
  instagram_url: "https://instagram.com/ada",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  app_user: { image: "https://cdn.example.com/ada.jpg" },
  musician_instrument: [{ instrument: { name: "Bass" } }],
  musician_genre: [{ genre: { name: "Jazz" } }, { genre: { name: "Soul" } }],
};

describe("toProfile", () => {
  it("maps columns and flattens both junction tables", () => {
    const profile = toProfile(profileRow);
    expect(profile).toMatchObject({
      userId: "u1",
      displayName: "Ada Lovelace",
      yearsExperience: 6,
      availabilityText: "Weekends",
      seekingPaid: true,
      seekingUnpaid: false,
    });
    expect(profile.instruments).toEqual(["Bass"]);
    expect(profile.genres).toEqual(["Jazz", "Soul"]);
  });

  it("takes the avatar from the joined app_user row by default", () => {
    expect(toProfile(profileRow).image).toBe("https://cdn.example.com/ada.jpg");
    expect(toProfile(profileRow, null, "https://override/x.jpg").image).toBe("https://override/x.jpg");
    expect(toProfile({ id: "p2", user_id: "u2" }).image).toBeNull();
  });
});

describe("toPublicProfile", () => {
  it("never lets a contact email reach a public, cached read", () => {
    expect(toProfile(profileRow).contactEmail).toBe("ada@example.com");
    expect(toPublicProfile(profileRow).contactEmail).toBe("");
  });

  it("otherwise matches toProfile", () => {
    const { contactEmail: _publicEmail, ...publicRest } = toPublicProfile(profileRow);
    const { contactEmail: _ownerEmail, ...ownerRest } = toProfile(profileRow);
    expect(publicRest).toEqual(ownerRest);
  });
});
