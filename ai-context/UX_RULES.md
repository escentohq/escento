# UX_RULES.md — Motivo

> Interaction, state, and accessibility rules. Read [`DESIGN.md`](./DESIGN.md) first for the visual tokens these rules reference.

---

## CTAs

### Primary

- Shape: pill (`rounded-full`), height `h-14`, pad `px-8`.
- Background: `#0F172A` (ink). Text: white. Font: `text-sm font-bold tracking-wide`.
- Hover: scale `1.05`, blue glow shadow `0_0_40px_-10px_#0055FF`, gradient overlay `from-[#0055FF] to-[#FF3366]` fades in.
- Icon: `ArrowRight` on the right; translates `+1` on hover.
- Always above the fold on hero / detail / form pages.

**Rule.** There is exactly **one** primary CTA per page. Anything else is secondary or ghost.
**Why.** Primary CTA carries product weight (Browse / Post / Save). Two primaries = no primary.

### Secondary

- Same pill shape and dimensions.
- Background: `white`. Border: `border-2 border-[#E2E8F0]`. Text: `#0F172A`.
- Hover: border darkens to `#0F172A`. No glow.
- Icon: `Plus` on left for "create" actions, none otherwise.

### Ghost / tertiary

- Text link with `font-mono` or `font-bold` underline-on-hover.
- For inline navigation: `text-[#475569] hover:text-[#0F172A] transition-colors`.

### Destructive

- Reuse secondary shape; recolor: `border-[#FF3366] text-[#FF3366] hover:bg-[#FF3366]/10`.
- Always paired with [`ConfirmDialog`](../../src/components/ui/confirm-dialog.tsx) (see `DeleteGigButton`, `DeleteAccountButton`). Never `window.confirm`.

---

## Forms

Full system: [`FORMS.md`](./FORMS.md). Summary:

- **Labels are visible.** No placeholder-as-label. Use `<FormField>` or `<label htmlFor>` wired to input `id`.
- **Required marker.** Small `*` after label text (in `text-[#FF3366]`). Do not use the word "required" in the label.
- **Field stack.** `space-y-6` between fields. Reserved error slot under each field (no layout jump).
- **Error hierarchy.** Field errors first → form banner when ≥2 field errors or non-field message → no validation toasts.
- **Inline errors.** `text-sm font-medium text-[#B42318]` via `FormField`. Server actions return `ActionState` via `useActionState`.
- **Validation timing.** Blur + submit via `useFormFieldState`; auth email/password may validate on blur in realtime.
- **Submit button.** `FormSubmitButton` — disabled + `Loader2` spinner while pending (`Saving…`, etc.).
- **Cancel link.** Plain text link to the relevant index, left of submit. Never a button.
- **Section grouping.** Use `<fieldset>` with a small `<legend>` styled as eyebrow (`font-mono text-xs uppercase tracking-[0.2em]`).
- **Field width.** Single-column on mobile. Two-column for short pairs (e.g., `instruments` + `genres`) on `md:`.

## Form accessibility

- `aria-invalid`, `aria-describedby` on every control with errors
- Error text `role="alert"` when visible; form banner `role="alert"`
- Focus first invalid field after failed submit (`scrollToFirstError`)
- `focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2`

---

## Loading states

**Rule.** Every async route segment has a `loading.tsx` that renders a skeleton.
**Why.** Without it, the app freezes during DB fetches with no visual feedback. None exist today — flagged as required for new routes.

Skeleton recipe:

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-8 w-1/3 rounded-full bg-[#F1F5F9]" />
  <div className="h-4 w-2/3 rounded-full bg-[#F1F5F9]" />
  <div className="h-64 rounded-3xl bg-[#F8FAFC]" />
</div>
```

Mirror the page's layout structure (eyebrow → headline → grid).

---

## Empty states

**Pattern:** card-styled block, eyebrow, one sentence, one CTA.

```tsx
<div className="rounded-3xl border border-[#F1F5F9] bg-white p-12 text-center">
  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
    Nothing yet
  </span>
  <h3 className="mt-3 text-2xl font-bold">No open gigs right now.</h3>
  <p className="mt-2 text-[#475569]">Be the first to post one.</p>
  <div className="mt-6 flex justify-center">{/* primary CTA */}</div>
</div>
```

Copy comes from [`BRAND.md`](./BRAND.md) §Empty-state copy patterns.

---

## Error states

- **Server action throws** → `error.tsx` boundary at the route segment shows a recovery UI.
- **Field-level errors** stay inline; do not redirect to an error page.
- **404** → `not-found.tsx` per segment when applicable. Style consistent with empty state.

`error.tsx` recipe:

```tsx
"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[#F1F5F9] bg-white p-12 text-center">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
        Something broke
      </span>
      <h3 className="mt-3 text-2xl font-bold">We dropped a beat.</h3>
      <button onClick={reset} className="mt-6 /* primary CTA classes */">Try again</button>
    </div>
  );
}
```

---

## Status badges

- Shape: `rounded-full px-3 py-1`.
- Text: `text-xs font-bold uppercase tracking-wider`.
- Colors from [`DESIGN.md`](./DESIGN.md) §Status mapping.

```tsx
<span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
  Open
