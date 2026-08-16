"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ImageUp, Loader2 } from "lucide-react";
import type { Area, Point } from "react-easy-crop";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, emptyActionState } from "@/lib/form-utils";
import {
  createCroppedProfilePictureFile,
  PROFILE_PICTURE_ACCEPT,
  PROFILE_PICTURE_MAX_SOURCE_BYTES,
  profilePictureSelectionError,
} from "@/lib/profile-picture-crop";
import { ProfilePictureCropStage } from "./_profile-picture-crop-stage";
import { updateProfilePictureAction } from "./actions";

type Props = {
  name: string | null | undefined;
  image: string | null | undefined;
};

function initials(name: string | null | undefined) {
  return (name || "Escento")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function UpdateProfilePictureForm({ name, image }: Props) {
  const [currentImage, setCurrentImage] = useState(image ?? null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formFields = useFormFieldState();
  const [state, formAction, isPending] = useActionState(
    updateProfilePictureAction,
    emptyActionState,
  );

  const pictureError =
    clientError ?? dimensionError ?? state.fieldErrors?.profilePicture;
  const errors = {
    ...(state.fieldErrors ?? {}),
    ...(pictureError ? { profilePicture: pictureError } : {}),
  };
  const fieldErrorCount = countFieldErrors(errors);
  const abbr = useMemo(() => initials(name), [name]);
  const previewImage = sourceUrl ?? currentImage;
  const isBusy = isPreparing || isPending;

  useEffect(() => {
    const imageUrl = state.values?.imageUrl;
    if (state.ok && typeof imageUrl === "string") {
      setCurrentImage(imageUrl);
      setSourceFile(null);
      setSourceUrl(null);
      setCroppedArea(null);
      setClientError(null);
      setDimensionError(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [state]);

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const clearSelection = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setCroppedArea(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setClientError(null);
    setDimensionError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      clearSelection();
      return;
    }

    const error = profilePictureSelectionError(file);
    if (error) {
      clearSelection();
      setClientError(error);
      formFields.markTouched("profilePicture");
      return;
    }

    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setClientError(null);
    setDimensionError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formFields.setSubmitAttempted(true);

    if (!sourceFile || !sourceUrl) {
      setClientError("Choose a profile picture.");
      return;
    }
    if (dimensionError) return;
    if (!croppedArea) {
      setClientError("Position your image before saving.");
      return;
    }

    setIsPreparing(true);
    try {
      const croppedFile = await createCroppedProfilePictureFile(
        sourceFile,
        sourceUrl,
        croppedArea,
      );
      if (croppedFile.size > PROFILE_PICTURE_MAX_SOURCE_BYTES) {
        setClientError("Keep the image under 2 MB.");
        return;
      }

      const formData = new FormData();
      formData.set("profilePicture", croppedFile);
      setClientError(null);
      startTransition(() => formAction(formData));
    } catch (error) {
      setClientError(
        error instanceof Error
          ? error.message
          : "The cropped image could not be prepared.",
      );
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit}
    >
      {state.ok && state.message ? (
        <FormErrorBanner variant="success" message={state.message} />
      ) : null}

      {state.message && !state.ok ? (
        <FormErrorBanner
          message={state.message}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="media-avatar flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-[#E2E8F0]">
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-item-heading text-ink">{abbr}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <FormField
            id="profilePicture"
            label="Profile picture"
            required
            hint="JPG, PNG, or WebP. Max 2 MB. Crop to a square before saving."
            error={errors.profilePicture}
            showError={formFields.shouldShowError("profilePicture", errors.profilePicture)}
            onBlur={() => formFields.markTouched("profilePicture")}
          >
            <Input
              ref={inputRef}
              name="profilePicture"
              type="file"
              accept={PROFILE_PICTURE_ACCEPT}
              onChange={(event) =>
                handleFileChange(event.currentTarget.files?.[0] ?? null)
              }
              className="file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-control file:text-white hover:file:bg-brand"
            />
          </FormField>

          {sourceFile ? (
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#475569]">
              <ImageUp className="h-4 w-4 text-[#0055FF]" aria-hidden />
              {sourceFile.name}
            </p>
          ) : null}
        </div>
      </div>

      {sourceUrl ? (
        <ProfilePictureCropStage
          imageUrl={sourceUrl}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={setCroppedArea}
          onDimensionError={setDimensionError}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-brand bg-brand px-6 py-3 text-control text-white transition-colors duration-150 hover:border-ink hover:bg-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Preparing image…
            </>
          ) : (
            "Update picture"
          )}
        </button>
        {sourceFile ? (
          <button
            type="button"
            onClick={clearSelection}
            disabled={isBusy}
            className="inline-flex min-h-12 items-center justify-center border border-ink bg-white px-6 py-3 text-control text-ink transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel crop
          </button>
        ) : null}
      </div>
    </form>
  );
}
