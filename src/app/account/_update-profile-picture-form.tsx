"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ImageUp } from "lucide-react";

import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormField } from "@/components/ui/form-field";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, emptyActionState } from "@/lib/form-utils";
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
  const [selectedFileName, setSelectedFileName] = useState("");
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(updateProfilePictureAction, emptyActionState);

  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);
  const abbr = useMemo(() => initials(name), [name]);

  useEffect(() => {
    const imageUrl = state.values?.imageUrl;
    if (state.ok && typeof imageUrl === "string") {
      setCurrentImage(imageUrl);
      setSelectedFileName("");
    }
  }, [state]);

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
      onSubmit={() => formFields.setSubmitAttempted(true)}
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
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] ring-4 ring-[#F1F5F9]">
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-[#0F172A]">{abbr}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <FormField
            id="profilePicture"
            label="Profile picture"
            required
            hint="JPG, PNG, or WebP. Max 2 MB."
            error={errors.profilePicture}
            showError={formFields.shouldShowError("profilePicture", errors.profilePicture)}
            onBlur={() => formFields.markTouched("profilePicture")}
          >
            <Input
              name="profilePicture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setSelectedFileName(event.currentTarget.files?.[0]?.name ?? "")
              }
              className="file:mr-4 file:rounded-full file:border-0 file:bg-[#0F172A] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#0055FF]"
            />
          </FormField>

          {selectedFileName ? (
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#475569]">
              <ImageUp className="h-4 w-4 text-[#0055FF]" aria-hidden />
              {selectedFileName}
            </p>
          ) : null}
        </div>
      </div>

      <FormSubmitButton pendingLabel="Uploading…">
        Update Picture
      </FormSubmitButton>
    </form>
  );
}
