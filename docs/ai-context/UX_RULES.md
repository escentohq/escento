# UX_RULES.md — Escento

> Interaction, state, and accessibility rules. Read [`DESIGN.md`](./DESIGN.md) first for the visual tokens these rules reference.

## UI overhaul override (2026-08)

Square controls are the default: no pill CTAs, rounded cards, or decorative corner treatments. Primary actions are solid blue, secondary actions are square outlined controls, and arrows/icons appear only when they clarify meaning. Do not add gradients or routine animation. Loading, empty, and error states should use stable layout, rules, and plain surfaces rather than pulsing card placeholders or animated reveals.

---

## CTAs

### Primary

- Shape: square, minimum height `min-h-12`, pad `px-6 py-3`.
- Background: `#0055FF`. Text: white. Font: `text-control`.
- Hover: a solid ink or darker-blue state only. No scale, glow, or gradient.
- Icon: include a Lucide icon only when it clarifies the action.
- Always above the fold on hero / detail / form pages.

**Rule.** There is exactly **one** primary CTA per page. Anything else is secondary or ghost.
**Why.** Primary CTA carries product weight (Browse / Post / Save). Two primaries = no primary.

### Secondary

- Same square shape and dimensions.
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

Static skeleton recipe:

```tsx
<div className="space-y-4">
  <div className="h-8 w-1/3 bg-rule" />
  <div className="h-4 w-2/3 bg-rule" />
  <div className="h-64 border-y border-rule bg-surface" />
</div>
```

Mirror the page's layout structure (eyebrow → headline → grid).

---

## Empty states

**Pattern:** rule-separated block, eyebrow, one sentence, one CTA.

```tsx
<div className="border-y border-rule bg-surface py-12 text-center">
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
    <div className="mx-auto max-w-2xl border-y border-rule bg-surface py-12 text-center">
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

## Status labels

- Shape: square inline metadata, optionally with a left accent rule.
- Text: `text-meta uppercase tracking-wider`.
- Colors from [`DESIGN.md`](./DESIGN.md) §Status mapping.

```tsx
<span className="border-l-2 border-brand pl-2 text-meta uppercase tracking-wider text-brand">
  Open
</span>
```

---

## Navigation

The shared navbar uses the bright foundation. Preserve these current rules:

- Container: solid white with a slate bottom rule; no blur.
- Wordmark: `text-[#0F172A] font-bold tracking-tight`.
- Nav links: `text-[#475569] hover:text-[#0055FF] transition-colors text-sm font-bold`.
- Sign-in button: square secondary style (white bg, ink border, ink text).
- Signed-in avatar is a centralized circular media exception; menu surfaces use the named overlay token.
- Sticky on scroll: `sticky top-0 z-50` on a solid surface.

See [`COMPONENTS.md`](./COMPONENTS.md) §NavBar for the full snippet.

---

## Directory pages (filters + editorial list)

- Filter row at top: square `border-y border-rule bg-surface py-6` containing a responsive `<form method="GET">`.
- Selects use `<datalist>` autocomplete (not raw `<select>` with 1000+ options — flagged perf issue).
- Apply button is primary; Clear is a ghost text link beside it.
- Results are stacked, `divide-y` editorial rows with responsive metadata columns.
- Row content order: identity → concise metadata → clamped bio/description → clear text action.
- Chip caps: show first 3 instruments and first 3 genres. Display `+N more` if more exist (do not silently hide — current code does, flagged).

---

## Detail pages (musician profile, gig detail)

- Layout: 2-col on `lg`, single-col below. `grid lg:grid-cols-3 gap-8`.
- Main column: `lg:col-span-2`. Multiple `SectionCard`s stacked.
- Aside column: contact + work-preferences `SectionCard`s, sticky on `lg` (`lg:sticky lg:top-24`).
- Back link top-left, eyebrow style.

---

## Confirmation patterns

- **Destructive actions** (`deleteGig`): use `ConfirmDialog`, then `useTransition` to call the server action.
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
- **`aria-hidden`** on decorative icons when a text label already communicates the meaning.
- **Reduced motion.** The current UI is static. Any separately approved future motion must respect
  `prefers-reduced-motion`.
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
