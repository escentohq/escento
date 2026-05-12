export function PageLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:py-24">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-28 rounded-full bg-[#E2E8F0]" />
        <div className="h-12 w-3/5 rounded-full bg-[#F1F5F9]" />
        <div className="h-5 w-2/3 rounded-full bg-[#F1F5F9]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-3xl bg-[#F8FAFC]" />
        ))}
      </div>
    </div>
  );
}

