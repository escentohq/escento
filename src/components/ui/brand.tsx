import type { SVGProps } from "react";

/**
 * Escento brand marks.
 *
 * The geometric "E" is the primary short-form mark. The long-form wordmark
 * attaches that same E to the rest of "-scento" so it reads "Escento".
 *
 * The mark is drawn with `currentColor`, so callers control color by setting
 * the surrounding text color (e.g. `text-[#0F172A]` on light, `text-white`
 * on dark). Reference: `docs/assets/escento-logo.svg`, rebuilt
 * as a crisp, recolorable brand vector. This custom logo geometry is exempt
 * from the application surface-corner rules.
 */

const MARK_VIEWBOX = "10 9 471 423";

// Top stroke of the E (with the descending left tail).
const MARK_TOP_PATH =
  "M 150.8 26.5 Q 162 15 178 15 L 440 15 Q 456 15 456.2 31 L 456.8 79 Q 457 95 441 95.2 L 242 97.8 Q 226 98 214.5 109.1 L 161.5 159.9 Q 150 171 134 171 L 26 171 Q 10 171 21.2 159.5 L 150.8 26.5 Z";

// Lower section: middle + bottom strokes joined by the chevron spine.
const MARK_BOTTOM_PATH =
  "M 213.6 198.2 Q 225 187 241 187.1 L 339 187.9 Q 355 188 355.2 204 L 355.8 247 Q 356 263 340 264.2 L 294 267.8 Q 278 269 266.7 280.3 L 231.8 315.2 Q 223 324 231.5 333 L 231.5 333 Q 240 342 252.4 342.2 L 458 344.8 Q 474 345 474.2 361 L 474.8 407 Q 475 423 459 423.2 L 200 425.8 Q 184 426 172.6 414.8 L 33.4 277.2 Q 22 266 38 265.5 L 133 262.5 Q 149 262 160.4 250.8 L 213.6 198.2 Z";

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

type EscentoMarkProps = SVGProps<SVGSVGElement> & {
  /** Accessible label. When omitted the mark is treated as decorative. */
  title?: string;
};

/** The standalone "E" mark — the primary short-form logo. */
export function EscentoMark({ title, className, ...props }: EscentoMarkProps) {
  const labelled = Boolean(title);
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      {...props}
    >
      {labelled ? <title>{title}</title> : null}
      <path d={MARK_TOP_PATH} />
      <path d={MARK_BOTTOM_PATH} />
    </svg>
  );
}

/**
 * Google's "G" mark, for the OAuth buttons.
 *
 * Lives here because `AGENTS.md` rule #7 makes brand marks the one exception to
 * lucide-only icons, and lucide has no provider logos. Unlike `EscentoMark` this
 * one is **not** `currentColor`: the four colors are fixed by Google's brand
 * terms, so it must not inherit the button's text color. That is also why it
 * survives the button's hover-to-ink state unchanged.
 */
export function GoogleMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
      {...props}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

type EscentoWordmarkProps = {
  /** Controls font-size and color of the lockup (e.g. `text-lg text-white`). */
  className?: string;
  /** Optional override for the mark sizing/spacing. */
  markClassName?: string;
};

/** The long-form "Escento" wordmark: the E mark joined to "scento". */
export function EscentoWordmark({ className, markClassName }: EscentoWordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Escento"
      className={cx(
        "inline-flex items-baseline font-bold leading-none tracking-tight",
        className,
      )}
    >
      <EscentoMark
        className={cx("h-[0.72em] w-auto shrink-0 translate-y-[0.01em]", markClassName)}
      />
      <span aria-hidden="true" className="-ml-[0.01em]">
        scento
      </span>
    </span>
  );
}
