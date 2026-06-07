"use client";

import { RouteError } from "@/components/ui/route-error";

export default function AdminError({ reset }: { reset: () => void }) {
  return <RouteError reset={reset} />;
}
