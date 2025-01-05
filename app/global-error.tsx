"use client";

import Link from "next/link";

import { HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <h2 className="text-2xl font-bold text-black">
          We're sorry, but something went wrong!
        </h2>
        <Button
          variant={"destructive"}
          className="rounded-none"
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button
          asChild
          className="flex items-center gap-2 rounded-none hover:underline"
        >
          <Link href="/">
            <HomeIcon size={16} />
            <span className="">Return to Home page</span>
          </Link>
        </Button>
      </body>
    </html>
  );
}
