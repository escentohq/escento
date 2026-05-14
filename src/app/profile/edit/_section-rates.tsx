"use client";

import { useActionState, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { saveRatesSection } from "./actions";

interface RatesSectionProps {
  profile: MusicianProfile;
}

export function RatesSection({ profile }: RatesSectionProps) {
  const [state, formAction] = useActionState(saveRatesSection, emptyActionState);
  const [rates, setRates] = useState<Array<{ type: string; amount: string; description: string }>>([
    { type: "", amount: "", description: "" },
  ]);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  function addRate() {
    setRates([...rates, { type: "", amount: "", description: "" }]);
  }

  function removeRate(idx: number) {
    setRates(rates.filter((_, i) => i !== idx));
  }

  function updateRate(idx: number, field: string, value: string) {
    const newRates = [...rates];
    newRates[idx] = { ...newRates[idx], [field]: value };
    setRates(newRates);
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Your Rates</h2>
        <p className="mt-1 text-sm text-[#64748B]">Tell people how much you charge</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-[#0F172A]">Rate Types</legend>

          {rates.map((rate, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-4">
              <div className="grid grid-cols-2 gap-3">
                <select
                  name={`rate[${idx}][type]`}
                  value={rate.type}
                  onChange={(e) => updateRate(idx, "type", e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="project">Project Fee</option>
                  <option value="session">Session Fee</option>
                  <option value="performance">Performance Fee</option>
                </select>

                <input
                  name={`rate[${idx}][amount]`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate.amount}
                  onChange={(e) => updateRate(idx, "amount", e.target.value)}
                  placeholder="Amount ($)"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
                />
              </div>

              <input
                name={`rate[${idx}][description]`}
                type="text"
                value={rate.description}
                onChange={(e) => updateRate(idx, "description", e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
              />

              {rates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRate(idx)}
                  className="text-xs font-medium text-[#DC2626] hover:text-[#991B1B]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRate}
            className="rounded-full border border-[#0055FF] bg-white px-4 py-2 text-sm font-medium text-[#0055FF] hover:bg-[#EFF6FF]"
          >
            + Add Rate
          </button>
        </fieldset>

        <div className="flex gap-3 border-t border-[#E2E8F0] pt-6">
          <FormSubmitButton className="rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC]" pendingLabel="Saving...">
            Save Changes
          </FormSubmitButton>
        </div>
      </form>
    </motion.div>
  );
}
