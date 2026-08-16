# COMPONENTS.md — Escento

> Factual index of the live UI primitives. The implementation in `src/components/ui/` is the
> source of truth; do not recreate a component from an old snippet.

## Canonical references

- Marketplace composition: `src/app/musicians/page.tsx`
- Public editorial composition: `src/components/home/HomeLanding.tsx`
- Detail composition: `src/app/musicians/[id]/page.tsx`
- Form behavior: [`FORMS.md`](./FORMS.md)
- Visual tokens: [`DESIGN.md`](./DESIGN.md)

The current system uses Archivo, square flat surfaces, solid color, restrained weight, and static
presentation. There are no generic card, dark-card, directory-card, filter-bar, detail-layout, or
motion-stagger primitives. Compose each route around its information instead of recreating those
abstractions.

## Live primitives

| Component | Path | Use |
|---|---|---|
| `PrimaryCta` | `src/components/ui/primary-cta.tsx` | One solid-blue primary link per page when needed |
| `SecondaryCta` | `src/components/ui/secondary-cta.tsx` | Square outlined secondary link |
| `PageShell` | `src/components/ui/page-shell.tsx` | Shared route width, header, and optional action alignment |
| `SectionCard` | `src/components/ui/section-card.tsx` | Rule-separated subsection; despite the historical name, it is not a card |
| `Chip` | `src/components/ui/chip.tsx` | Compact outlined metadata; neutral by default |
| `BackLink` | `src/components/ui/back-link.tsx` | Route-level return navigation |
| `EmptyState` | `src/components/ui/empty-state.tsx` | Rule-separated empty state with an optional CTA |
| `PageLoading` | `src/components/ui/page-loading.tsx` | Static route skeleton matching list composition |
| `RouteError` | `src/components/ui/route-error.tsx` | Route error boundary content and retry action |
| `NavBar` | `src/components/ui/nav-bar.tsx` | Static solid shell; `NavigationAccount` hydrates private identity/unread state independently |
| `Footer` | `src/components/ui/footer.tsx` | Product and legal navigation |
| `Input` | `src/components/ui/input.tsx` | Shared text control with invalid state |
| `Textarea` | `src/components/ui/textarea.tsx` | Shared multiline control with invalid state |
| `Select` | `src/components/ui/select.tsx` | Shared native select with a Lucide chevron |
| `FormField` | `src/components/ui/form-field.tsx` | Label, hint, ARIA wiring, and reserved error space |
| `FormErrorBanner` | `src/components/ui/form-error-banner.tsx` | Form-level error, success, or information feedback |
| `FormSubmitButton` | `src/components/ui/form-submit-button.tsx` | Pending-aware Server Action submit control |
| `ConfirmDialog` | `src/components/ui/confirm-dialog.tsx` | Focus-trapped destructive confirmation overlay |

## Composition rules

- Start with semantic page structure, type hierarchy, columns, alignment, and rules.
- Use `PageShell` where its header arrangement matches the route; it is not mandatory.
- Directory results are coherent `divide-y` lists, not a reusable grid of floating cards.
- Detail pages use a flexible main column and a narrower sticky contact column at `lg`; both stack
  naturally below that breakpoint.
- Use `SectionCard` only when a subsection needs its own heading and rule. Do not nest it merely to
  create another rectangle.
- Use `Chip` for terse metadata. Taxonomy labels are neutral; reserve colored tones for semantic
  state or a deliberately sparse signal.
- Do not add icons unless they clarify an action or a compact piece of metadata. Icons come from
  `lucide-react` and decorative icons use `aria-hidden`.

## Actions

`PrimaryCta` and `SecondaryCta` are links. Forms use `FormSubmitButton`; route-level action buttons
may use the shared `.control-primary` and `.control-secondary` classes in `globals.css`.

All controls are square, have a minimum 44px touch target, and retain visible keyboard focus.
Primary actions are solid blue and shift to ink on hover. Secondary actions are outlined. Do not
add arrows by default, hover translation, scale, glow, or blanket transitions.

## Forms

Prefer this structure and refer to [`FORMS.md`](./FORMS.md) for validation timing and Server Action
state:

```tsx
<FormField
  id="title"
  label="Title"
  required
  error={errors.title}
  showError={formFields.shouldShowError("title", errors.title)}
  onBlur={() => formFields.markTouched("title")}
>
  <Input name="title" value={title} onChange={handleChange} />
</FormField>
```

- Keep labels visible and connected with `htmlFor`/`id`.
- Use the shared input components and `invalid` state.
- Reserve field-error space to prevent layout movement.
- Use `FormErrorBanner` for multiple field errors or non-field failures.
- Use `ConfirmDialog`, never browser `confirm()`, for destructive actions.

## Radius and depth exceptions

Application controls and containers use `0px` radius and no page-content shadows. The only named
corner utilities live in `globals.css`:

- `.media-avatar`: true circular user imagery.
- `.status-dot`: true circular presence/unread signal.
- `.surface-overlay`: 2px overlay radius for menus, popovers, and dialogs.

Do not introduce Tailwind `rounded-*` utilities or ad hoc shadow classes.

## Before adding or changing a component

1. Read the canonical route closest to the intended composition.
2. Inspect `src/components/ui/` for an existing behavioral primitive.
3. Keep pages as Server Components and isolate only genuine interaction in client children.
4. Add loading, empty, and error behavior appropriate to the route.
5. Verify the rendered route at desktop, intermediate, and mobile widths.
6. Run the forbidden-pattern searches, `npm run lint`, and `npm run build`.

*Cross-references: [`DESIGN.md`](./DESIGN.md) · [`UX_RULES.md`](./UX_RULES.md) · [`AGENTS.md`](../../AGENTS.md)*
