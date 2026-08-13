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
