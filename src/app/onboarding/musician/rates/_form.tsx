"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile, MusicianRate } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { skipRatesAction } from "./actions";

interface RatesFormProps {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  initialData: MusicianProfile;
  rates: MusicianRate[];
}

export function RatesForm({ action, initialData, rates }: RatesFormProps) {
  const [state, formAction] = useActionState(action, emptyActionState);
  const prefersReducedMotion = useReducedMotion();
  const [rateRows, setRateRows] = useState<Array<{ type: string; amount: string; description: string }>>(
    rates.length > 0
      ? rates.map((r) => ({
          type: r.rateType || "",
          amount: r.amount?.toString() || "",
          description: r.description || "",
        }))
      : [{ type: "", amount: "", description: "" }]
  );

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  function addRow() {
    setRateRows([...rateRows, { type: "", amount: "", description: "" }]);
  }

  function removeRow(idx: number) {
    setRateRows(rateRows.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: string, value: string) {
    const newRows = [...rateRows];
    newRows[idx] = { ...newRows[idx], [field]: value };
    setRateRows(newRows);
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your rates</h1>
        <p className="mt-2 text-sm text-[#64748B]">Let people know how much you charge</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-[#0F172A]">
            Rate Types <span className="text-[#94A3B8]">(optional)</span>
          </legend>

          {rateRows.map((row, idx) => (
            <div key={idx} className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`rate-${idx}-type`} className="text-xs font-medium text-[#64748B]">
                    Rate Type
                  </label>
                  <select
                    id={`rate-${idx}-type`}
                    name={`rate[${idx}][type]`}
                    value={row.type}
                    onChange={(e) => updateRow(idx, "type", e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
                    aria-invalid={!!state.fieldErrors?.[`rate[${idx}][type]`]}
                  >
                    <option value="">Select type...</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="project">Project Fee</option>
                    <option value="session">Session Fee</option>
                    <option value="performance">Performance Fee</option>
                  </select>
                  {state.fieldErrors?.[`rate[${idx}][type]`] && (
                    <p className="text-xs text-[#DC2626]">
                      {state.fieldErrors[`rate[${idx}][type]`]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`rate-${idx}-amount`} className="text-xs font-medium text-[#64748B]">
                    Amount ($)
                  </label>
                  <input
                    id={`rate-${idx}-amount`}
                    name={`rate[${idx}][amount]`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.amount}
                    onChange={(e) => updateRow(idx, "amount", e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
                    placeholder="0.00"
                    aria-invalid={!!state.fieldErrors?.[`rate[${idx}][amount]`]}
                  />
                  {state.fieldErrors?.[`rate[${idx}][amount]`] && (
                    <p className="text-xs text-[#DC2626]">
                      {state.fieldErrors[`rate[${idx}][amount]`]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor={`rate-${idx}-description`} className="text-xs font-medium text-[#64748B]">
                  Description (optional)
                </label>
                <input
                  id={`rate-${idx}-description`}
                  name={`rate[${idx}][description]`}
                  type="text"
                  value={row.description}
                  onChange={(e) => updateRow(idx, "description", e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
                  placeholder="e.g., includes arrangement"
                />
              </div>

              {rateRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="text-xs font-medium text-[#DC2626] hover:text-[#991B1B]"
                >
                  Remove this rate
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="rounded-full border border-[#0055FF] bg-white px-4 py-2 text-sm font-medium text-[#0055FF] hover:bg-[#EFF6FF]"
          >
            + Add another rate
          </button>
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Saving...">
            Next
          </FormSubmitButton>
          <form action={skipRatesAction}>
            <button
              type="submit"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
            >
              Skip
            </button>
          </form>
        </div>

        <Link
          href="/onboarding/musician/portfolio"
          className="block text-center text-sm text-[#64748B] hover:text-[#0F172A]"
        >
          ← Back
        </Link>
      </form>
    </motion.div>
  );
}
