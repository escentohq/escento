export function PageLoading({
  cards = 3,
  kind = "list",
}: {
  cards?: number;
  kind?: "list" | "directory" | "detail" | "messages" | "form";
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="space-y-4 border-b border-[#CBD5E1] pb-8">
        <div className="h-3 w-28 bg-[#CBD5E1]" />
        <div className="h-12 w-3/5 bg-[#E2E8F0]" />
        <div className="h-5 w-2/3 bg-[#E2E8F0]" />
      </div>
      {kind === "directory" ? (
        <div className="grid gap-4 border-y border-rule py-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-11 border border-rule bg-surface" />)}
        </div>
      ) : null}
      {kind === "detail" ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <div className="h-80 border-y border-rule bg-surface" />
          <div className="h-64 border-t-4 border-brand bg-ink" />
        </div>
      ) : kind === "form" ? (
        <div className="max-w-3xl space-y-6 border-y border-rule py-8">
          {Array.from({ length: cards }).map((_, index) => <div key={index} className="h-16 border border-rule bg-surface" />)}
        </div>
      ) : (
      <div className={`divide-y divide-[#CBD5E1] border-y border-[#CBD5E1] ${kind === "messages" ? "max-w-4xl" : ""}`}>
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className={`bg-white ${kind === "messages" ? "h-20" : "h-28"}`} />
        ))}
      </div>
      )}
    </div>
  );
}
