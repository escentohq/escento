"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { Gig } from "@/lib/api/types";
import { ActionState, emptyActionState } from "@/lib/form-utils";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

interface Step3FormProps {
  gigId: string;
  initialData: Gig;
  action: (state: ActionState, fd: FormData, gigId: string) => Promise<ActionState>;
}

export function Step3Form({ gigId, initialData, action }: Step3FormProps) {
  const [state, formAction] = useActionState(
    (state: ActionState, fd: FormData) => action(state, fd, gigId),
    emptyActionState
  );
  const [questions, setQuestions] = useState<Array<{ text: string; type: string }>>([
    { text: "", type: "text" },
  ]);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  function addQuestion() {
    setQuestions([...questions, { text: "", type: "text" }]);
  }

  function removeQuestion(idx: number) {
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: string, value: string) {
    const newQuestions = [...questions];
    newQuestions[idx] = { ...newQuestions[idx], [field]: value };
    setQuestions(newQuestions);
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : animationVariants.initial}
      animate={animationVariants.animate}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl space-y-8 px-6 py-12"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Creator info & questions</h1>
        <p className="mt-2 text-sm text-[#64748B]">Step 3 of 3</p>
      </div>

      <form action={formAction} className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8">
        {state.message && !state.ok && (
          <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm text-[#DC2626]">
            {state.message}
          </div>
        )}

        <fieldset className="space-y-2">
          <label htmlFor="creatorName" className="block text-sm font-medium text-[#0F172A]">
            Your Name <span className="text-[#FF3366]">*</span>
          </label>
          <input
            id="creatorName"
            name="creatorName"
            type="text"
            defaultValue={initialData.creatorName || ""}
            required
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="Your full name"
            aria-invalid={!!state.fieldErrors?.creatorName}
          />
          {state.fieldErrors?.creatorName && (
            <p className="text-sm font-medium text-[#DC2626]">{state.fieldErrors.creatorName}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="creatorPhone" className="block text-sm font-medium text-[#0F172A]">
            Phone <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="creatorPhone"
            name="creatorPhone"
            type="tel"
            defaultValue={initialData.creatorPhone || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="+1 (555) 123-4567"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="creatorBio" className="block text-sm font-medium text-[#0F172A]">
            About You <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <textarea
            id="creatorBio"
            name="creatorBio"
            defaultValue={initialData.creatorBio || ""}
            rows={3}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="Tell musicians about yourself or the project"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="creatorContactMethod"
            className="block text-sm font-medium text-[#0F172A]"
          >
            How should musicians contact you? <span className="text-[#FF3366]">*</span>
          </label>
          <select
            id="creatorContactMethod"
            name="creatorContactMethod"
            defaultValue={initialData.creatorContactMethod || ""}
            required
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            aria-invalid={!!state.fieldErrors?.creatorContactMethod}
          >
            <option value="">Select method...</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="link">Custom Link</option>
          </select>
          {state.fieldErrors?.creatorContactMethod && (
            <p className="text-sm font-medium text-[#DC2626]">
              {state.fieldErrors.creatorContactMethod}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="creatorContactLink"
            className="block text-sm font-medium text-[#0F172A]"
          >
            Contact Link <span className="text-[#94A3B8]">(optional)</span>
          </label>
          <input
            id="creatorContactLink"
            name="creatorContactLink"
            type="text"
            defaultValue={initialData.creatorContactLink || ""}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none focus:ring-1 focus:ring-[#0055FF]"
            placeholder="e.g., https://calendly.com/yourname or your website"
          />
        </fieldset>

        <fieldset className="space-y-3 border-t border-[#E2E8F0] pt-6">
          <legend className="text-sm font-medium text-[#0F172A]">
            Custom Questions <span className="text-[#94A3B8]">(optional)</span>
          </legend>
          <p className="text-xs text-[#64748B]">
            Ask musicians application questions to help you choose the right fit
          </p>

          {questions.map((q, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-3">
              <input
                name={`question[${idx}][text]`}
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                placeholder="Ask a question..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0055FF] focus:outline-none"
              />
              <div className="flex gap-2">
                <select
                  name={`question[${idx}][type]`}
                  value={q.type}
                  onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#0055FF] focus:outline-none"
                >
                  <option value="text">Short text</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="yes_no">Yes/No</option>
                </select>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="text-xs font-medium text-[#DC2626] hover:text-[#991B1B]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-full border border-[#0055FF] bg-white px-4 py-2 text-sm font-medium text-[#0055FF] hover:bg-[#EFF6FF]"
          >
            + Add question
          </button>
        </fieldset>

        <div className="flex gap-3 pt-6">
          <FormSubmitButton className="flex-1 rounded-full bg-[#0055FF] px-6 py-3 font-medium text-white hover:bg-[#0044CC] active:bg-[#003399]" pendingLabel="Publishing...">
            Publish Gig
          </FormSubmitButton>
          <Link
            href="/gigs/manage"
            className="flex items-center justify-center rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-medium text-[#64748B] hover:bg-[#FAFAFA]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
