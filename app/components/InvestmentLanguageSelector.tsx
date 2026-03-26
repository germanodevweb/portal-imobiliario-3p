"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INVEST_ROUTES } from "@/lib/i18n/invest";

export function InvestmentLanguageSelector() {
  const pathname = usePathname();

  const isPt = pathname === "/investir-no-brasil";
  const isEn = pathname === "/en/invest-in-brazil";
  const isFr = pathname === "/fr/investir-au-bresil";
  const isEs = pathname === "/es/invertir-en-brasil";

  return (
    <nav
      aria-label="Selecionar idioma"
      className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-1 py-0.5 shadow-sm"
    >
      <Link
        href={INVEST_ROUTES.pt}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          isPt
            ? "bg-green-700 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        PT-BR
      </Link>
      <Link
        href={INVEST_ROUTES.en}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          isEn
            ? "bg-green-700 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        EN
      </Link>
      <Link
        href={INVEST_ROUTES.fr}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          isFr
            ? "bg-green-700 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        FR
      </Link>
      <Link
        href={INVEST_ROUTES.es}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          isEs
            ? "bg-green-700 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        ES
      </Link>
    </nav>
  );
}
