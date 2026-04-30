"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchResultItem = {
  type: "blog" | "product" | "service" | "treatment" | "page" | string;
  group?: "featured_products" | "featured_services";
  title: string;
  excerpt?: string | null;
  href: string;
  score?: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatches(text: string, rawQuery: string) {
  const q = rawQuery.trim().replace(/\s+/g, " ");
  if (!q) return text;

  if (q.length < 2) return text;

  // Exact phrase highlighting (case-insensitive), matching the API behavior.
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <mark className="bg-yellow-200 px-0.5 text-slate-900">{match}</mark>
      {after}
    </>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function typeLabel(t: SearchResultItem["type"]) {
  switch (t) {
    case "blog":
      return "Blog";
    case "product":
      return "Product";
    case "service":
      return "Service";
    case "treatment":
      return "Treatment";
    case "page":
      return "Page";
    default:
      return "Result";
  }
}

export default function HeaderSearch({
  className,
  placeholder = "Search pages, products, blog…",
  variant = "header",
  showFeatured = false,
  resultsPlacement = "overlay",
}: {
  className?: string;
  placeholder?: string;
  variant?: "header" | "modal";
  showFeatured?: boolean;
  resultsPlacement?: "overlay" | "inline";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const canSearch = debouncedQuery.trim().length >= 2;

  const resultsId = useMemo(
    () => `header-search-results-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  useEffect(() => {
    if (!canSearch) {
      if (!showFeatured) {
        setItems([]);
        setLoading(false);
      }
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery.trim())}&limit=8`,
          { signal: controller.signal }
        );
        const json = (await res.json()) as { results?: SearchResultItem[] };
        if (cancelled) return;
        setItems(Array.isArray(json.results) ? json.results : []);
        setOpen(true);
      } catch (e) {
        if (cancelled) return;
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [canSearch, debouncedQuery]);

  useEffect(() => {
    if (!showFeatured) return;
    if (query.trim().length > 0) return;

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?featured=1&limit=6`, {
          signal: controller.signal,
        });
        const json = (await res.json()) as { results?: SearchResultItem[] };
        if (cancelled) return;
        setItems(Array.isArray(json.results) ? json.results : []);
        setOpen(true);
      } catch {
        if (cancelled) return;
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [showFeatured, query]);

  useEffect(() => {
    if (resultsPlacement !== "overlay") return;
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [resultsPlacement]);

  function clear() {
    setQuery("");
    if (!showFeatured) setItems([]);
    setOpen(showFeatured);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  const shouldShowPanelContent =
    loading || items.length > 0 || canSearch || (showFeatured && !query.trim());

  const showPanel =
    resultsPlacement === "inline" ? shouldShowPanelContent : open && shouldShowPanelContent;

  const inputClassName =
    variant === "modal"
      ? "h-10 w-full rounded-none border border-slate-200 bg-white pl-9 pr-10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
      : "h-10 w-full rounded-none border border-border bg-white pl-9 pr-10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0";

  const iconClassName =
    variant === "modal"
      ? "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      : "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500";

  const clearButtonClassName =
    variant === "modal"
      ? "absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      : "absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-none text-slate-500 hover:bg-muted hover:text-slate-900";

  const inlineIsLight = resultsPlacement === "inline" && variant === "modal";
  const pillsAreLight = resultsPlacement === "overlay" || inlineIsLight;

  const panelClassName =
    resultsPlacement === "inline"
      ? inlineIsLight
        ? cn(
            "mt-4 overflow-hidden rounded-none border border-border bg-white text-slate-900 shadow-none"
          )
        : cn(
            "mt-4 overflow-hidden rounded-none border border-white/10 bg-black/30 text-white backdrop-blur-sm shadow-none"
          )
      : "absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-none border border-border bg-white text-slate-900 shadow-none";

  const scrollClassName =
    resultsPlacement === "inline"
      ? "max-h-[45vh] overflow-auto overscroll-y-contain py-2 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full"
      : "max-h-[340px] overflow-auto overscroll-y-contain py-2 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full";

  const emptyTextClassName = inlineIsLight
    ? "text-slate-600"
    : resultsPlacement === "inline"
      ? "text-white/80"
      : "text-slate-600";

  const emptyStrongTextClassName = inlineIsLight
    ? "text-slate-900"
    : resultsPlacement === "inline"
      ? "text-white"
      : "text-slate-900";

  const groupHeaderClassName = inlineIsLight
    ? "text-slate-500"
    : resultsPlacement === "inline"
      ? "text-white/70"
      : "text-slate-500";

  const rowClassName = (active: boolean) =>
    resultsPlacement === "inline"
      ? inlineIsLight
        ? cn(
            "flex items-start gap-3 px-4 py-3 transition-colors",
            active ? "bg-muted" : "hover:bg-muted/60"
          )
        : cn(
            "flex items-start gap-3 px-4 py-3 transition-colors",
            active ? "bg-white/10" : "hover:bg-white/5"
          )
      : cn(
          "flex items-start gap-3 px-4 py-3 transition-colors",
          active ? "bg-muted" : "hover:bg-muted/60"
        );

  const pillClassName =
    resultsPlacement === "inline"
      ? inlineIsLight
        ? "mt-0.5 inline-flex min-w-[74px] items-center justify-center rounded-none border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800"
        : "mt-0.5 inline-flex min-w-[74px] items-center justify-center rounded-none border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/80"
      : pillsAreLight
        ? "mt-0.5 inline-flex min-w-[74px] items-center justify-center rounded-none border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-800"
        : "mt-0.5 inline-flex min-w-[74px] items-center justify-center rounded-none border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600";

  const excerptClassName = inlineIsLight
    ? "text-slate-600"
    : resultsPlacement === "inline"
      ? "text-white/75"
      : "text-slate-600";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className={iconClassName} />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (e.target.value.trim().length < 2) setOpen(false);
          }}
          onFocus={() => {
            if (showFeatured && query.trim().length === 0 && items.length > 0) {
              setOpen(true);
              return;
            }
            if (query.trim().length >= 2) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              setActiveIndex(-1);
              return;
            }

            if (!showPanel) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = Math.min(activeIndex + 1, items.length - 1);
              setActiveIndex(next);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.max(activeIndex - 1, 0);
              setActiveIndex(next);
              return;
            }
            if (e.key === "Enter") {
              if (activeIndex >= 0 && activeIndex < items.length) {
                e.preventDefault();
                router.push(items[activeIndex]!.href);
                setOpen(false);
              }
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={resultsId}
          aria-autocomplete="list"
          className={inputClassName}
        />

        {query.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Clear search"
            className={clearButtonClassName}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {showPanel ? (
        <div
          id={resultsId}
          role="listbox"
          className={panelClassName}
        >
          <div className={scrollClassName}>
            {loading ? (
              <div className={cn("flex items-center gap-2 px-4 py-3 text-sm", emptyTextClassName)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching…</span>
              </div>
            ) : items.length === 0 ? (
              <div className={cn("px-4 py-3 text-sm", emptyTextClassName)}>
                No results for{" "}
                <span className={cn("font-medium", emptyStrongTextClassName)}>
                  {debouncedQuery.trim()}
                </span>
                .
              </div>
            ) : (
              items.map((item, idx) => {
                const active = idx === activeIndex;
                const prevGroup = idx > 0 ? items[idx - 1]?.group : undefined;
                const showGroupHeader = item.group && item.group !== prevGroup;
                return (
                  <div key={`${item.type}-${item.href}-${idx}`}>
                    {showGroupHeader ? (
                      <div className={cn("px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide", groupHeaderClassName)}>
                        {item.group === "featured_products"
                          ? "Featured products"
                          : "Featured services"}
                      </div>
                    ) : null}
                    <Link
                      href={item.href}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => setOpen(false)}
                      className={rowClassName(active)}
                    >
                      <span className={pillClassName}>
                        {typeLabel(item.type)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {highlightMatches(item.title, debouncedQuery)}
                        </span>
                        {item.excerpt ? (
                          <span className={cn("mt-0.5 block line-clamp-2 text-xs", excerptClassName)}>
                            {highlightMatches(item.excerpt, debouncedQuery)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

