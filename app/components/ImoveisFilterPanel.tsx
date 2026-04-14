import Link from "next/link";
import { PROPERTY_TYPE_LABELS } from "@/lib/seo";

type CityOption = { city: string; citySlug: string };
type NeighborhoodOption = { neighborhood: string; neighborhoodSlug: string };
type PropertyTypeOption = { propertyTypeSlug: string };

export type ImoveisFilterPanelProps = {
  /** Base da listagem: `/imoveis` ou `/imoveis/alto-padrao` */
  listPath: string;
  /** Ritmo vertical: `compact` aproxima chips do título e do accordion (só classes). */
  density?: "default" | "compact";
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
  cities: CityOption[];
  neighborhoods: NeighborhoodOption[];
  propertyTypes: PropertyTypeOption[];
};

function buildBaseFilterParams(props: ImoveisFilterPanelProps): URLSearchParams {
  const baseFilterParams = new URLSearchParams();
  if (props.rawCidade) baseFilterParams.set("cidade", props.rawCidade);
  if (props.rawBairro) baseFilterParams.set("bairro", props.rawBairro);
  if (props.rawTipo) baseFilterParams.set("tipo", props.rawTipo);
  if (props.rawQuartos) baseFilterParams.set("quartos", props.rawQuartos);
  if (props.rawPrecoMin) baseFilterParams.set("precoMin", props.rawPrecoMin);
  if (props.rawPrecoMax) baseFilterParams.set("precoMax", props.rawPrecoMax);
  if (props.rawRenda) baseFilterParams.set("renda", props.rawRenda);
  if (props.rawOportunidade) baseFilterParams.set("oportunidade", "1");
  if (props.rawLancamento) baseFilterParams.set("lancamento", "1");
  if (props.rawDestaque) baseFilterParams.set("destaque", "1");
  return baseFilterParams;
}

function buildBadgeFilterUrl(
  listPath: string,
  baseFilterParams: URLSearchParams,
  badge: "oportunidade" | "lancamento" | "destaque",
  active: boolean
): string {
  const params = new URLSearchParams(baseFilterParams);
  if (active) params.delete(badge);
  else params.set(badge, "1");
  const qs = params.toString();
  return qs ? `${listPath}?${qs}` : listPath;
}

function buildClearBadgesUrl(listPath: string, props: ImoveisFilterPanelProps): string {
  const clearBadgesParams = new URLSearchParams();
  if (props.rawCidade) clearBadgesParams.set("cidade", props.rawCidade);
  if (props.rawBairro) clearBadgesParams.set("bairro", props.rawBairro);
  if (props.rawTipo) clearBadgesParams.set("tipo", props.rawTipo);
  if (props.rawQuartos) clearBadgesParams.set("quartos", props.rawQuartos);
  if (props.rawPrecoMin) clearBadgesParams.set("precoMin", props.rawPrecoMin);
  if (props.rawPrecoMax) clearBadgesParams.set("precoMax", props.rawPrecoMax);
  if (props.rawRenda) clearBadgesParams.set("renda", props.rawRenda);
  const qs = clearBadgesParams.toString();
  return qs ? `${listPath}?${qs}` : listPath;
}

/** Chips Oportunidades / Lançamentos / Destaques — estilo unificado (SaaS), ativo em verde. */
function chipClass(active: boolean) {
  const base =
    "flex min-h-[44px] w-full items-center justify-center rounded-full border px-3 py-2 text-center text-xs font-medium leading-tight backdrop-blur transition-all duration-200 sm:inline-flex sm:w-auto sm:px-4 sm:py-2 sm:text-sm sm:leading-normal";
  return active
    ? `${base} border-green-600 bg-green-600 text-white shadow-md hover:border-green-700 hover:bg-green-700 hover:text-white hover:shadow-lg`
    : `${base} border-green-600 bg-white/70 text-zinc-700 hover:border-green-700 hover:bg-green-50 hover:text-green-700 hover:shadow-lg`;
}

/**
 * Chips rápidos + accordion “Filtrar Imóveis” (GET, sem client JS).
 * Reutilizado em /imoveis e /imoveis/alto-padrao.
 */
