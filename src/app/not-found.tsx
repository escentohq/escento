import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryCta } from "@/components/ui/primary-cta";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full max-w-2xl">
        <EmptyState
          eyebrow="404 Error"
          title="Lost in the mix."
          headingLevel="h1"
          body="The page you're looking for doesn't exist, has been moved, or hasn't been built yet."
          cta={
            <PrimaryCta href="/">
              Return Home
            </PrimaryCta>
          }
        />
      </div>
    </div>
  );
}
