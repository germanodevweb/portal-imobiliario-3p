import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyCard } from "@/app/components/PropertyCard";
import { Pagination } from "@/app/components/Pagination";
import {
  getFilteredProperties,
  countFilteredProperties,
  getAvailableCities,
  getAvailableNeighborhoods,
  getAvailablePropertyTypes,
  type PropertyFilters,
} from "@/lib/queries/properties";
import {
  buildImoveisPageTitle,
  buildImoveisFilteredTitle,
  buildImoveisPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
  PROPERTY_TYPE_LABELS,
  SITE_NAME,
  BASE_URL,
} from "@/lib/seo";
import {
  parsePage,
  calculateTotalPages,
  getSkip,
  buildPageTitle,
  buildPaginatedCanonical,
  ITEMS_PER_PAGE,
} from "@/lib/pagination";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const RESULTS_LIMIT = ITEMS_PER_PAGE;

// ---------------------------------------------------------------------------
// Sanitização de searchParams
// Para evitar injeção de valores maliciosos na query Prisma.
// ---------------------------------------------------------------------------

function parseSearchParams(sp: { [key: string]: string | string[] | undefined }): {
  filters: PropertyFilters;
  rawCidade: string;
  rawBairro: string;
  rawTipo: string;
  rawQuartos: string;
  rawPrecoMin: string;
  rawPrecoMax: string;
  rawDestaque: boolean;
  rawLancamento: boolean;
  rawOportunidade: boolean;
  hasFilters: boolean;
} {
  const rawCidade = typeof sp.cidade === "string" ? sp.cidade.trim() : "";
  const rawBairro = typeof sp.bairro === "string" ? sp.bairro.trim() : "";
  const rawTipo = typeof sp.tipo === "string" ? sp.tipo.trim() : "";
  const rawQuartos = typeof sp.quartos === "string" ? sp.quartos.trim() : "";
  const rawPrecoMin = typeof sp.precoMin === "string" ? sp.precoMin.trim() : "";
  const rawPrecoMax = typeof sp.precoMax === "string" ? sp.precoMax.trim() : "";
  const rawDestaque = sp.destaque === "1" || sp.destaque === "true";
  const rawLancamento = sp.lancamento === "1" || sp.lancamento === "true";
  const rawOportunidade = sp.oportunidade === "1" || sp.oportunidade === "true";

  const quartosParsed = parseInt(rawQuartos, 10);
  const bedroomsFilter =
    !isNaN(quartosParsed) && quartosParsed >= 1 && quartosParsed <= 10
      ? quartosParsed
      : undefined;

  // Validação básica de preço: só aceita valores positivos
  const minPriceFilter =
    rawPrecoMin && /^\d+(\.\d+)?$/.test(rawPrecoMin) ? rawPrecoMin : undefined;
  const maxPriceFilter =
    rawPrecoMax && /^\d+(\.\d+)?$/.test(rawPrecoMax) ? rawPrecoMax : undefined;

  const filters: PropertyFilters = {
    ...(rawCidade ? { citySlug: rawCidade } : {}),
    ...(rawBairro ? { neighborhoodSlug: rawBairro } : {}),
    ...(rawTipo ? { propertyTypeSlug: rawTipo } : {}),
    ...(bedroomsFilter !== undefined ? { bedrooms: bedroomsFilter } : {}),
    ...(minPriceFilter ? { minPrice: minPriceFilter } : {}),
    ...(maxPriceFilter ? { maxPrice: maxPriceFilter } : {}),
    ...(rawDestaque ? { isFeatured: true } : {}),
    ...(rawLancamento ? { isLaunch: true } : {}),
    ...(rawOportunidade ? { isOpportunity: true } : {}),
  };

  const hasFilters = Boolean(
    rawCidade ||
      rawBairro ||
      rawTipo ||
      bedroomsFilter ||
      minPriceFilter ||
      maxPriceFilter ||
      rawDestaque ||
      rawLancamento ||
      rawOportunidade
  );

  return {
    filters,
    rawCidade,
    rawBairro,
    rawTipo,
    rawQuartos,
    rawPrecoMin,
    rawPrecoMax,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    hasFilters,
  };
}

