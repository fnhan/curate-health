"use client";

import { useEffect, useRef } from "react";

import { CheckIcon, XIcon } from "lucide-react";

/**
 * A message over the whole page, for the one thing a visitor must not miss.
 *
 * Frank, 2026-10-18: hold the newsletter confirmation notice for ten seconds
 * and put it over the site, because people were missing it in the corner.
 *
 * That matters more here than the wording suggests. Systeme.io is double
 * opt-in, so somebody who does not go and click the link in their email is
 * never subscribed, and their pending contact can be purged after a couple
 * of weeks. A notice nobody reads costs a subscriber.
 *
 * IT CAN ALWAYS BE CLOSED, and that is not optional. A panel over the whole
 * page that cannot be dismissed for ten seconds traps anyone who has already
 * read it, and traps a screen reader or keyboard user worst of all. So the
 * ten seconds is a maximum, not a minimum: Escape, the close button and the
 * backdrop all end it immediately.
 */
export function ConfirmationOverlay({
  open,
  onClose,
  title,
  description,
  autoCloseMs = 10000,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** Closes itself after this long. The visitor can always close it sooner. */
  autoCloseMs?: number;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    /*
     * Remember what had focus, move it into the panel, and put it back on
     * close. Without this a keyboard user is left tabbing through the page
     * behind an overlay they cannot see past.
     */
    returnFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // The page behind must not scroll under the panel.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(onClose, autoCloseMs);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      (returnFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, autoCloseMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-overlay-title"
        aria-describedby="confirmation-overlay-description"
        /* The panel swallows the click, so only the backdrop closes it. */
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white p-8 text-center text-primary shadow-xl md:p-12"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-1 text-primary/60 transition-colors hover:text-primary"
        >
          <XIcon className="h-5 w-5" />
        </button>

        <div
          aria-hidden
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary"
        >
          <CheckIcon className="h-7 w-7 text-white" strokeWidth={2} />
        </div>

        <h2
          id="confirmation-overlay-title"
          className="mb-3 text-2xl font-light md:text-3xl"
        >
          {title}
        </h2>
        <p
          id="confirmation-overlay-description"
          className="text-pretty font-light leading-relaxed text-primary/80"
        >
          {description}
        </p>
      </div>
    </div>
  );
}
