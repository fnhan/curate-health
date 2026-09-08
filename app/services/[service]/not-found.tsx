import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * 404 boundary for the service and treatment segments. See CH-001.
 *
 * Sits under app/services/layout.tsx, so an unknown slug still renders with the
 * site nav and footer and offers a route back into the services hub. Without
 * this file the nearest boundary is the bare root not-found, which has neither.
 */
export default function ServiceNotFound() {
  return (
    <div className="bg-white text-primary">
      <div className="container flex flex-col items-center gap-6 py-40 text-center">
        <h1 className="text-3xl font-light italic md:text-4xl">
          We could not find that service
        </h1>
        <p className="max-w-[60ch] text-pretty">
          The page you are looking for may have moved or may never have existed.
          Browse everything we offer, or head back to the home page.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Button
            asChild
            className="rounded-none border border-primary bg-primary text-white hover:bg-transparent hover:text-primary"
          >
            <Link href="/services">View all services</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border border-primary bg-transparent text-primary hover:bg-primary hover:text-white"
          >
            <Link href="/">Return to home page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