// ---------------------------------------------------------------------------
// Metadata
// Página limpa → index; página filtrada → noindex para evitar duplicate
// content com as páginas programáticas /cidade/[slug], /tipo/[slug], etc.
// ---------------------------------------------------------------------------

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const {
    filters,
    rawCidade,
    rawBairro,
    rawTipo,
    rawQuartos,
    rawPrecoMin,
    rawPrecoMax,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    hasFilters,
  } = parseSearchParams(sp);
  const page = parsePage(sp);

  const baseCanonical = buildCanonicalUrl("/imoveis");

  if (!hasFilters) {
    const count = await countFilteredProperties(filters);
    const baseTitle = buildImoveisPageTitle();
    const title = buildPageTitle(baseTitle, page);
    const description = buildImoveisPageDescription(count);
    const canonical = buildPaginatedCanonical(baseCanonical, page);

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: buildOpenGraph({ title, description, url: canonical }),
      twitter: buildTwitterCard({ title, description }),
      robots: { index: true, follow: true },
    };
  }

  // Página filtrada: noindex, nofollow + canonical auto-referenciado (preserva filtros e paginação)
  const city = rawCidade
    ? (await getAvailableCities()).find((c) => c.citySlug === rawCidade)?.city
    : undefined;

  const title = buildImoveisFilteredTitle({
    typeName: rawTipo ? getPropertyTypeLabel(rawTipo) : undefined,
    city,
    bedrooms: rawQuartos ? parseInt(rawQuartos, 10) : undefined,
  });

  const description = `Resultados filtrados da busca de imóveis na 3Pinheiros. ${SITE_NAME}.`;

  const filterParams: Record<string, string> = {};
  if (rawCidade) filterParams.cidade = rawCidade;
  if (rawBairro) filterParams.bairro = rawBairro;
  if (rawTipo) filterParams.tipo = rawTipo;
  if (rawQuartos) filterParams.quartos = rawQuartos;
  if (rawPrecoMin) filterParams.precoMin = rawPrecoMin;
  if (rawPrecoMax) filterParams.precoMax = rawPrecoMax;
  if (rawDestaque) filterParams.destaque = "1";
  if (rawLancamento) filterParams.lancamento = "1";
  if (rawOportunidade) filterParams.oportunidade = "1";

  const canonical = buildPaginatedCanonical(baseCanonical, page, filterParams);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: false },
  };
}

// ---------------------------------------------------------------------------
// Helpers de exibição
// ---------------------------------------------------------------------------

