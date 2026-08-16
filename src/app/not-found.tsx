import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryCta } from "@/components/ui/primary-cta";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24">
      <div className="w-full max-w-2xl">
        <EmptyState
          eyebrow="404"
          title="Page not found"
          headingLevel="h1"
          body="This page does not exist or has moved."
          cta={
            <PrimaryCta href="/">
              Return home
            </PrimaryCta>
          }
        />
      </div>
    </div>
  );
}
