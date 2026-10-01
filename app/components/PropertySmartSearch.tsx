"use client";

import { Building2, Home, LandPlot, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  isValidPropertySearchQuery,
  sanitizePropertySearchQuery,
} from "@/lib/imoveis/property-text-search";
import { cn } from "@/lib/utils";

type Suggestion = {
  label: string;
  hint: string;
  href: string;
};

const QUICK_TYPES = [
  { label: "Casas", href: "/imoveis?tipo=casa", Icon: Home },
  { label: "Apartamentos", href: "/imoveis?tipo=apartamento", Icon: Building2 },
  { label: "Terrenos", href: "/imoveis?tipo=terreno", Icon: LandPlot },
] as const;

function suggestionIcon(hint: string) {
  if (hint === "Cidade") return MapPin;
  return Sparkles;
}

export function PropertySmartSearch() {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const fetchSuggestions = useCallback(async (raw: string) => {
    const q = sanitizePropertySearchQuery(raw);
    if (!isValidPropertySearchQuery(q)) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/imoveis/busca-sugestoes?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as { suggestions: Suggestion[] };
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    const q = sanitizePropertySearchQuery(query);
    if (!isValidPropertySearchQuery(q)) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchSuggestions(q);
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  const showList = open && (loading || suggestions.length > 0);

  return (
    <section
      aria-labelledby="home-smart-search-heading"
      className="-mt-1 mb-8 sm:mb-10"
    >
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-green-900 to-emerald-950 px-4 py-6 shadow-[0_20px_50px_-20px_rgba(6,78,59,0.55)] ring-1 ring-white/10 sm:px-7 sm:py-8"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-orange-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <h1
            id="home-smart-search-heading"
            className="text-pretty text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.65rem]"
          >
            Encontre seu imóvel em segundos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">
            Busque por empreendimento, cidade, bairro ou construtora — sugestões enquanto
            você digita.
          </p>

          <form action="/imoveis" method="get" className="relative mt-5 sm:mt-6" role="search">
            <label htmlFor="home-property-search" className="sr-only">
              Buscar imóvel
            </label>

            <div className="relative">
              <div className="flex flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/80 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
                <div className="relative flex min-w-0 flex-1 items-center">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-green-700/70 sm:left-4"
                    aria-hidden
                  />
                  <input
                    id="home-property-search"
                    name="busca"
                    type="search"
                    value={query}
                    autoComplete="off"
                    placeholder="Ex.: Q Tower, Pecem, Cyrela…"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={showList ? listId : undefined}
                    aria-expanded={showList}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setOpen(true);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(event) => {
                      if (!showList || suggestions.length === 0) return;
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveIndex((i) => Math.max(i - 1, 0));
                      } else if (event.key === "Enter" && activeIndex >= 0) {
                        event.preventDefault();
                        window.location.href = suggestions[activeIndex]?.href ?? "/imoveis";
                      } else if (event.key === "Escape") {
                        setOpen(false);
                        setActiveIndex(-1);
                      }
                    }}
                    className="min-h-[48px] w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 sm:min-h-[44px] sm:rounded-full sm:py-2.5 sm:pl-12 sm:pr-4"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-7 text-sm font-bold tracking-wide text-white shadow-md shadow-orange-950/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[44px] sm:w-auto sm:rounded-full sm:px-8"
                >
                  Buscar
                </button>
              </div>

              {showList ? (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(20rem,52vh)] overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white py-2 shadow-2xl shadow-black/10 ring-1 ring-black/5"
                >
                  {loading ? (
                    <li className="px-4 py-3 text-sm text-zinc-500">Buscando imóveis…</li>
                  ) : (
                    suggestions.map((item, index) => {
                      const Icon = suggestionIcon(item.hint);
                      return (
                        <li key={item.href} role="option" aria-selected={index === activeIndex}>
                          <Link
                            href={item.href}
                            className={cn(
                              "mx-2 flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-emerald-50",
                              index === activeIndex && "bg-emerald-50"
                            )}
                            onClick={() => {
                              setOpen(false);
                              setActiveIndex(-1);
                            }}
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                              <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-zinc-900">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-zinc-500">
                                {item.hint}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : null}
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="mr-1 text-xs font-medium uppercase tracking-wider text-emerald-200/80">
              Atalhos
            </span>
            {QUICK_TYPES.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/15 active:scale-[0.98] sm:min-h-[44px] sm:px-4"
              >
                <Icon className="h-4 w-4 shrink-0 text-emerald-200" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
