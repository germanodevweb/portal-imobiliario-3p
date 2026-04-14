import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { PropertyCard } from "@/app/components/PropertyCard";
import { ImoveisFilterPanel } from "@/app/components/ImoveisFilterPanel";
import { Pagination } from "@/app/components/Pagination";
import { parsePropertyListSearchParams as parseSearchParams } from "@/lib/imoveis/search-params";
import { buildWhatsAppChatHref } from "@/lib/constants/contato";
import {
  getFilteredProperties,
  countFilteredProperties,
  getAvailableCities,
  getAvailableNeighborhoods,
  getAvailablePropertyTypes,
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

/** Mensagem do CTA “Simule sua Prestação” (PGMV / faixa de renda) — WhatsApp via `NEXT_PUBLIC_WHATSAPP_PHONE`. */
const WHATSAPP_SIMULE_PRESTACAO_MESSAGE =
  "Olá! Quero simular a prestação de um imóvel dentro da minha renda.";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const RESULTS_LIMIT = ITEMS_PER_PAGE;

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
    rawRenda,
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
  if (rawRenda) filterParams.renda = rawRenda;
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

/** Labels exibidos em “Com a renda até de …” — alinhados a `INCOME_FILTER_LINKS` + `renda` na URL. */
const RENDA_LABEL_BY_KEY: Record<string, string> = {
  "3200": "R$ 3.200",
  "5000": "R$ 5.000",
  "9600": "R$ 9.600",
  "13000": "R$ 13.000",
};

function rendaKeyMatchesPrices(
  key: string,
  precoMin: string,
  precoMax: string
): boolean {
  if (key === "3200") return !precoMin && precoMax === "275000";
  if (key === "5000") return !precoMin && precoMax === "275000";
  if (key === "9600") return !precoMin && precoMax === "400000";
  if (key === "13000") return !precoMin && precoMax === "600000";
  return false;
}

/** URLs antigas (sem `renda`) — compatibilidade com favoritos. */
const RENDA_LEGACY_PRESETS: { rendaLabel: string; precoMax?: string; precoMin?: string }[] = [
  { rendaLabel: "R$ 2.850", precoMax: "190000" },
  { rendaLabel: "R$ 4.700", precoMax: "264000" },
  { rendaLabel: "R$ 8.000", precoMax: "350000" },
  { rendaLabel: "R$ 12.000", precoMax: "450000" },
  { rendaLabel: "R$ 12.000 ou mais", precoMin: "450000" },
];

function getRendaPreset(precoMin: string, precoMax: string, rendaKey: string): string | null {
  if (rendaKey && RENDA_LABEL_BY_KEY[rendaKey] && rendaKeyMatchesPrices(rendaKey, precoMin, precoMax)) {
    return RENDA_LABEL_BY_KEY[rendaKey];
  }
  const legacy = RENDA_LEGACY_PRESETS.find((p) => {
    if (p.precoMax) return p.precoMax === precoMax && !precoMin;
    if (p.precoMin) return p.precoMin === precoMin && !precoMax;
    return false;
  });
  return legacy?.rendaLabel ?? null;
}

/** Valor da renda no título (pt-BR com centavos), ex.: R$ 5.000,00 ou R$ 13.000,00 ou mais. */
function formatRendaValorParaTitulo(rendaLabel: string): string {
  const ouMais = /^R\$\s*([\d.]+)\s+ou\s+mais$/i.exec(rendaLabel.trim());
  if (ouMais) {
    const n = Number(ouMais[1].replace(/\./g, ""));
    if (!Number.isFinite(n)) return rendaLabel;
    const fmt = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
    return `${fmt} ou mais`;
  }
  const simple = /^R\$\s*([\d.]+)$/.exec(rendaLabel.trim());
  if (simple) {
    const n = Number(simple[1].replace(/\./g, ""));
    if (!Number.isFinite(n)) return rendaLabel;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }
  return rendaLabel;
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
    rawRenda,
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
  if (rawRenda) paginationParams.renda = rawRenda;
  if (rawDestaque) paginationParams.destaque = "1";
  if (rawLancamento) paginationParams.lancamento = "1";
  if (rawOportunidade) paginationParams.oportunidade = "1";

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

  const rendaPreset = getRendaPreset(rawPrecoMin, rawPrecoMax, rawRenda);

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
                <h1 className="max-w-4xl text-lg font-bold leading-snug tracking-tight text-zinc-900 sm:text-xl lg:text-2xl">
                  Com a renda até de {formatRendaValorParaTitulo(rendaPreset)} você pode comprar todos esses
                  imóveis aqui abaixo, pelo{" "}
                  <span className="inline-flex max-w-full flex-wrap items-center gap-2 align-middle sm:gap-3">
                    <Image
                      src="/images/minha-casa-minha-vida-logo-1.png"
                      alt="Minha Casa Minha Vida"
                      width={60}
                      height={40}
                      className="h-6 w-auto max-w-[min(72px,40vw)] object-contain sm:h-9 sm:max-w-[90px]"
                      sizes="(max-width: 640px) 64px, 90px"
                    />
                    <span className="shrink-0 self-center font-bold">da</span>
                    <Image
                      src="/images/caixa-economica-federal-logo-png-0.png"
                      alt="Caixa Econômica Federal"
                      width={90}
                      height={28}
                      className="h-5 w-auto max-w-[min(90px,42vw)] object-contain sm:h-7 sm:max-w-[90px]"
                      sizes="(max-width: 640px) 80px, 90px"
                    />
                  </span>
                  .
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  {count === 0
                    ? "Nenhum imóvel encontrado para este perfil de renda."
                    : `${count} imóve${count !== 1 ? "is" : "l"} encontrado${count !== 1 ? "s" : ""}. Simule sua prestação com nossa equipe pelo botão abaixo.`}
                </p>
                <Link
                  href={buildWhatsAppChatHref(WHATSAPP_SIMULE_PRESTACAO_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Simular prestação do imóvel"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Simule sua Prestação
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

        <ImoveisFilterPanel
          listPath="/imoveis"
          rawCidade={rawCidade}
          rawBairro={rawBairro}
          rawTipo={rawTipo}
          rawQuartos={rawQuartos}
          rawPrecoMin={rawPrecoMin}
          rawPrecoMax={rawPrecoMax}
          rawRenda={rawRenda}
          rawDestaque={rawDestaque}
          rawLancamento={rawLancamento}
          rawOportunidade={rawOportunidade}
          cities={cities}
          neighborhoods={neighborhoods}
          propertyTypes={propertyTypes}
        />

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
              href={
                rendaPreset
                  ? buildWhatsAppChatHref(WHATSAPP_SIMULE_PRESTACAO_MESSAGE)
                  : "/contato"
              }
              target={rendaPreset ? "_blank" : undefined}
              rel={rendaPreset ? "noopener noreferrer" : undefined}
              aria-label={rendaPreset ? "Simular prestação do imóvel" : undefined}
              className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              {rendaPreset ? "Simule sua Prestação" : "Falar com um consultor"}
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

      <WhatsAppButton />
      <Footer />
    </>
  );
}
