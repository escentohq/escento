import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { SecondaryCta } from "@/components/ui/secondary-cta";

export default function NotFound() {
  return (
    <div className="bg-paper px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <EmptyState
          title="Page not found"
          headingLevel="h1"
          body="This page does not exist or has moved."
          cta={
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryCta href="/">Return home</PrimaryCta>
              <SecondaryCta href="/musicians">Browse musicians</SecondaryCta>
            </div>
          }
        />
      </div>
    </div>
  );
}
