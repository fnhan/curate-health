"use client";

import { usePathname } from "next/navigation";

import { Phone } from "lucide-react";

const HIDDEN_PATH_PREFIXES = ["/studio"] as const;
const HIDDEN_PATHS = new Set(["/login", "/coming-soon"]);

function shouldHideCallButton(pathname: string | null): boolean {
  if (!pathname) return false;
  if (HIDDEN_PATHS.has(pathname)) return true;
  return HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

export function FloatingCallButton({ phone }: { phone: string }) {
  const pathname = usePathname();

  if (shouldHideCallButton(pathname)) return null;

  const trimmed = phone.trim();
  if (!trimmed) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-4 pr-[max(1rem,env(safe-area-inset-right,0px))] pt-4 md:p-6 md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pr-[max(1.5rem,env(safe-area-inset-right,0px))]"
      role="presentation"
    >
      <a
        href={`tel:${trimmed}`}
        className="pointer-events-auto inline-flex size-14 shrink-0 items-center justify-center border border-primary/20 bg-primary text-primary-foreground shadow-lg transition-[opacity,box-shadow] hover:opacity-95 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Call ${trimmed}`}
      >
        <Phone className="size-7 shrink-0" aria-hidden strokeWidth={1.5} />
      </a>
    </div>
  );
}
