"use client";

import { Check, Circle } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { getPasswordStrength, type PasswordStrengthLabel } from "@/lib/password";

const STRENGTH_COLORS: Record<PasswordStrengthLabel, string> = {
  "Too short": "#64748B",
  Weak: "#FF3366",
  Fair: "#FFB000",
  Good: "#0055FF",
  Strong: "#16A34A",
};

type Props = {
  password: string;
};

export function PasswordStrengthIndicator({ password }: Props) {
  const reducedMotion = useReducedMotion();
  const { score, label, requirements } = getPasswordStrength(password);
  const activeColor = STRENGTH_COLORS[label];
  const transitionClass = reducedMotion ? "" : "transition-all duration-300";

  return (
    <div className="mt-3 space-y-3" role="status" aria-live="polite">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex flex-1 gap-1.5"
            aria-label={`Password strength: ${label}`}
          >
            {[1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={`h-1.5 flex-1 rounded-full bg-[#E2E8F0] ${transitionClass}`}
              >
                <div
                  className={`h-full rounded-full ${transitionClass}`}
                  style={{
                    width: score >= segment ? "100%" : "0%",
                    backgroundColor: score >= segment ? activeColor : "transparent",
                  }}
                />
              </div>
            ))}
          </div>
          <span
            className="shrink-0 text-xs font-bold uppercase tracking-wide"
            style={{ color: activeColor }}
          >
            {label}
          </span>
        </div>
      </div>

      <ul className="space-y-1.5">
        {requirements.map((requirement) => (
          <li
            key={requirement.id}
            className={`flex items-center gap-2 text-sm ${
              requirement.met ? "font-medium text-[#0055FF]" : "font-medium text-[#64748B]"
            }`}
          >
            {requirement.met ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
