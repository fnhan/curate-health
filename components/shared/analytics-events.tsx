"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Conversion events for GA4. CH-113.
 *
 * Nothing was tracked before this. gtag loaded and counted page views, so the
 * numbers could say which pages were visited and never which ones produced an
 * appointment. Every judgement about whether the SEO work is paying off runs
 * through this file.
 *
 * ONE DELEGATED LISTENER, NOT A PROP ON EVERY BUTTON
 *
 * Booking links are rendered by at least five components, and some of them
 * come out of Sanity as portable text, where there is no component to edit at
 * all. Threading an onClick through each one would miss those, and would miss
 * the next component somebody adds. A single listener on the document reads
 * the href of whatever was clicked, so a booking link is measured wherever it
 * appears and whoever added it.
 *
 * The cost is that this depends on the href rather than on intent. If Jane is
 * ever replaced, BOOKING_HOST is the one line to change.
 *
 * WHY NOT GA4 ENHANCED MEASUREMENT
 *
 * GA4 can collect outbound clicks and file downloads on its own. Two problems
 * here. It reports every outbound click under one event name, so a Jane
 * booking is indistinguishable from a click on an Instagram link, which
 * defeats the purpose. And it is a setting in the GA4 property that nobody on
 * this project controls from the repository, so it can be switched off without
 * anything in the codebase changing. Named events are explicit and they live
 * in version control.
 */

const BOOKING_HOST = "janeapp.com";

/** Keeps the payload small and readable in the GA4 UI. */
function label(node: HTMLAnchorElement) {
  const text = (node.textContent || "").trim().replace(/\s+/g, " ");
  if (text) return text.slice(0, 80);

  const aria = node.getAttribute("aria-label");
  return aria ? aria.slice(0, 80) : "(no text)";
}

type EventName =
  | "book_now"
  | "call_click"
  | "email_click"
  | "directions_click"
  | "file_download";

/**
 * Decides what a click was, from the href alone.
 *
 * Returns null for anything that is not one of the actions worth counting,
 * which is most clicks. Ordinary internal navigation is already covered by
 * page views.
 */
function classify(href: string): EventName | null {
  if (href.includes(BOOKING_HOST)) return "book_now";
  if (href.startsWith("tel:")) return "call_click";
  if (href.startsWith("mailto:")) return "email_click";

  // The Get Directions button, which carries a destination address. A plain
  // link to the Google listing is not the same action and is not counted.
  if (href.includes("daddr=")) return "directions_click";

  if (/\.pdf(\?|$)/i.test(href)) return "file_download";

  return null;
}

declare global {
  interface Window {
    gtag?: (
      command: "event",
      name: string,
      params?: Record<string, string | number>
    ) => void;
  }
}

export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    // The Studio is excluded from GA4 entirely, so there is nothing to send
    // from it. Same test as components/shared/google-analytics.tsx.
    if (pathname === "/studio" || pathname?.startsWith("/studio/")) return;

    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      // getAttribute rather than .href, because .href resolves a relative URL
      // against the current page and would turn "/contact" into a full URL,
      // which is harder to read and no more useful.
      const href = anchor.getAttribute("href") || "";
      const name = classify(href);
      if (!name) return;

      /*
       * If gtag has not loaded, the click is not queued for later. It is a
       * marketing measurement on a page the visitor is leaving, and a queue
       * that survives the navigation is more machinery than the number is
       * worth. Losing the small share of clicks that happen before
       * afterInteractive fires is the accepted trade.
       */
      window.gtag?.("event", name, {
        link_url: href.slice(0, 200),
        link_text: label(anchor),
        page_path: pathname || "/",
      });
    }

    // Capture phase, so the event is recorded even where a handler further
    // down calls stopPropagation before it would reach the document.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
