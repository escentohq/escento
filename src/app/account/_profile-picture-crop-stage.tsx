"use client";

import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";

import { PROFILE_PICTURE_MIN_DIMENSION } from "@/lib/profile-picture-crop";

type Props = {
  imageUrl: string;
  crop: Point;
  zoom: number;
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (crop: Area) => void;
  onDimensionError: (message: string | null) => void;
};

export function ProfilePictureCropStage({
  imageUrl,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onDimensionError,
}: Props) {
  const handleMediaLoaded = (media: MediaSize) => {
    onDimensionError(
      media.naturalWidth < PROFILE_PICTURE_MIN_DIMENSION ||
        media.naturalHeight < PROFILE_PICTURE_MIN_DIMENSION
        ? `Choose a larger image. Use at least ${PROFILE_PICTURE_MIN_DIMENSION} by ${PROFILE_PICTURE_MIN_DIMENSION} pixels.`
        : null,
    );
  };

  return (
    <div
      className="space-y-4 border-y border-rule py-5"
      role="group"
      aria-label="Crop profile picture"
    >
      <div className="relative h-72 w-full overflow-hidden bg-ink sm:h-80">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          objectFit="contain"
          keyboardStep={6}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={(_, pixels) => onCropComplete(pixels)}
          onMediaLoaded={handleMediaLoaded}
          cropperProps={{
            "aria-label": "Move the image inside the crop area",
            "aria-describedby": "profile-picture-crop-help",
          }}
        />
      </div>

      <p id="profile-picture-crop-help" className="text-sm leading-relaxed text-muted">
        Drag the image to position it. Use the slider, scroll wheel, pinch gesture, or arrow keys to adjust the crop.
      </p>

      <div>
        <label htmlFor="profilePictureZoom" className="text-sm font-bold text-ink">
          Zoom
        </label>
        <input
          id="profilePictureZoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="mt-2 h-11 w-full cursor-pointer accent-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        />
      </div>
    </div>
  );
}
