import { describe, expect, it } from "vitest";

import {
  PROFILE_PICTURE_OUTPUT_SIZE,
  profilePictureSelectionError,
} from "@/lib/profile-picture-crop";

describe("profile picture crop validation", () => {
  it("accepts the image formats supported by the server action", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      const file = new File(["image"], `profile.${type.split("/")[1]}`, { type });
      expect(profilePictureSelectionError(file)).toBeNull();
    }
  });

  it("rejects unsupported and oversized source images", () => {
    expect(
      profilePictureSelectionError(
        new File(["image"], "profile.gif", { type: "image/gif" }),
      ),
    ).toBe("Use a JPG, PNG, or WebP image.");

    const oversized = new File(
      [new Uint8Array(2 * 1024 * 1024 + 1)],
      "profile.jpg",
      { type: "image/jpeg" },
    );
    expect(profilePictureSelectionError(oversized)).toBe(
      "Keep the image under 2 MB.",
    );
  });

  it("produces a stable square avatar size", () => {
    expect(PROFILE_PICTURE_OUTPUT_SIZE).toBe(512);
  });
});
