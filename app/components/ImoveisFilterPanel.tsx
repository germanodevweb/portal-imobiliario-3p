"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { ImoveisFilterLocationFields } from "@/app/components/ImoveisFilterLocationFields";
import type { FilterLocationNeighborhood } from "@/lib/imoveis/filter-location-types";
import {
  applyBadgeParams,
  buildImoveisListUrl,
  readImoveisFilterFormParams,
} from "@/lib/imoveis/filter-url";
import { normalizePriceQueryParam } from "@/lib/imoveis/normalize-price-param";
import { resolvePriceFilterPair } from "@/lib/imoveis/resolve-price-filter";
import { PROPERTY_TYPE_LABELS } from "@/lib/seo";
import { cn } from "@/lib/utils";

type CityOption = { city: string; citySlug: string };
type PropertyTypeOption = { propertyTypeSlug: string };

export type ImoveisFilterPanelProps = {
  listPath: string;
  density?: "default" | "compact";
  initialDetailsOpen?: boolean;
  rawCidade: string;
  rawBairro: string;
  rawTipo: string;
  rawQuartos: string;
  rawPrecoMin: string;
  rawPrecoMax: string;
  rawRenda: string;
  rawDestaque: boolean;
  rawLancamento: boolean;
  rawOportunidade: boolean;
  rawBusca?: string;
  cities: CityOption[];
  neighborhoods: FilterLocationNeighborhood[];
  propertyTypes: PropertyTypeOption[];
};

type BadgeKey = "destaque" | "lancamento" | "oportunidade";

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

function badgeChipClass(active: boolean) {
  return cn(
    "flex min-h-11 w-full items-center justify-center rounded-full border px-3 py-2 text-center text-xs font-semibold transition-all duration-200 sm:inline-flex sm:w-auto sm:px-4 sm:text-sm",
    active
      ? "border-orange-300/80 bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-950/30"
      : "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/15"
  );
}

