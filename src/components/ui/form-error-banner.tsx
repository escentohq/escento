"use client";

type Props = {
  variant?: "error" | "success" | "info";
  message: string;
  fieldErrorCount?: number;
  onScrollToFirstError?: () => void;
};

const variantClass: Record<NonNullable<Props["variant"]>, string> = {
  error: "border-[#FF3366]/20 bg-[#FF3366]/8 text-[#B42318]",
  success: "border-[#0055FF]/20 bg-[#0055FF]/10 text-[#0F172A]",
  info: "border-[#0055FF]/20 bg-[#0055FF]/10 text-[#0F172A]",
};

export function FormErrorBanner({
  variant = "error",
  message,
  fieldErrorCount = 0,
  onScrollToFirstError,
}: Props) {
  const showScrollLink = variant === "error" && fieldErrorCount >= 2 && onScrollToFirstError;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`border-l-4 px-4 py-3 text-sm font-semibold ${variantClass[variant]}`}
    >
      <p>{message}</p>
      {showScrollLink ? (
        <button
          type="button"
          onClick={onScrollToFirstError}
          className="mt-2 text-sm font-bold text-[#0055FF] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
        >
          Go to first field
        </button>
      ) : null}
    </div>
  );
}
