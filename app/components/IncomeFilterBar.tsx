"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

type FilterVariant = "income" | "featured" | "advanced";

type FilterItem = {
  label: string;
  href: string;
  variant: FilterVariant;
};

const filters: FilterItem[] = [
  { label: "Renda até R$ 2.850", href: "/imoveis?precoMax=190000", variant: "income" },
  { label: "Renda até R$ 4.700", href: "/imoveis?precoMax=264000", variant: "income" },
  { label: "Renda até R$ 8.000", href: "/imoveis?precoMax=350000", variant: "income" },
  { label: "Renda até R$ 12.000", href: "/imoveis?precoMax=450000", variant: "income" },
  { label: "Renda acima de R$ 12.000", href: "/imoveis?precoMin=450000", variant: "income" },
  { label: "Alto Padrão", href: "/imoveis/alto-padrao", variant: "featured" },
  { label: "Investimento", href: "/investir-no-brasil", variant: "featured" },
  { label: "Busca Avançada", href: "/imoveis", variant: "advanced" },
];

function chipClass(variant: FilterVariant): string {
  const base =
    "flex min-h-[44px] shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold leading-snug tracking-tight antialiased shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900 md:min-h-9 md:px-2 md:py-1.5 md:text-[11px] md:leading-tight lg:px-2.5 lg:text-xs md:snap-none";
  switch (variant) {
    case "income":
      return `${base} border border-white/40 bg-white/95 text-zinc-950 hover:border-white/90 hover:bg-white`;
    case "featured":
      return `${base} border border-orange-700 bg-orange-600 text-white [text-shadow:0_1px_0_rgba(0,0,0,0.12)] hover:border-orange-800 hover:bg-orange-700`;
    case "advanced":
      return `${base} border border-white/55 bg-white text-zinc-950 hover:bg-zinc-50`;
  }
}

export function IncomeFilter() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    // tolerância para subpixel / snap — no início não mostrar seta esquerda
    const atStart = scrollLeft <= 1;
    const atEnd = maxScroll <= 1 || scrollLeft >= maxScroll - 1;
    setCanPrev(!atStart);
    setCanNext(!atEnd);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const run = () => {
      updateScrollState();
      requestAnimationFrame(() => updateScrollState());
    };

    run();
    const ro = new ResizeObserver(() => run());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(280, el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section
      className="border-b border-emerald-700/35 bg-linear-to-r from-emerald-900 via-green-700 to-emerald-900 py-2 shadow-sm"
      aria-label="Filtros de renda e categorias"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 sm:px-3 md:block md:px-0">
        {/* Mobile: setas ao lado da faixa — nunca sobrepostas aos chips (scrollLeft em alguns devices é impreciso) */}
        <div
          className={`flex shrink-0 items-center justify-center md:hidden ${canPrev ? "w-9" : "w-0 min-w-0 overflow-hidden"}`}
        >
          {canPrev ? (
            <button
              type="button"
              aria-label="Rolar filtros para a esquerda"
              onClick={() => scrollByDir(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/95 text-emerald-900 shadow-md transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2.25} />
            </button>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="income-filter-scroll income-filter-scroll--on-green min-w-0 flex-1 touch-pan-x overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory md:w-full md:touch-auto md:overflow-x-visible md:overflow-y-visible md:scroll-auto md:pb-0 md:snap-none md:px-4 md:pl-4 md:pr-4 lg:px-8"
        >
          <div className="flex w-max min-w-0 gap-3 py-1 pr-4 sm:pr-6 md:w-full md:flex-nowrap md:justify-between md:gap-1.5 md:pr-0 lg:gap-2 xl:gap-2.5">
            {filters.map((filter) => (
              <Link key={filter.label} href={filter.href} className={chipClass(filter.variant)}>
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center justify-center md:hidden ${canNext ? "w-9" : "w-0 min-w-0 overflow-hidden"}`}
        >
          {canNext ? (
            <button
              type="button"
              aria-label="Rolar filtros para a direita"
              onClick={() => scrollByDir(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/95 text-emerald-900 shadow-md transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2.25} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
