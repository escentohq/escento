"use client";

import { useActionState, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { MusicianProfile } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { saveEquipmentSection } from "./actions";

interface EquipmentSectionProps {
  profile: MusicianProfile;
}

export function EquipmentSection({ profile }: EquipmentSectionProps) {
  const [state, formAction] = useActionState(saveEquipmentSection, emptyActionState);
  const [equipment, setEquipment] = useState<Array<{ name: string; type: string; notes: string }>>([
    { name: "", type: "", notes: "" },
  ]);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  function addEquipment() {
    setEquipment([...equipment, { name: "", type: "", notes: "" }]);
  }

  function removeEquipment(idx: number) {
    setEquipment(equipment.filter((_, i) => i !== idx));
  }

  function updateEquipment(idx: number, field: string, value: string) {
    const newEquipment = [...equipment];
    newEquipment[idx] = { ...newEquipment[idx], [field]: value };
    setEquipment(newEquipment);
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Equipment</h2>
        <p className="mt-1 text-sm text-[#64748B]">List the equipment you have</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-[#0F172A]">Equipment List</legend>

          {equipment.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-4">
              <input
                name={`equipment[${idx}][name]`}
                type="text"
                value={item.name}
                onChange={(e) => updateEquipment(idx, "name", e.target.value)}
                placeholder="Equipment name"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
              />

              <input
                name={`equipment[${idx}][type]`}
                type="text"
                value={item.type}
                onChange={(e) => updateEquipment(idx, "type", e.target.value)}
                placeholder="Type (e.g., Microphone, Amp, Cable)"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
              />

              <textarea
                name={`equipment[${idx}][notes]`}
                value={item.notes}
                onChange={(e) => updateEquipment(idx, "notes", e.target.value)}
                placeholder="Notes (e.g., Brand, model, condition)"
                rows={2}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
              />

              {equipment.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEquipment(idx)}
                  className="text-xs font-medium text-[#DC2626] hover:text-[#991B1B]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addEquipment}
            className="rounded-full border border-[#0055FF] bg-white px-4 py-2 text-sm font-medium text-[#0055FF] hover:bg-[#EFF6FF]"
          >
            + Add Equipment
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
