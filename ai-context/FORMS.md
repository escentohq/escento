# FORMS.md — Escento form UX system

> Canonical reference for every form in Escento. Agents: read this when building or migrating forms.
> Complements [`UX_RULES.md`](./UX_RULES.md) §Forms, [`COMPONENTS.md`](./COMPONENTS.md) recipes, and [`FRONTEND_ARCH.md`](./FRONTEND_ARCH.md) §Form system.

---

## Error hierarchy (never violate)

1. **Field errors** — primary. Inline under the control, reserved slot (no layout jump).
2. **Form banner** — when ≥2 field errors **or** a non-field message (auth failure, rate limit, server error).
3. **Toasts** — **not used for validation** in v1. Success stays inline or redirects. Toasts reserved for future global events only.

---

## Validation timing

| Input type | When to show errors |
|---|---|
| Email, password | Realtime after blur (client) + server on submit |
| Text, textarea, select, date | Blur + submit (`useFormFieldState`) |
| Checkboxes / groups | Submit only unless group-level rule |

**Rule.** Do not show field errors before the user has blurred the field or attempted submit — except email/password patterns on auth forms.

---

## ActionState contract

Every mutating form action returns:

```ts
type ActionState = {
  ok: boolean;
  message?: string;           // form-level banner copy
  fieldErrors?: Record<string, string>;
  values?: Record<string, string | boolean>; // rehydrate controlled state on failure
};
```

**Server rules:**

- User-correctable validation → return `ActionState`, never `throw`.
- Use `formLevelMessage(fieldErrors, fallback)` when ≥2 fields fail.
- On validation failure, return `values` snapshot so checkboxes and text survive re-render.
- **Never** put passwords in `values`.
- Success that redirects → `redirect()` (no banner needed).
- Success that stays on page → `{ ok: true, message: "…" }` with inline success banner.

Helpers live in `src/lib/form-utils.ts` and `src/lib/form-snapshots.ts`.

---

## Client form pattern

```tsx
"use client";
import { useActionState, useEffect, useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { useFormFieldState } from "@/hooks/use-form-field-state";
import { countFieldErrors, emptyActionState } from "@/lib/form-utils";

export function ExampleForm({ action }) {
  const [email, setEmail] = useState("");
  const formFields = useFormFieldState();
  const [state, formAction] = useActionState(action, emptyActionState);
  const errors = state.fieldErrors ?? {};
  const fieldErrorCount = countFieldErrors(errors);

  useEffect(() => {
    if (state.values?.email) setEmail(String(state.values.email));
  }, [state.values]);

  useEffect(() => {
    if (fieldErrorCount > 0) {
      formFields.setSubmitAttempted(true);
      formFields.scrollToFirstError(errors);
    }
  }, [state]);

  return (
    <form action={formAction} onSubmit={() => formFields.setSubmitAttempted(true)}>
      {state.message && fieldErrorCount >= 2 ? (
        <FormErrorBanner
          message={state.message}
          fieldErrorCount={fieldErrorCount}
          onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
        />
      ) : null}

      <FormField
        id="email"
        label="Email"
        required
        error={errors.email}
        showError={formFields.shouldShowError("email", errors.email)}
        onBlur={() => formFields.markTouched("email")}
      >
        <Input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>

      <FormSubmitButton pendingLabel="Saving…">Save</FormSubmitButton>
    </form>
  );
}
```

---

## Primitives

| Component | Path | Role |
|---|---|---|
| `FormField` | `src/components/ui/form-field.tsx` | Label, hint, reserved error slot, `aria-*` wiring |
| `Input` / `Textarea` / `Select` | `src/components/ui/*.tsx` | Bright-theme controls; accept `invalid` prop |
| `FormErrorBanner` | `src/components/ui/form-error-banner.tsx` | error / success / info variants; scroll CTA |
| `FormSubmitButton` | `src/components/ui/form-submit-button.tsx` | Pill CTA + `Loader2` pending state |
| `PasswordField` | `src/components/auth/password-field.tsx` | Password + optional strength meter |
| `ConfirmDialog` | `src/components/ui/confirm-dialog.tsx` | Native `<dialog>` for destructive confirms |
| `useFormFieldState` | `src/hooks/use-form-field-state.ts` | touched / submitAttempted / scrollToFirstError |
| Input classes | `src/lib/form-input-classes.ts` | Shared border/focus/error tokens |

**Do not** use legacy `globals.css` classes (`.input-base`, `.btn-primary`, `.card`).

---

## Accessibility checklist

- Visible `<label htmlFor={id}>`
- `aria-invalid` when error visible
- `aria-describedby` linking hint + error ids
- Error text uses `role="alert"` when visible
- Form banner uses `role="alert"`
- `focus-visible:outline-2 focus-visible:outline-[#0055FF]`
- After failed submit, focus first invalid field (`scrollToFirstError`)
- Password requirements use icon + text (not color alone)

---

## Copy patterns

See [`BRAND.md`](./BRAND.md) §Microcopy for forms. Quick reference:

| Situation | Pattern |
|---|---|
| Empty required | `Add a {field}.` |
| Invalid email | `Enter a valid email address.` |
| Multi-field | `Fix {n} fields to continue.` |
| Auth failure | `That email or password isn't right.` |
| Server failure | `Something went wrong. Try again.` |

Forbidden: "ERROR", "Invalid input", "Oops", raw Supabase strings.

---

## Migration status

| Form | Status |
|---|---|
| Sign in | ✅ Migrated |
| Sign up | ✅ Migrated |
| Forgot password | ✅ Migrated |
| Update password | ✅ Migrated |
| Profile create/edit | ✅ Migrated |
| Gig create/edit | ✅ Migrated |
| Update name | ✅ Migrated |
| Delete account | ✅ ConfirmDialog |
| Gig manage delete | ✅ ConfirmDialog |
| Onboarding role | ✅ Pending state |

---

## Edge cases

- **Signup email confirmation** — success `info` banner; no field errors
- **OAuth `?error=auth`** — page-level banner on sign-in, not a toast
- **Rate limit / network** — form banner only; no field blame
- **Checkbox groups** — group-level error under fieldset
- **Password fields** — client-controlled only; never in `ActionState.values`
- **HTML5 validation** — use `noValidate` on `<form>` and `aria-required` on controls (via `FormField`). Do **not** use the native `required` attribute — it shows browser default copy ("Please fill out this field").

---

*Last updated: 2026-05-20.*
