# COMPONENTS.md — Escento

> Copy-pasteable component recipes using the bright stage-light theme.
> Tokens come from [`DESIGN.md`](./DESIGN.md); behavioral rules from [`UX_RULES.md`](./UX_RULES.md).
> Place all primitives in `src/components/ui/`. Feature components live in `src/components/<feature>/`.

## UI overhaul override (2026-08)

The live components in `src/components/ui/` now supersede the older copy-paste recipes below. They use Archivo, square flat controls and surfaces, solid color, restrained weights, and static presentation. Do not copy any older recipe containing `rounded-*`, a gradient, hover lift/glow, or reveal animation. Radius exceptions must use the named CSS utilities in `globals.css`.

---

## Index

- [`<PrimaryCta>`](#primarycta) · `src/components/ui/primary-cta.tsx`
- [`<SecondaryCta>`](#secondarycta) · `src/components/ui/secondary-cta.tsx`
- [`<Section>`](#section) · `src/components/ui/section.tsx`
- [`<Eyebrow>`](#eyebrow) · `src/components/ui/eyebrow.tsx`
- [`<Card>`](#card-light) · `src/components/ui/card.tsx`
- [`<DarkCard>`](#dark-feature-card) · `src/components/ui/dark-card.tsx`
- [`<Chip>`](#chip) · `src/components/ui/chip.tsx`
- [`<AvatarInitials>`](#avatarinitials) · `src/components/ui/avatar-initials.tsx`
- [`<Input>` / `<Textarea>` / `<Select>`](#form-inputs) · `src/components/ui/input.tsx` (etc.)
- [`<FilterBar>`](#filterbar) · `src/components/ui/filter-bar.tsx`
- [`<DirectoryCard>`](#directorycard) · `src/components/ui/directory-card.tsx`
- [`<DetailLayout>`](#detaillayout) · `src/components/ui/detail-layout.tsx`
- [`<SectionCard>`](#sectioncard) · `src/components/ui/section-card.tsx`
- [`<BackLink>`](#backlink) · `src/components/ui/back-link.tsx`
- [`<EmptyState>`](#emptystate) · `src/components/ui/empty-state.tsx`
- [`<NavBar>`](#navbar) · `src/components/ui/nav-bar.tsx`
- [`<MotionStagger>`](#motionstagger) · `src/components/ui/motion-stagger.tsx`

---

## `<PrimaryCta>`

Pill button with gradient hover overlay. The canonical primary CTA — matches the landing hero.

```tsx
// src/components/ui/primary-cta.tsx
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Props = {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function PrimaryCta({ href, children, icon: Icon = ArrowRight, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0F172A] px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <Icon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
      <div className="absolute inset-0 bg-linear-to-r from-[#0055FF] to-[#FF3366] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}
```

**Use:** primary action on hero, form submit (wrap in `<form>` with `<button type="submit">` variant — see button variant note below).

**Button variant:** when used as a submit, swap `<Link>` for `<button type="submit">` and identical className.

---

## `<SecondaryCta>`

Outlined pill. Pairs with `PrimaryCta`.

```tsx
// src/components/ui/secondary-cta.tsx
import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

type Props = { href: string; children: React.ReactNode; icon?: LucideIcon; className?: string };

export function SecondaryCta({ href, children, icon: Icon = Plus, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`flex h-14 items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-8 text-sm font-bold tracking-wide text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}
```

---

## `<Section>`

Vertical section wrapper. Background variant via prop.

```tsx
// src/components/ui/section.tsx
type Variant = "page" | "muted" | "white";

const bgClass: Record<Variant, string> = {
  page: "bg-[#FAFAFA]",
  muted: "bg-[#F8FAFC]",
  white: "bg-white",
};

export function Section({
  children,
  variant = "white",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <section className={`relative z-20 border-t border-[#F1F5F9] px-6 py-28 ${bgClass[variant]} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
```

---

## `<Eyebrow>`

```tsx
// src/components/ui/eyebrow.tsx
type Tone = "muted" | "blue" | "pink" | "gold";

const toneClass: Record<Tone, string> = {
  muted: "text-[#64748B]",
  blue: "text-[#0055FF]",
  pink: "text-[#FF3366]",
  gold: "text-[#FFB000]",
};

export function Eyebrow({ children, tone = "muted" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
```

---

## `<Card>` (light)

Default surface for content blocks. Animated lift on hover via framer-motion.

```tsx
// src/components/ui/card.tsx
"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

export function Card({
  children,
  className = "",
  ...rest
}: HTMLMotionProps<"div"> & { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/10 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
```

**Non-interactive variant** (no motion): inline `<div className="rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">`.

---

## Dark feature card

Inverted card for marquee rows (used in landing "Now playing" gig card).

```tsx
// src/components/ui/dark-card.tsx
"use client";
import { motion } from "framer-motion";

export function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`group relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/20 ${className}`}
    >
      <div
        className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      {children}
    </motion.div>
  );
}
```

---

## `<Chip>`

Pill badge for tags (instruments, genres, project types).

```tsx
// src/components/ui/chip.tsx
type Variant = "blue" | "pink" | "gold" | "neutral";

const variantClass: Record<Variant, string> = {
  blue: "bg-[#0055FF]/10 text-[#0055FF]",
  pink: "bg-[#FF3366]/10 text-[#FF3366]",
  gold: "bg-[#FFB000]/10 text-[#FFB000]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
};

export function Chip({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${variantClass[variant]}`}>
      {children}
    </span>
  );
}
```

---

## `<AvatarInitials>`

```tsx
// src/components/ui/avatar-initials.tsx
export function AvatarInitials({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] font-bold text-[#0F172A] ${className}`}>
      {initials}
    </div>
  );
}
```

---

## Form inputs

Bright-theme replacements for the legacy `.input-base` etc. in `globals.css`. Do **not** use the legacy classes.

```tsx
// src/components/ui/input.tsx
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] shadow-sm transition-colors focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 ${props.className ?? ""}`}
    />
  );
}

// src/components/ui/textarea.tsx
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] shadow-sm transition-colors focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 ${props.className ?? ""}`}
    />
  );
}

// src/components/ui/select.tsx
import { ChevronDown } from "lucide-react";
export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative mt-2">
      <select
        {...props}
        className={`w-full appearance-none rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 pr-10 text-[#0F172A] shadow-sm transition-colors focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 ${props.className ?? ""}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" aria-hidden />
    </div>
  );
}
```

**Label pattern** — prefer `FormField` (handles label, error slot, a11y):

```tsx
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

<FormField id="title" label="Title" required error={errors.title} showError={show}>
  <Input name="title" value={title} onChange={...} />
</FormField>
```

Legacy manual label (only if `FormField` doesn't fit):

```tsx
<label htmlFor="title" className="text-sm font-bold text-[#0F172A]">
  Title <span className="text-[#FF3366]">*</span>
</label>
<Input id="title" name="title" required />
```

---

## `<FormField>`

Wraps label + control + reserved error space. See [`FORMS.md`](./FORMS.md).

```tsx
// src/components/ui/form-field.tsx — usage
<FormField
  id="email"
  label="Email"
  required
  hint="We'll never share this."
  error={errors.email}
  showError={formFields.shouldShowError("email", errors.email)}
  onBlur={() => formFields.markTouched("email")}
>
  <Input name="email" type="email" value={email} onChange={...} />
</FormField>
```

---

## `<FormErrorBanner>`

Form-level message. Use when ≥2 field errors or non-field failures.

```tsx
<FormErrorBanner
  message={state.message}
  fieldErrorCount={fieldErrorCount}
  onScrollToFirstError={() => formFields.scrollToFirstError(errors)}
/>

// Success (inline, no toast):
<FormErrorBanner variant="success" message="Name updated." />

// Info (e.g. check your email):
<FormErrorBanner variant="info" message="Check your inbox to confirm." />
```

---

## `<FormSubmitButton>`

Bright pill submit with pending spinner. Replaces legacy `.btn-primary`.

```tsx
<FormSubmitButton pendingLabel="Saving…">Save</FormSubmitButton>
```

---

## `<PasswordField>`

Auth password input with optional strength meter. Client-controlled only.

```tsx
import { PasswordField } from "@/components/auth/password-field";

<PasswordField
  id="password"
  name="password"
  label="Password"
  value={password}
  onChange={setPassword}
  showStrength
  error={errors.password}
  showError={show}
/>
```

---

## `<ConfirmDialog>`

Accessible destructive confirm (native `<dialog>`). Use instead of `window.confirm`.

```tsx
<ConfirmDialog
  open={open}
  title="Delete this gig?"
  description="This cannot be undone."
  confirmLabel="Delete gig"
  pending={isPending}
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>
```

---

## `<FilterBar>`

Directory filter row (3–4 column GET form). Server component.

```tsx
// src/components/ui/filter-bar.tsx
import { Select } from "./select";
import { PrimaryCta } from "./primary-cta";
import Link from "next/link";

export function FilterBar({
  action,
  instruments,
  genres,
  current,
}: {
  action: string;
  instruments: { name: string }[];
  genres: { name: string }[];
  current: { instrument?: string; genre?: string; projectType?: string };
}) {
  return (
    <form
      method="GET"
      action={action}
      className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="instrument" className="text-sm font-bold text-[#0F172A]">Instrument</label>
          <Select id="instrument" name="instrument" defaultValue={current.instrument ?? ""}>
            <option value="">Any</option>
            {instruments.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
          </Select>
        </div>
        <div>
          <label htmlFor="genre" className="text-sm font-bold text-[#0F172A]">Genre</label>
          <Select id="genre" name="genre" defaultValue={current.genre ?? ""}>
            <option value="">Any</option>
            {genres.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
          </Select>
        </div>
        <div className="flex items-end gap-3 md:col-span-2">
          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-full bg-[#0F172A] px-6 text-sm font-bold text-white hover:scale-105 transition-transform"
          >
            Apply
          </button>
          <Link href={action} className="text-sm font-bold text-[#475569] hover:text-[#0F172A]">
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}
```

---

## `<DirectoryCard>`

List card for `/musicians` and `/gigs`.

```tsx
// src/components/ui/directory-card.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Chip } from "./chip";

type Props = {
  href: string;
  title: string;
  meta: string;
  description: string;
  chipsPrimary: string[];   // e.g., instruments
  chipsSecondary: string[]; // e.g., genres
  statusSlot?: React.ReactNode;
};

export function DirectoryCard({ href, title, meta, description, chipsPrimary, chipsSecondary, statusSlot }: Props) {
  return (
    <motion.div whileHover={{ y: -8 }} className="transition-all duration-300">
      <Link
        href={href}
        className="group block rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold leading-tight">{title}</h3>
            <p className="mt-1 font-mono text-sm text-[#64748B]">{meta}</p>
          </div>
          {statusSlot}
        </div>
        <p className="mt-4 line-clamp-3 font-medium leading-relaxed text-[#475569]">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chipsPrimary.slice(0, 3).map((c) => <Chip key={c} variant="blue">{c}</Chip>)}
          {chipsSecondary.slice(0, 3).map((c) => <Chip key={c} variant="pink">{c}</Chip>)}
          {(chipsPrimary.length + chipsSecondary.length > 6) && (
            <Chip variant="neutral">+{chipsPrimary.length + chipsSecondary.length - 6} more</Chip>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm font-bold text-[#0055FF] transition-colors group-hover:text-[#FF3366]">
          <span>View</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </div>
      </Link>
    </motion.div>
  );
}
```

---

## `<DetailLayout>`

Two-column detail-page shell (musician profile, gig detail).

```tsx
// src/components/ui/detail-layout.tsx
export function DetailLayout({ main, aside }: { main: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">{main}</div>
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">{aside}</aside>
    </div>
  );
}
```

---

## `<SectionCard>`

Smaller card for sub-sections inside detail pages or forms.

```tsx
// src/components/ui/section-card.tsx
export function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm">
      {eyebrow && (
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
          {eyebrow}
        </span>
      )}
      {title && <h2 className="mt-2 text-xl font-bold">{title}</h2>}
      <div className={title || eyebrow ? "mt-4" : ""}>{children}</div>
    </div>
  );
}
```

---

## `<BackLink>`

```tsx
// src/components/ui/back-link.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] transition-colors hover:text-[#0F172A]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}
```

---

## `<EmptyState>`

```tsx
// src/components/ui/empty-state.tsx
export function EmptyState({
  eyebrow = "Nothing yet",
  title,
  body,
  cta,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-12 text-center shadow-sm">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">{eyebrow}</span>
      <h3 className="mt-3 text-2xl font-bold">{title}</h3>
      {body && <p className="mt-2 text-[#475569]">{body}</p>}
      {cta && <div className="mt-6 flex justify-center">{cta}</div>}
    </div>
  );
}
```

---

## `<NavBar>`

Bright-theme migration target for the navbar currently inlined in `src/app/layout.tsx`.

```tsx
// src/components/ui/nav-bar.tsx
import Link from "next/link";

type Props = {
  signedIn: boolean;
  email?: string | null;
  role?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
};

export function NavBar({ signedIn, email, role, musicianProfilePath, isCreator }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-base font-black tracking-tight text-[#0F172A]">
            Escento
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-[#475569] md:flex">
            <Link href="/musicians" className="transition-colors hover:text-[#0055FF]">Browse Musicians</Link>
            <Link href="/gigs" className="transition-colors hover:text-[#0055FF]">Browse Gigs</Link>
            {musicianProfilePath && (
              <Link href={musicianProfilePath} className="transition-colors hover:text-[#0055FF]">
                {musicianProfilePath === "/profile/create" ? "Create Profile" : "Edit Profile"}
              </Link>
            )}
            {isCreator && (
              <>
                <Link href="/gigs/manage" className="transition-colors hover:text-[#0055FF]">Manage</Link>
                <Link href="/gigs/create" className="transition-colors hover:text-[#0055FF]">Post a Gig</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {!signedIn ? (
            <Link
              href="/signin"
              className="rounded-full border-2 border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]"
            >
              Sign in
            </Link>
          ) : (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[#F1F5F9] bg-white px-3 py-1.5 text-xs text-[#475569] sm:flex">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0055FF]" />
                <span className="max-w-[160px] truncate font-bold">{email ?? "Signed in"}</span>
                {role && (
                  <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#64748B]">
                    {role.toLowerCase()}
                  </span>
                )}
              </div>
              <form
                action={signOutAction}
                className="contents"
              >
                <button
                  type="submit"
                  className="rounded-full border-2 border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

---

## `<MotionStagger>`

Wrapper that staggers children's entrance. Reduces the boilerplate seen in `HomeLanding.tsx`.

```tsx
// src/components/ui/motion-stagger.tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";

export function MotionStagger({
  children,
  delay = 0,
  stagger = 0.1,
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};
```

Usage:

```tsx
<MotionStagger>
  <motion.h2 variants={staggerItem}>Featured Talent</motion.h2>
  <motion.p variants={staggerItem}>...</motion.p>
</MotionStagger>
```

---

## Reduced-motion pattern (reference)

Wherever you use framer-motion beyond a single fade:

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: reduced ? 0.3 : 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Component instantiation order

When asked to build a new page, instantiate primitives in this order:

1. Read `src/components/home/HomeLanding.tsx` to confirm visual baseline.
2. Check `src/components/ui/` for the primitive you need. If missing, **add it from this doc** before using it inline.
3. Compose page in a server component using the primitive (client components only as needed).
4. Add `loading.tsx`, `error.tsx`, `not-found.tsx` to the route segment.
5. Verify: lint + build pass, reduced-motion still works, no `zinc-*` / `violet-*` classes anywhere.

---

*Cross-refs:* [`DESIGN.md`](./DESIGN.md) tokens · [`UX_RULES.md`](./UX_RULES.md) behaviors · [`AGENTS.md`](../../AGENTS.md) rules.
