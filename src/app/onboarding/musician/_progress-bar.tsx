"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";

const STEPS = ["basics", "sound", "portfolio", "rates", "availability", "social", "preferences"];

export function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#F1F5F9] py-6">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const step = i + 1;
            const slug = STEPS[i];
            const isComplete = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div key={step} className="flex items-center">
                {step > 1 && (
                  <div
                    className={`h-0.5 w-8 transition-colors duration-300 ${
                      isComplete ? "bg-[#0055FF]" : "bg-[#F1F5F9]"
                    }`}
                  />
                )}
                <Link href={`/onboarding/musician/${slug}`}>
                  <button
                    disabled={step > currentStep}
                    className={`relative h-10 w-10 rounded-full font-bold text-sm transition-all duration-300 ${
                      isComplete
                        ? "bg-[#0055FF] text-white"
                        : isCurrent
                          ? "bg-white border-2 border-[#0055FF] text-[#0055FF]"
                          : "bg-[#F1F5F9] text-[#64748B] cursor-default"
                    } disabled:cursor-not-allowed`}
                  >
                    {step}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center text-sm font-medium text-[#475569]">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    </div>
  );
}