export function ImoveisFilterPanel(props: ImoveisFilterPanelProps) {
  const {
    listPath,
    density = "default",
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    cities,
    neighborhoods,
    propertyTypes,
  } = props;
  const baseFilterParams = buildBaseFilterParams(props);
  const clearBadgesUrl = buildClearBadgesUrl(listPath, props);

  const chipRowTop = density === "compact" ? "mt-3 sm:mt-3" : "mt-4";
  const detailsTop = density === "compact" ? "mt-4 sm:mt-5" : "mt-6";

  return (
    <>
      <div
        className={`${chipRowTop} flex flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3`}
      >
        <div className="grid grid-cols-3 gap-2 sm:contents">
          <Link
            href={buildBadgeFilterUrl(listPath, baseFilterParams, "oportunidade", rawOportunidade)}
            className={chipClass(rawOportunidade)}
          >
            Oportunidades
          </Link>
          <Link
            href={buildBadgeFilterUrl(listPath, baseFilterParams, "lancamento", rawLancamento)}
            className={chipClass(rawLancamento)}
          >
            Lançamentos
          </Link>
          <Link
            href={buildBadgeFilterUrl(listPath, baseFilterParams, "destaque", rawDestaque)}
            className={chipClass(rawDestaque)}
          >
            Destaques
          </Link>
        </div>
        {(rawOportunidade || rawLancamento || rawDestaque) && (
          <Link
            href={clearBadgesUrl}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-300 px-4 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 sm:py-2"
          >
            Limpar badges
          </Link>
        )}
      </div>

      <details
        className={`${detailsTop} overflow-hidden rounded-xl border border-green-700 bg-white shadow-sm`}
      >
        <summary className="relative flex min-h-[44px] cursor-pointer list-none items-center justify-center bg-green-700 px-5 py-4 pr-11 text-lg font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white [&::-webkit-details-marker]:hidden">
          <span className="block w-full text-center">Filtrar Imóveis</span>
          <svg
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-white transition-transform details-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <form method="GET" action={listPath} className="space-y-4 border-t border-zinc-100 px-5 pb-5 pt-4">
          {props.rawRenda ? <input type="hidden" name="renda" value={props.rawRenda} /> : null}
          <div className="flex flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className="text-xs font-semibold text-zinc-500 max-sm:-mb-1 sm:mr-1">Buscar:</span>
            <div className="grid grid-cols-3 gap-2 sm:contents">
              <Link
                href={buildBadgeFilterUrl(listPath, baseFilterParams, "oportunidade", rawOportunidade)}
                className={chipClass(rawOportunidade)}
              >
                Oportunidades
              </Link>
              <Link
                href={buildBadgeFilterUrl(listPath, baseFilterParams, "lancamento", rawLancamento)}
                className={chipClass(rawLancamento)}
              >
                Lançamentos
              </Link>
              <Link
                href={buildBadgeFilterUrl(listPath, baseFilterParams, "destaque", rawDestaque)}
                className={chipClass(rawDestaque)}
              >
                Destaques
              </Link>
            </div>
            {(rawOportunidade || rawLancamento || rawDestaque) && (
              <Link
                href={clearBadgesUrl}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-300 px-4 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 sm:py-2"
              >
                Limpar badges
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500">Ou marque para combinar:</span>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="destaque"
                value="1"
                defaultChecked={rawDestaque}
                className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-zinc-700">Destaque</span>
            </label>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="lancamento"
                value="1"
                defaultChecked={rawLancamento}
                className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-zinc-700">Lançamento</span>
            </label>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="oportunidade"
                value="1"
                defaultChecked={rawOportunidade}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-700">Oportunidade</span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-cidade" className="text-xs font-semibold text-zinc-500">
                Cidade
              </label>
              <select
                id="filter-cidade"
                name="cidade"
                defaultValue={props.rawCidade}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="">Todas</option>
                {cities.map((c) => (
                  <option key={c.citySlug} value={c.citySlug}>
                    {c.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-bairro" className="text-xs font-semibold text-zinc-500">
                Bairro
              </label>
              <select
                id="filter-bairro"
                name="bairro"
                defaultValue={props.rawBairro}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="">Todos</option>
                {neighborhoods.map((n) => (
                  <option key={n.neighborhoodSlug} value={n.neighborhoodSlug}>
                    {n.neighborhood}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-tipo" className="text-xs font-semibold text-zinc-500">
                Tipo
              </label>
              <select
                id="filter-tipo"
                name="tipo"
                defaultValue={props.rawTipo}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="">Todos</option>
                {propertyTypes.map((t) => (
                  <option key={t.propertyTypeSlug} value={t.propertyTypeSlug}>
                    {PROPERTY_TYPE_LABELS[t.propertyTypeSlug] ?? t.propertyTypeSlug}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-quartos" className="text-xs font-semibold text-zinc-500">
                Quartos
              </label>
              <select
                id="filter-quartos"
                name="quartos"
                defaultValue={props.rawQuartos}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="">Qualquer</option>
                <option value="1">1 quarto</option>
                <option value="2">2 quartos</option>
                <option value="3">3 quartos</option>
                <option value="4">4+ quartos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-preco-min" className="text-xs font-semibold text-zinc-500">
                Preço mínimo (R$)
              </label>
              <input
                id="filter-preco-min"
                type="number"
                name="precoMin"
                min="0"
                step="10000"
                placeholder="Ex: 200000"
                defaultValue={props.rawPrecoMin}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-preco-max" className="text-xs font-semibold text-zinc-500">
                Preço máximo (R$)
              </label>
              <input
                id="filter-preco-max"
                type="number"
                name="precoMax"
                min="0"
                step="10000"
                placeholder="Ex: 800000"
                defaultValue={props.rawPrecoMax}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-6">
              <button
                type="submit"
                className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 sm:w-auto"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </form>
      </details>
    </>
  );
}
