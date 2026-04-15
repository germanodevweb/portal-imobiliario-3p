import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { PropertyList } from "@/app/components/PropertyList";
import { ImoveisFilterPanel } from "@/app/components/ImoveisFilterPanel";
import { Pagination } from "@/app/components/Pagination";
import { parsePropertyListSearchParams } from "@/lib/imoveis/search-params";
import {
  getAltoPadraoProperties,
  countAltoPadraoProperties,
  getAvailableCities,
  getAvailableNeighborhoods,
  getAvailablePropertyTypes,
} from "@/lib/queries/properties";
import {
  buildAltoPadraoPageTitle,
  buildAltoPadraoPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  buildImoveisFilteredTitle,
  getPropertyTypeLabel,
  SITE_NAME,
} from "@/lib/seo";
import {
  buildPageTitle,
  buildPaginatedCanonical,
  calculateTotalPages,
  getSkip,
  ITEMS_PER_PAGE,
  parsePage,
} from "@/lib/pagination";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp);
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
  } = parsePropertyListSearchParams(sp);

  const basePath = "/imoveis/alto-padrao";
  const baseCanonical = buildCanonicalUrl(basePath);

  if (!hasFilters) {
    const count = await countAltoPadraoProperties(filters);
    const title = buildPageTitle(buildAltoPadraoPageTitle(), page);
    const description = buildAltoPadraoPageDescription(count);
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

  const city = rawCidade
    ? (await getAvailableCities()).find((c) => c.citySlug === rawCidade)?.city
    : undefined;

  const filteredCore = buildImoveisFilteredTitle({
    typeName: rawTipo ? getPropertyTypeLabel(rawTipo) : undefined,
    city,
    bedrooms: rawQuartos ? parseInt(rawQuartos, 10) : undefined,
  });
  const title = buildPageTitle(`Alto padrão · ${filteredCore}`, page);
  const description = `Resultados filtrados em imóveis de alto padrão na 3Pinheiros. ${SITE_NAME}.`;

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

export default async function AltoPadraoPage({ searchParams }: PageProps) {
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
  } = parsePropertyListSearchParams(sp);
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [properties, count, cities, neighborhoods, propertyTypes] = await Promise.all([
    getAltoPadraoProperties(ITEMS_PER_PAGE, skip, filters),
    countAltoPadraoProperties(filters),
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

  return (
    <>
      <Header />

      <main>
        {/* Hero — fundo verde escuro (sem vídeo) */}
        <section className="relative min-h-[200px] w-full overflow-hidden bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 py-8 sm:py-12">
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Imóveis de Alto Padrão
            </h1>
            <p className="mt-3 text-lg text-zinc-300 sm:text-xl">
              Seleção exclusiva para quem busca localização nobre, sofisticação e
              imóveis de alto valor.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contato"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Falar com especialista
              </Link>
              <a
                href="#imoveis"
                className="inline-flex items-center rounded-full border-2 border-white/50 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Ver imóveis
              </a>
            </div>
          </div>
        </section>

        {/* Listagem */}
        <section
          id="imoveis"
          className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-10 lg:pb-20"
        >
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-sm text-zinc-500 sm:mb-5"
          >
            <Link href="/" className="transition-colors hover:text-green-700">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/imoveis" className="transition-colors hover:text-green-700">
              Imóveis
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-zinc-800">
              Imóveis de Alto Padrão
            </span>
          </nav>

          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5 sm:gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {count === 0 && !hasFilters
                  ? "Nenhum imóvel encontrado neste momento"
                  : count === 0
                    ? "Nenhum imóvel de alto padrão para os filtros aplicados"
                    : `${count} ${count !== 1 ? "Imóveis" : "Imóvel"} de Alto Padrão`}
              </h2>
              <p className="mt-1.5 text-zinc-600 sm:mt-2">
                {(count > 0 || hasFilters) &&
                  "Imóveis a partir de R$ 1.500.000,00. Use os filtros para refinar sua pesquisa."}
              </p>
            </div>
            {hasFilters && (
              <Link
                href="/imoveis/alto-padrao"
                className="flex min-h-[44px] shrink-0 items-center text-sm font-medium text-green-700 underline-offset-2 hover:underline"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <div className="mb-10 sm:mb-12 lg:mb-14">
            <ImoveisFilterPanel
              density="compact"
              listPath="/imoveis/alto-padrao"
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
          </div>

          {count > 0 ? (
            <>
              <PropertyList properties={properties} />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/imoveis/alto-padrao"
                queryParams={Object.keys(paginationParams).length > 0 ? paginationParams : undefined}
              />
            </>
          ) : hasFilters ? (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 py-12 text-center sm:mt-8">
              <p className="text-zinc-700">
                Nenhum imóvel de alto padrão corresponde a estes filtros.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Tente ampliar os critérios ou{" "}
                <Link
                  href="/imoveis/alto-padrao"
                  className="font-medium text-green-700 underline-offset-2 hover:underline"
                >
                  limpar os filtros
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <p className="text-zinc-600">
                Não há imóveis de alto padrão disponíveis no momento.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Entre em contato para ser avisado quando surgirem novas oportunidades.
              </p>
              <Link
                href="/contato"
                className="mt-6 inline-flex items-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
              >
                Falar com especialista
              </Link>
            </div>
          )}
        </section>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
