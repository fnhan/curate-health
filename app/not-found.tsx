import Link from "next/link";

import { Button } from "components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex flex-1 flex-col-reverse items-center justify-center gap-8 bg-primary py-96 text-center text-foreground">
      <Button
        asChild
        className="flex items-center gap-2 rounded-none hover:underline"
      >
        <Link href="/">
          <HomeIcon size={16} />
          <span className="">Return to Home page</span>
        </Link>
      </Button>
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-balance">
        Oops! The page you are looking for can't be found.
      </p>
    </div>
  );
}
