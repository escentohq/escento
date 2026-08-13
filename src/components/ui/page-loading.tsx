export function PageLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="space-y-4 border-b border-[#CBD5E1] pb-8">
        <div className="h-3 w-28 bg-[#CBD5E1]" />
        <div className="h-12 w-3/5 bg-[#E2E8F0]" />
        <div className="h-5 w-2/3 bg-[#E2E8F0]" />
      </div>
      <div className="divide-y divide-[#CBD5E1] border-y border-[#CBD5E1]">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="h-28 bg-white" />
        ))}
      </div>
    </div>
  );
}