function formatPrice(value: string): string {
  if (!value) return "";
  const n = Number(value);
  if (isNaN(n)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

// Mapeamento renda → preço (botões do IncomeFilter)
const RENDA_PRESETS: { rendaLabel: string; precoMax?: string; precoMin?: string }[] = [
  { rendaLabel: "R$ 2.850", precoMax: "190000" },
  { rendaLabel: "R$ 4.700", precoMax: "264000" },
  { rendaLabel: "R$ 8.000", precoMax: "350000" },
  { rendaLabel: "R$ 12.000", precoMax: "450000" },
  { rendaLabel: "R$ 12.000 ou mais", precoMin: "450000" },
];

function getRendaPreset(precoMin: string, precoMax: string): string | null {
  const preset = RENDA_PRESETS.find((p) => {
    if (p.precoMax) return p.precoMax === precoMax && !precoMin;
    if (p.precoMin) return p.precoMin === precoMin && !precoMax;
    return false;
  });
  return preset?.rendaLabel ?? null;
}

function buildFilterSummary(params: {
  rawCidade: string;
  rawBairro: string;
  rawTipo: string;
  rawQuartos: string;
  rawPrecoMin: string;
  rawPrecoMax: string;
  rawDestaque: boolean;
  rawLancamento: boolean;
  rawOportunidade: boolean;
  cities: { city: string; citySlug: string }[];
}): string {
  const parts: string[] = [];

  if (params.rawDestaque) parts.push("Destaque");
  if (params.rawLancamento) parts.push("Lançamento");
  if (params.rawOportunidade) parts.push("Oportunidade");
  if (params.rawTipo) parts.push(getPropertyTypeLabel(params.rawTipo));
  if (params.rawCidade) {
    const cityName = params.cities.find((c) => c.citySlug === params.rawCidade)?.city;
    if (cityName) parts.push(`em ${cityName}`);
  }
  if (params.rawBairro) parts.push(`bairro: ${params.rawBairro}`);
  if (params.rawQuartos) {
    const q = parseInt(params.rawQuartos, 10);
    if (!isNaN(q)) parts.push(`${q >= 4 ? "4+" : q} quarto${q !== 1 ? "s" : ""}`);
  }
  if (params.rawPrecoMin && params.rawPrecoMax) {
    parts.push(`${formatPrice(params.rawPrecoMin)} – ${formatPrice(params.rawPrecoMax)}`);
  } else if (params.rawPrecoMin) {
    parts.push(`a partir de ${formatPrice(params.rawPrecoMin)}`);
  } else if (params.rawPrecoMax) {
    parts.push(`até ${formatPrice(params.rawPrecoMax)}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "";
}

// ---------------------------------------------------------------------------
// Página — Server Component
// ---------------------------------------------------------------------------

export default async function ImoveisPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const {
    filters,
    rawCidade,
    rawBairro,
    rawTipo,
    rawQuartos,
    rawPrecoMin,
    rawPrecoMax,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    hasFilters,
  } = parseSearchParams(sp);
  const page = parsePage(sp);
  const skip = getSkip(page);

  // Busca em paralelo: imóveis filtrados + contagem + opções de filtro
  const [properties, count, cities, neighborhoods, propertyTypes] = await Promise.all([
    getFilteredProperties(filters, RESULTS_LIMIT, skip),
    countFilteredProperties(filters),
    getAvailableCities(),
    getAvailableNeighborhoods(),
    getAvailablePropertyTypes(),
  ]);

  const totalPages = calculateTotalPages(count);

  const paginationParams: Record<string, string> = {};
  if (rawCidade) paginationParams.cidade = rawCidade;
  if (rawBairro) paginationParams.bairro = rawBairro;
  if (rawTipo) paginationParams.tipo = rawTipo;
  if (rawQuartos) paginationParams.quartos = rawQuartos;
  if (rawPrecoMin) paginationParams.precoMin = rawPrecoMin;
  if (rawPrecoMax) paginationParams.precoMax = rawPrecoMax;
  if (rawDestaque) paginationParams.destaque = "1";
  if (rawLancamento) paginationParams.lancamento = "1";
  if (rawOportunidade) paginationParams.oportunidade = "1";

  const baseFilterParams = new URLSearchParams();
  if (rawCidade) baseFilterParams.set("cidade", rawCidade);
  if (rawBairro) baseFilterParams.set("bairro", rawBairro);
  if (rawTipo) baseFilterParams.set("tipo", rawTipo);
  if (rawQuartos) baseFilterParams.set("quartos", rawQuartos);
  if (rawPrecoMin) baseFilterParams.set("precoMin", rawPrecoMin);
  if (rawPrecoMax) baseFilterParams.set("precoMax", rawPrecoMax);
  if (rawOportunidade) baseFilterParams.set("oportunidade", "1");
  if (rawLancamento) baseFilterParams.set("lancamento", "1");
  if (rawDestaque) baseFilterParams.set("destaque", "1");

  function buildBadgeFilterUrl(badge: "oportunidade" | "lancamento" | "destaque", active: boolean): string {
    const params = new URLSearchParams(baseFilterParams);
    if (active) params.delete(badge);
    else params.set(badge, "1");
    const qs = params.toString();
    return qs ? `/imoveis?${qs}` : "/imoveis";
  }

  const clearBadgesParams = new URLSearchParams();
  if (rawCidade) clearBadgesParams.set("cidade", rawCidade);
  if (rawBairro) clearBadgesParams.set("bairro", rawBairro);
  if (rawTipo) clearBadgesParams.set("tipo", rawTipo);
  if (rawQuartos) clearBadgesParams.set("quartos", rawQuartos);
  if (rawPrecoMin) clearBadgesParams.set("precoMin", rawPrecoMin);
  if (rawPrecoMax) clearBadgesParams.set("precoMax", rawPrecoMax);
  const clearBadgesUrl = clearBadgesParams.toString() ? `/imoveis?${clearBadgesParams.toString()}` : "/imoveis";

  const filterSummary = buildFilterSummary({
    rawCidade,
    rawBairro,
    rawTipo,
    rawQuartos,
    rawPrecoMin,
    rawPrecoMax,
    rawDestaque,
    rawLancamento,
    rawOportunidade,
    cities,
  });

  const rendaPreset = getRendaPreset(rawPrecoMin, rawPrecoMax);

  // JSON-LD apenas para a página limpa (sem filtros)
  const collectionPageJsonLd = !hasFilters
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: buildImoveisPageTitle(),
        url: buildCanonicalUrl("/imoveis"),
        description: buildImoveisPageDescription(count),
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: BASE_URL,
        },
      }
    : null;

  return (
    <>
      <Header />

      {collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500"
        >
          <Link href="/" className="py-2 transition-colors hover:text-green-700 -my-2">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">Imóveis</span>
        </nav>

        {/* Cabeçalho */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {rendaPreset ? (
              <>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
                  Com a renda de {rendaPreset} você pode comprar todos esses imóveis aqui abaixo.
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  {count === 0
                    ? "Nenhum imóvel encontrado para este perfil de renda."
                    : `${count} imóve${count !== 1 ? "is" : "l"} encontrado${count !== 1 ? "s" : ""}. Fale conosco agora e saiba como.`}
                </p>
                <Link
                  href="/contato"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Fale conosco
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
                  {hasFilters && filterSummary ? filterSummary : "Todos os imóveis"}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {count === 0
                    ? "Nenhum imóvel encontrado para os filtros aplicados."
                    : `${count} imóve${count !== 1 ? "is" : "l"} encontrado${count !== 1 ? "s" : ""}`}
                </p>
              </>
            )}
          </div>

          {/* Link para limpar filtros */}
          {hasFilters && (
            <Link
              href="/imoveis"
              className="flex min-h-[44px] shrink-0 items-center text-sm font-medium text-green-700 underline-offset-2 hover:underline"
            >
              Limpar filtros
            </Link>
          )}
        </div>

        {/* Filtros rápidos — sempre visíveis */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={buildBadgeFilterUrl("oportunidade", rawOportunidade)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
              rawOportunidade
                ? "bg-red-600 text-white shadow-sm"
                : "bg-red-50 text-red-800 hover:bg-red-100"
            }`}
          >
            Oportunidades
          </Link>
          <Link
            href={buildBadgeFilterUrl("lancamento", rawLancamento)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
              rawLancamento
                ? "bg-green-600 text-white shadow-sm"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            Lançamentos
          </Link>
          <Link
            href={buildBadgeFilterUrl("destaque", rawDestaque)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
              rawDestaque
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Destaques
          </Link>
          {(rawOportunidade || rawLancamento || rawDestaque) && (
            <Link
              href={clearBadgesUrl}
              className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-300 px-4 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 sm:py-2"
            >
              Limpar badges
            </Link>
          )}
        </div>

        {/* ----------------------------------------------------------------
            Painel de filtros — formulário GET puro, sem client JS.
            Mobile: colapsável via <details>/<summary> (HTML nativo).
            Desktop: sempre visível.
        ---------------------------------------------------------------- */}
        <details
          className="mt-6 rounded-xl border border-zinc-200 bg-white"
          open={hasFilters}
        >
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
            <span>Filtrar imóveis</span>
            <svg
              className="h-4 w-4 shrink-0 text-zinc-400 transition-transform details-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <form
            method="GET"
            action="/imoveis"
            className="space-y-4 border-t border-zinc-100 px-5 pb-5 pt-4"
          >
            {/* Botões rápidos — Oportunidades, Lançamento, Destaque */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="mr-1 text-xs font-semibold text-zinc-500">
                Buscar:
              </span>
              <Link
                href={buildBadgeFilterUrl("oportunidade", rawOportunidade)}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
                  rawOportunidade
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-red-50 text-red-800 hover:bg-red-100"
                }`}
              >
                Oportunidades
              </Link>
              <Link
                href={buildBadgeFilterUrl("lancamento", rawLancamento)}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
                  rawLancamento
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-green-50 text-green-800 hover:bg-green-100"
                }`}
              >
                Lançamentos
              </Link>
              <Link
                href={buildBadgeFilterUrl("destaque", rawDestaque)}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:py-2 ${
                  rawDestaque
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Destaques
              </Link>
              {(rawOportunidade || rawLancamento || rawDestaque) && (
                <Link
                  href={clearBadgesUrl}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-300 px-4 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 sm:py-2"
                >
                  Limpar badges
                </Link>
              )}
            </div>

            {/* Checkboxes para combinar com outros filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500">
                Ou marque para combinar:
              </span>
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
            {/* Cidade */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-cidade" className="text-xs font-semibold text-zinc-500">
                Cidade
              </label>
              <select
                id="filter-cidade"
                name="cidade"
                defaultValue={rawCidade}
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

            {/* Bairro */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-bairro" className="text-xs font-semibold text-zinc-500">
                Bairro
              </label>
              <select
                id="filter-bairro"
                name="bairro"
                defaultValue={rawBairro}
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

            {/* Tipo de imóvel */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-tipo" className="text-xs font-semibold text-zinc-500">
                Tipo
              </label>
              <select
                id="filter-tipo"
                name="tipo"
                defaultValue={rawTipo}
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

            {/* Quartos */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-quartos" className="text-xs font-semibold text-zinc-500">
                Quartos
              </label>
              <select
                id="filter-quartos"
                name="quartos"
                defaultValue={rawQuartos}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              >
                <option value="">Qualquer</option>
                <option value="1">1 quarto</option>
                <option value="2">2 quartos</option>
                <option value="3">3 quartos</option>
                <option value="4">4+ quartos</option>
              </select>
            </div>

            {/* Preço mínimo */}
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
                defaultValue={rawPrecoMin}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            {/* Preço máximo */}
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
                defaultValue={rawPrecoMax}
                className="min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            {/* Botão de aplicar — span completo no mobile */}
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

        {/* ----------------------------------------------------------------
            Resultados
        ---------------------------------------------------------------- */}
        {count === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="text-base font-medium text-zinc-700">
              Nenhum imóvel encontrado com os filtros aplicados.
            </p>
            <p className="text-sm text-zinc-500">
              Tente ampliar os critérios de busca ou{" "}
              <Link
                href="/imoveis"
                className="font-medium text-green-700 underline-offset-2 hover:underline"
              >
                veja todos os imóveis
              </Link>
              .
            </p>
            <Link
              href="/contato"
              className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <li key={property.id}>
                  <PropertyCard property={property} />
                </li>
              ))}
            </ul>

            {/* Paginação */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/imoveis"
              queryParams={Object.keys(paginationParams).length > 0 ? paginationParams : undefined}
            />
          </>
        )}

        {/* ----------------------------------------------------------------
            Links para páginas programáticas — silo de SEO
            Fortalece a descoberta das páginas canônicas de cidade e tipo.
        ---------------------------------------------------------------- */}
        {!hasFilters && (
          <nav
            aria-label="Explorar por cidade e tipo"
            className="mt-16 grid gap-8 border-t border-zinc-100 pt-12 sm:grid-cols-2"
          >
            {/* Cidades disponíveis */}
            {cities.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Por cidade
                </p>
                <ul className="flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <li key={c.citySlug}>
                      <Link
                        href={`/cidade/${c.citySlug}`}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-green-600 hover:text-green-700"
                      >
                        {c.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tipos disponíveis */}
            {propertyTypes.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Por tipo
                </p>
                <ul className="flex flex-wrap gap-2">
                  {propertyTypes.map((t) => (
                    <li key={t.propertyTypeSlug}>
                      <Link
                        href={`/tipo/${t.propertyTypeSlug}`}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-green-600 hover:text-green-700"
                      >
                        {PROPERTY_TYPE_LABELS[t.propertyTypeSlug] ?? t.propertyTypeSlug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        )}
      </main>

      <Footer />
    </>
  );
}
