import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full  border border-[#F1F5F9] bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
          Off list
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
          Conversation not found.
        </h2>
        <p className="mt-3 font-medium leading-relaxed text-[#475569]">
          You can only open conversations you belong to.
        </p>
        <Link href="/messages" className="btn-primary mt-6">
          Back to Messages
        </Link>
      </div>
    </div>
  );
}