</span>
```

---

## Navigation (current legacy → target)

The navbar in `src/app/layout.tsx` uses the **legacy dark zinc** shell. Target spec for the bright migration:

- Container: `bg-white/80 backdrop-blur border-b border-[#F1F5F9]`.
- Wordmark: `text-[#0F172A] font-bold tracking-tight`.
- Nav links: `text-[#475569] hover:text-[#0055FF] transition-colors text-sm font-bold`.
- Sign-in button: secondary pill style (white bg, ink border, ink text).
- Signed-in chip: `border border-[#F1F5F9] bg-white rounded-full px-3 py-1.5 text-xs` with a `#0055FF` dot indicator.
- Sticky on scroll: `sticky top-0 z-50` with backdrop blur.

See [`COMPONENTS.md`](./COMPONENTS.md) §NavBar for the full snippet.

---

## Directory pages (filters + grid)

- Filter row at top: `rounded-3xl border border-[#F1F5F9] bg-white p-6` containing 3–4 column `<form method="GET">`.
- Selects use `<datalist>` autocomplete (not raw `<select>` with 1000+ options — flagged perf issue).
- Apply button is primary; Clear is a ghost text link beside it.
- Result grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`.
- Each card: `rounded-3xl border border-[#F1F5F9] bg-white p-6 hover:shadow-xl hover:shadow-[#0055FF]/10`.
- Card content order: identity → meta (chip row) → clamped bio/description → `View →`.
- Chip caps: show first 3 instruments and first 3 genres. Display `+N more` if more exist (do not silently hide — current code does, flagged).

---

## Detail pages (musician profile, gig detail)

- Layout: 2-col on `lg`, single-col below. `grid lg:grid-cols-3 gap-8`.
- Main column: `lg:col-span-2`. Multiple `SectionCard`s stacked.
- Aside column: contact + work-preferences `SectionCard`s, sticky on `lg` (`lg:sticky lg:top-24`).
- Back link top-left, eyebrow style.

---

## Confirmation patterns

- **Destructive actions** (`deleteGig`): `window.confirm("Delete this gig?")` then `useTransition` to call the server action.
- **State changes that are reversible** (mark filled): no confirm.
- Never use browser `alert()` for non-destructive feedback. Use inline state + `useTransition` instead.

---

## Mobile rules

- Stack everything at `< md`. Two-column grids collapse.
- CTAs go full-width: `w-full sm:w-auto`.
- Tap targets ≥ 44px (the `h-14` CTA is fine; chips are at 32px — keep them as visual badges, not interactive).
- Navbar collapses to wordmark + sign-in only at `< sm` (hide sub-links until tested with a real mobile menu component — do not introduce one without scoping).

---

## Accessibility

### Required

- **Labels.** Every input has a `<label htmlFor>` pointing to the input's `id`. No exceptions.
- **Focus rings.** Every interactive element has a visible focus state. See [`DESIGN.md`](./DESIGN.md) §Focus ring.
- **`aria-label` on icon-only controls.** Back arrows, close buttons, social link icons.
- **`aria-hidden`** on decorative icons (when text label sits beside them) and on the R3F stage scene.
- **Reduced motion.** Wrap framer-motion with `useReducedMotion()`. Reduce parallax + hover-lift to fades.
- **Contrast.** Body text uses `#475569` on `#FAFAFA` (passes AA at 16px). `#64748B` is for meta only — never for primary paragraph body.

### Color contrast — known values

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#0F172A` | `#FAFAFA` | 16.4:1 | Headlines, ink text |
| `#475569` | `#FAFAFA` | 7.5:1 | Body |
| `#64748B` | `#FAFAFA` | 5.4:1 | Meta only (≥14px) |
| `#0055FF` | `#FAFAFA` | 6.5:1 | Links |
| `white` | `#0F172A` | 16.4:1 | CTA |
| `#CBD5E1` | `#0F172A` | 9.4:1 | Body on dark card |
| `#94A3B8` | `#0F172A` | 6.0:1 | Meta on dark card |

`#0055FF` on `#FAFAFA` does **not** pass AA for body text below 14px — use only for ≥14px or as accent on a tinted background.

### Keyboard

- Tab order follows DOM order. Do not use `tabIndex` to reorder.
- Modals (if introduced) trap focus and restore on close. None exist today.

---

## Don't

- ❌ Marquees, autoplay video, parallax abuse on app pages.
- ❌ Toast notifications for routine confirmations — let the page state speak.
- ❌ Skeleton screens that are unrelated in shape to the eventual content.
- ❌ "Coming soon" placeholders — do not ship routes that lead nowhere.
- ❌ `prompt()` / `alert()` — see Confirmation above.
- ❌ Mid-page reloads. Use `redirect()` from server actions, or `router.refresh()` from client components after `useTransition`.

---

*Cross-refs:* [`DESIGN.md`](./DESIGN.md) for tokens · [`COMPONENTS.md`](./COMPONENTS.md) for snippets · [`BRAND.md`](./BRAND.md) for copy.
