import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full border-y border-rule py-10">
        <h2 className="text-section-heading text-ink">
          Conversation not found.
        </h2>
        <p className="mt-3 font-medium leading-relaxed text-[#475569]">
          This conversation does not exist or is not available to your account.
        </p>
        <Link href="/messages" className="control-primary mt-6">
          Back to messages
        </Link>
      </div>
    </div>
  );
}
