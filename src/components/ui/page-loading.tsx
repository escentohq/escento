export function PageLoading({
  cards = 3,
  kind = "list",
}: {
  cards?: number;
  kind?: "list" | "directory" | "detail" | "messages" | "form" | "conversation";
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      {kind === "conversation" ? (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-4 w-36 bg-[#E2E8F0]" />
          <div className="flex items-center gap-4 border-y border-rule py-5">
            <div className="media-avatar h-12 w-12 bg-[#E2E8F0]" />
            <div className="h-8 w-48 bg-[#E2E8F0]" />
          </div>
          <div className="min-h-[60vh] space-y-4 border-y border-rule py-6">
            <div className="ml-auto h-16 w-[70%] bg-ink" />
            <div className="h-16 w-[70%] bg-[#E2E8F0]" />
            <div className="ml-auto h-12 w-[55%] bg-ink" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4 border-b border-border-strong pb-8">
            <div className="h-12 w-3/5 bg-[#E2E8F0]" />
            <div className="h-5 w-2/3 bg-[#E2E8F0]" />
          </div>
          {kind === "directory" ? (
            <div className="grid gap-4 border-y border-rule py-5 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-11 border border-rule bg-[#F8FAFC]" />)}
            </div>
          ) : null}
          {kind === "detail" ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <div className="h-80 bg-brand" />
              <div className="h-64 border-t-4 border-brand bg-ink" />
            </div>
          ) : kind === "form" ? (
            <div className="max-w-3xl space-y-6 border-y border-rule py-8">
              {Array.from({ length: cards }).map((_, index) => <div key={index} className="h-16 border border-rule bg-[#F8FAFC]" />)}
            </div>
          ) : (
            <div className={`divide-y divide-rule border-y border-rule ${kind === "messages" ? "max-w-4xl" : ""}`}>
              {Array.from({ length: cards }).map((_, index) => (
                <div key={index} className={kind === "messages" ? "h-20" : "h-28"} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
