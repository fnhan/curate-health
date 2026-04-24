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

  const tokens = q
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (!tokens.length) return text;

  const pattern = tokens.map(escapeRegExp).join("|");
  const re = new RegExp(`(${pattern})`, "gi");

  const parts = text.split(re);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const isHit = re.test(part);
    // Reset lastIndex since `test` with /g is stateful
    re.lastIndex = 0;
    return isHit ? (
      <mark
        key={i}
        className="bg-yellow-200 px-0.5 text-slate-900"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    );
  });
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
}: {
  className?: string;
  placeholder?: string;
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
      setItems([]);
      setLoading(false);
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
  }, []);

  function clear() {
    setQuery("");
    setItems([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  const showPanel = open && (loading || items.length > 0 || canSearch);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (e.target.value.trim().length < 2) setOpen(false);
          }}
          onFocus={() => {
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
          className="h-10 w-full rounded-none border-white/15 bg-white/10 pl-9 pr-10 text-white placeholder:text-white/70 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0"
        />

        {query.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-none text-white/90 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {showPanel ? (
        <div
          id={resultsId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-none border border-border bg-white text-slate-900 shadow-2xl"
        >
          <div className="max-h-[340px] overflow-auto overscroll-y-contain py-2 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary scrollbar-thumb-rounded-full">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-600">
                No results for{" "}
                <span className="font-medium text-slate-900">
                  {debouncedQuery.trim()}
                </span>
                .
              </div>
            ) : (
              items.map((item, idx) => {
                const active = idx === activeIndex;
                return (
                  <Link
                    key={`${item.type}-${item.href}-${idx}`}
                    href={item.href}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 transition-colors",
                      active ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="mt-0.5 inline-flex min-w-[74px] items-center justify-center rounded-none border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {typeLabel(item.type)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {highlightMatches(item.title, debouncedQuery)}
                      </span>
                      {item.excerpt ? (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-slate-600">
                          {highlightMatches(item.excerpt, debouncedQuery)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