export function ImoveisFilterPanel(props: ImoveisFilterPanelProps) {
  const {
    listPath,
    density = "default",
    initialDetailsOpen = false,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
  } = props;

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const badgeState = {
    destaque: rawDestaque,
    lancamento: rawLancamento,
    oportunidade: rawOportunidade,
  };

  const navigateWithBadges = useCallback(
    (badges: { destaque: boolean; lancamento: boolean; oportunidade: boolean }) => {
      const form = formRef.current;
      if (!form) return;
      const params = applyBadgeParams(readImoveisFilterFormParams(form), badges);
      router.push(buildImoveisListUrl(listPath, params));
    },
    [listPath, router]
  );

  const toggleBadge = (key: BadgeKey) => {
    const next = { ...badgeState };
    if (key === "destaque") next.destaque = !next.destaque;
    if (key === "lancamento") next.lancamento = !next.lancamento;
    if (key === "oportunidade") next.oportunidade = !next.oportunidade;
    navigateWithBadges(next);
  };

  const clearBadges = () => {
    navigateWithBadges({
      destaque: false,
      lancamento: false,
      oportunidade: false,
    });
  };

  const normalizePriceFieldsBeforeSubmit = (form: HTMLFormElement) => {
    const minEl = form.elements.namedItem("precoMin");
    const maxEl = form.elements.namedItem("precoMax");
    if (!(minEl instanceof HTMLInputElement) || !(maxEl instanceof HTMLInputElement)) {
      return;
    }
    const { minPrice, maxPrice } = resolvePriceFilterPair(
      normalizePriceQueryParam(minEl.value),
      normalizePriceQueryParam(maxEl.value)
    );
    minEl.value = minPrice ?? "";
    maxEl.value = maxPrice ?? "";
  };

  const hasBadges = rawDestaque || rawLancamento || rawOportunidade;
  const showTextSearch = listPath === "/imoveis";
  const sectionTop = density === "compact" ? "mt-3 sm:mt-4" : "mt-4 sm:mt-5";

  return (
    <section aria-label="Filtros de imóveis" className={cn("mb-6 sm:mb-8", sectionTop)}>
      <form
        ref={formRef}
        method="GET"
        action={listPath}
        autoComplete="off"
        onSubmit={(event) => {
          normalizePriceFieldsBeforeSubmit(event.currentTarget);
        }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-green-900 to-emerald-950 px-4 py-5 shadow-[0_20px_50px_-20px_rgba(6,78,59,0.55)] ring-1 ring-white/10 sm:px-6 sm:py-6"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />

        {props.rawRenda ? <input type="hidden" name="renda" value={props.rawRenda} /> : null}
        {rawDestaque ? <input type="hidden" name="destaque" value="1" /> : null}
        {rawLancamento ? <input type="hidden" name="lancamento" value="1" /> : null}
        {rawOportunidade ? <input type="hidden" name="oportunidade" value="1" /> : null}

        <div className="relative space-y-4 sm:space-y-5">
          {showTextSearch ? (
            <div>
              <p className="text-sm font-medium text-emerald-100/95 sm:text-base">
                Busca inteligente
              </p>
              <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/80 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
                <label htmlFor="filter-busca" className="sr-only">
                  Buscar imóvel
                </label>
                <div className="relative flex min-w-0 flex-1 items-center">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-green-700/70 sm:left-4"
                    aria-hidden
                  />
                  <input
                    id="filter-busca"
                    type="search"
                    name="busca"
                    defaultValue={props.rawBusca ?? ""}
                    placeholder="Empreendimento, construtora, cidade ou bairro"
                    className="min-h-11 w-full rounded-xl border-0 bg-transparent py-2.5 pl-11 pr-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 sm:rounded-full sm:pl-12"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-7 text-sm font-bold text-white shadow-md shadow-orange-950/25 transition-all hover:from-orange-600 hover:to-orange-700 sm:w-auto sm:rounded-full sm:px-8"
                >
                  Buscar
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200/85">
                Filtros rápidos
              </span>
              <span className="hidden text-xs text-emerald-100/70 sm:inline">
                (incluem cidade e bairro abaixo)
              </span>
            </div>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleBadge("oportunidade")}
                  className={badgeChipClass(rawOportunidade)}
                >
                  Oportunidades
                </button>
                <button
                  type="button"
                  onClick={() => toggleBadge("lancamento")}
                  className={badgeChipClass(rawLancamento)}
                >
                  Lançamentos
                </button>
                <button
                  type="button"
                  onClick={() => toggleBadge("destaque")}
                  className={badgeChipClass(rawDestaque)}
                >
                  Destaques
                </button>
              </div>
              {hasBadges ? (
                <button
                  type="button"
                  onClick={clearBadges}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-4 text-xs font-medium text-emerald-100 transition-colors hover:bg-white/10"
                >
                  Limpar badges
                </button>
              ) : null}
            </div>
          </div>

          <details
            open={initialDetailsOpen}
            className="group/refine"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 [&::-webkit-details-marker]:hidden">
              Refinar: cidade, tipo e preço
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-open/refine:rotate-180"
                aria-hidden
              />
            </summary>

            <div className="mt-4 rounded-2xl bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.1)] ring-1 ring-white/80 backdrop-blur-md sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <ImoveisFilterLocationFields
                  cities={props.cities}
                  neighborhoods={props.neighborhoods}
                  defaultCity={props.rawCidade}
                  defaultNeighborhood={props.rawBairro}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-tipo" className="text-xs font-semibold text-zinc-600">
                    Tipo
                  </label>
                  <select
                    id="filter-tipo"
                    name="tipo"
                    defaultValue={props.rawTipo}
                    className={fieldClassName}
                  >
                    <option value="">Todos</option>
                    {props.propertyTypes.map((t) => (
                      <option key={t.propertyTypeSlug} value={t.propertyTypeSlug}>
                        {PROPERTY_TYPE_LABELS[t.propertyTypeSlug] ?? t.propertyTypeSlug}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-quartos" className="text-xs font-semibold text-zinc-600">
                    Quartos
                  </label>
                  <select
                    id="filter-quartos"
                    name="quartos"
                    defaultValue={props.rawQuartos}
                    className={fieldClassName}
                  >
                    <option value="">Qualquer</option>
                    <option value="1">1 quarto</option>
                    <option value="2">2 quartos</option>
                    <option value="3">3 quartos</option>
                    <option value="4">4+ quartos</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-preco-min" className="text-xs font-semibold text-zinc-600">
                    Preço mínimo (R$)
                  </label>
                  <input
                    id="filter-preco-min"
                    type="text"
                    inputMode="numeric"
                    name="precoMin"
                    placeholder="Ex: 200.000"
                    defaultValue={props.rawPrecoMin}
                    className={fieldClassName}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-preco-max" className="text-xs font-semibold text-zinc-600">
                    Preço máximo (R$)
                  </label>
                  <input
                    id="filter-preco-max"
                    type="text"
                    inputMode="numeric"
                    name="precoMax"
                    placeholder="Ex: 800.000"
                    defaultValue={props.rawPrecoMax}
                    className={fieldClassName}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-6 text-sm font-bold text-white shadow-md shadow-orange-950/20 transition-all hover:from-orange-600 hover:to-orange-700 sm:flex-none sm:px-8"
                  >
                    Aplicar filtros
                  </button>
                  <Link
                    href={listPath}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 sm:flex-none"
                  >
                    Limpar tudo
                  </Link>
                </div>
              </div>
            </div>
          </details>
        </div>
      </form>
    </section>
  );
}
