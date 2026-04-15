"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { INCOME_FILTER_LINKS } from "@/lib/constants/income-filter-links";
import { cn } from "@/lib/utils";

/** Destaque — tipografia editorial + hover com brilho e elevação */
const chipOrange =
  "group/chip relative z-0 flex min-h-[48px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-full px-3 py-2.5 text-center sm:px-4 " +
  "text-sm font-bold uppercase leading-tight tracking-[0.14em] text-white antialiased md:text-base [text-shadow:0_1px_2px_rgba(0,0,0,0.22),0_0_1px_rgba(0,0,0,0.35)] " +
  "bg-linear-to-b from-orange-500 to-orange-600 shadow-md shadow-orange-950/30 ring-1 ring-white/25 " +
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-linear-to-tr before:from-white/25 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 " +
  "max-md:hover:translate-y-0 max-md:hover:scale-100 max-md:hover:shadow-md " +
  "hover:z-10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_44px_-12px_rgba(249,115,22,0.65)] hover:ring-orange-200/50 hover:before:opacity-100 " +
  "active:translate-y-0 active:scale-[0.99] active:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-green-700 " +
  "md:min-h-[44px] md:px-5";

/** Neutro — texto refinado + hover “flutuante” com anel esmeralda */
const chipWhite =
  "group/chip relative z-0 flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-full border border-white/45 bg-white/90 px-2.5 py-2.5 text-center backdrop-blur-md sm:px-3 " +
  "text-[13px] font-medium leading-snug tracking-tight text-zinc-800 antialiased " +
  "shadow-md shadow-green-950/15 ring-1 ring-white/65 " +
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "max-md:hover:translate-y-0 max-md:hover:scale-100 max-md:hover:shadow-md " +
  "hover:z-10 hover:-translate-y-1 hover:scale-[1.02] hover:border-white hover:bg-white hover:text-zinc-950 " +
  "hover:shadow-[0_12px_40px_-10px_rgba(6,78,59,0.28)] hover:ring-emerald-400/45 " +
  "active:translate-y-0 active:scale-[0.99] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-green-700 " +
  "sm:px-4 sm:text-[14px] md:min-h-[44px] md:text-base";

export function IncomeFilter() {
  const [incomeMenuOpen, setIncomeMenuOpen] = useState(false);
  const incomeWrapRef = useRef<HTMLDivElement>(null);

  const closeIncomeMenu = useCallback(() => setIncomeMenuOpen(false), []);

  useEffect(() => {
    if (!incomeMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!incomeWrapRef.current?.contains(e.target as Node)) closeIncomeMenu();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [incomeMenuOpen, closeIncomeMenu]);

  return (
    <section
      className="border-b border-emerald-900/60 bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:py-3.5"
      aria-label="Atalhos para imóveis por perfil e renda"
    >
      <div className="mx-auto max-w-7xl pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-4 sm:pr-4 lg:pl-8 lg:pr-8">
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-4 md:items-stretch md:gap-3 lg:gap-4">
          <Link href="/imoveis/alto-padrao" className={chipOrange}>
            Alto Padrão
          </Link>

          <Link href="/investir-no-brasil" className={chipOrange}>
            Investidores
          </Link>

          <div
            ref={incomeWrapRef}
            className={cn("group relative", incomeMenuOpen && "z-60")}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={incomeMenuOpen}
              onClick={() => setIncomeMenuOpen((v) => !v)}
              className={cn(chipWhite, "gap-1.5")}
            >
              <span className="min-w-0 flex-1 text-balance">
                Imóvel Compatível Com Sua Renda
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 text-zinc-500 transition-all duration-300 ease-out group-hover/chip:text-emerald-600",
                  incomeMenuOpen
                    ? "rotate-180 text-emerald-600"
                    : "md:group-hover:rotate-180"
                )}
                strokeWidth={2.25}
              />
            </button>

            <ul
              role="menu"
              aria-label="Faixas de renda"
              className={cn(
                "absolute top-full z-70 mt-1 max-h-[min(70vh,24rem)] overflow-y-auto overflow-x-hidden rounded-2xl border border-zinc-200/80 bg-white/98 py-1.5 shadow-xl shadow-black/15 ring-1 ring-black/5 backdrop-blur-md",
                // Mobile-first: largura da célula, sem translate — evita menu cortado na borda da tela
                "left-0 right-0 w-full min-w-0 translate-x-0",
                // md+: ancorado ao botão, largura mínima confortável
                "md:left-0 md:right-auto md:mt-0 md:w-auto md:min-w-[min(17rem,calc(100vw-2rem))] md:max-w-[min(20rem,calc(100vw-2rem))]",
                incomeMenuOpen
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0 md:group-hover:visible md:group-hover:pointer-events-auto md:group-hover:opacity-100"
              )}
            >
              {INCOME_FILTER_LINKS.map((item) => (
                <li key={item.href} role="none">
                  <Link
                    role="menuitem"
                    href={item.href}
                    className="block touch-manipulation px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors duration-200 first:pt-2.5 last:pb-2.5 active:bg-green-800 sm:px-4 hover:bg-green-700 hover:text-white focus-visible:bg-green-700 focus-visible:text-white focus-visible:outline-none"
                    onClick={closeIncomeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/imoveis" className={chipWhite}>
            Busca Avançada
          </Link>
        </div>
      </div>
    </section>
  );
}
