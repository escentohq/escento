import type { Area } from "react-easy-crop";

export const PROFILE_PICTURE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PROFILE_PICTURE_MAX_SOURCE_BYTES = 2 * 1024 * 1024;
export const PROFILE_PICTURE_MIN_DIMENSION = 200;
export const PROFILE_PICTURE_OUTPUT_SIZE = 512;

const SUPPORTED_TYPES = new Set(PROFILE_PICTURE_ACCEPT.split(","));

export function profilePictureSelectionError(file: File): string | null {
  if (!SUPPORTED_TYPES.has(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size > PROFILE_PICTURE_MAX_SOURCE_BYTES) {
    return "Keep the image under 2 MB.";
  }
  return null;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be opened."));
    image.src = source;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The cropped image could not be prepared."));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export async function createCroppedProfilePictureFile(
  sourceFile: File,
  sourceUrl: string,
  crop: Area,
): Promise<File> {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = PROFILE_PICTURE_OUTPUT_SIZE;
  canvas.height = PROFILE_PICTURE_OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("The cropped image could not be prepared.");

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    PROFILE_PICTURE_OUTPUT_SIZE,
    PROFILE_PICTURE_OUTPUT_SIZE,
  );

  const blob = await canvasBlob(canvas);
  const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "profile";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
