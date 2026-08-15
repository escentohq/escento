import { PROFILE_WIZARD_TOTAL } from "@/lib/profile-progress";

/**
 * Step counter for the profile create wizard. Rendered per step page rather than
 * from a shared layout: the App Router preserves a layout across sibling
 * segments, so progress placed there would not advance.
 */
export function WizardProgress({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <p className="text-meta uppercase text-brand">
        Step {current} of {PROFILE_WIZARD_TOTAL}
      </p>
      <div
        className="mt-3 flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={PROFILE_WIZARD_TOTAL}
        aria-valuenow={current}
        aria-label="Profile setup progress"
      >
        {Array.from({ length: PROFILE_WIZARD_TOTAL }, (_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 ${index < current ? "bg-brand" : "bg-rule"}`}
          />
        ))}
      </div>
    </div>
  );
}
