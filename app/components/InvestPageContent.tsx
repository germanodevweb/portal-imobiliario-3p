import Image from "next/image";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { InvestmentLanguageSelector } from "@/app/components/InvestmentLanguageSelector";
import { InvestmentPropertyCard } from "@/app/components/InvestmentPropertyCard";
import { NARAuthoritySection } from "@/app/components/NARAuthoritySection";
import { ImoveisFilterPanel } from "@/app/components/ImoveisFilterPanel";
import { Pagination } from "@/app/components/Pagination";
import {
  getInternationalInvestmentProperties,
  countInternationalInvestmentProperties,
  getAvailableCities,
  getAvailablePropertyTypes,
} from "@/lib/queries/properties";
import {
  applyLocationFilterSanitization,
  getInvestmentFilterNeighborhoods,
} from "@/lib/imoveis/filter-location-queries.server";
import { getEurToBrlRate } from "@/lib/services/exchange-rate";
import type { InvestContent } from "@/lib/i18n/invest";
import { parsePropertyListSearchParams } from "@/lib/imoveis/search-params";
import { calculateTotalPages, getSkip, ITEMS_PER_PAGE } from "@/lib/pagination";

type InvestPageContentProps = {
  content: InvestContent;
  page: number;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function InvestPageContent({
  content,
  page,
  basePath,
  searchParams,
}: InvestPageContentProps) {
  const skip = getSkip(page);
  const parsed = parsePropertyListSearchParams(searchParams);
  const [neighborhoods, eurToBrlRate, cities, propertyTypes] = await Promise.all([
    getInvestmentFilterNeighborhoods(),
    getEurToBrlRate(),
    getAvailableCities(),
    getAvailablePropertyTypes(),
  ]);

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
  } = applyLocationFilterSanitization(parsed, neighborhoods);

  const [properties, count] = await Promise.all([
    getInternationalInvestmentProperties(ITEMS_PER_PAGE, skip, filters),
    countInternationalInvestmentProperties(filters),
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
        {/* Barra de idioma */}
        <div className="border-b border-zinc-100 bg-white py-2.5 shadow-sm sm:py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <nav aria-label="Atalho para página inicial">
              <Link
                href="/"
                className="inline-flex items-center whitespace-nowrap text-sm font-semibold text-green-700 transition-colors hover:text-green-800"
              >
                <span className="sm:hidden">Início</span>
                <span className="hidden sm:inline">← Página Inicial</span>
              </Link>
            </nav>
            <InvestmentLanguageSelector />
          </div>
        </div>

        {/* Hero — compacto, sofisticado, fundo verde escuro (igual destaque dos cards) */}
        <section className="relative overflow-hidden bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            {/* Conteúdo — esquerda */}
            <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {content.hero.title}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                {content.nar.associationLine}
              </p>
              {content.hero.subtitle && (
                <p className="mt-1 text-base text-zinc-300 sm:text-lg">
                  {content.hero.subtitle}
                </p>
              )}
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                {content.nar.ethicalText}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href={content.hero.ctaPrimaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  {content.hero.ctaPrimary}
                </a>
                <a
                  href="#imoveis"
                  className="inline-flex items-center rounded-full border border-zinc-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  {content.hero.ctaSecondary}
                </a>
              </div>
              <p className="mt-3 text-sm font-medium text-white/90 sm:mt-3.5">
                {content.nar.trustMessage}
              </p>
            </div>

            {/* Logo NAR — direita */}
            <NARAuthoritySection />
          </div>
        </section>

        {/* Listagem de imóveis */}
        <section
          id="imoveis"
          className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6 sm:pt-7 sm:pb-16 lg:px-8 lg:pt-8 lg:pb-20"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5 sm:gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {content.listing.title}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500 sm:mt-2">
                {content.listing.priceDisclaimer}
              </p>
            </div>
            {hasFilters && (
              <Link
                href={basePath}
                className="flex min-h-[44px] shrink-0 items-center text-sm font-medium text-green-700 underline-offset-2 hover:underline"
              >
                {content.listing.clearFiltersLabel}
              </Link>
            )}
          </div>

          <div className="mb-14 mt-2 sm:mb-16 sm:mt-3 lg:mb-20">
            <ImoveisFilterPanel
              density="compact"
              listPath={basePath}
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

          {count === 0 ? (
            hasFilters ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-12 text-center">
                <p className="text-zinc-600">{content.listing.empty}</p>
                <Link
                  href={basePath}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-green-700 underline-offset-2 hover:underline"
                >
                  {content.listing.clearFiltersLabel}
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
                <p className="text-zinc-600">{content.listing.empty}</p>
                <p className="mt-2 text-sm text-zinc-500">
                  {content.listing.emptyHint}
                </p>
                <a
                  href={content.hero.ctaPrimaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  {content.hero.ctaPrimary}
                </a>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <InvestmentPropertyCard
                    key={property.id}
                    property={property}
                    eurToBrlRate={eurToBrlRate}
                  />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={basePath}
                queryParams={
                  Object.keys(paginationParams).length > 0 ? paginationParams : undefined
                }
              />
            </>
          )}
        </section>

        {/* Credibilidade — largura total, fundo verde; tipografia destacada + hover */}
        <section className="w-full border-t border-emerald-950/30 bg-linear-to-b from-emerald-950 via-green-800 to-emerald-900 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="group mx-auto max-w-4xl cursor-default rounded-2xl px-3 py-2 text-center transition-colors duration-500 sm:px-6 sm:py-3 group-hover:bg-white/6">
            <div className="mb-4 flex justify-center sm:mb-5">
              <div className="transition-transform duration-500 ease-out group-hover:scale-105">
                <Image
                  src="/images/nar-logo-white.png"
                  alt="National Association of REALTORS® (NAR)"
                  width={120}
                  height={96}
                  sizes="(max-width: 640px) 100px, 120px"
                  loading="lazy"
                  className="h-auto w-[100px] object-contain sm:w-[120px]"
                />
              </div>
            </div>
            {content.credibility.title?.trim() ? (
              <h2 className="text-lg font-semibold text-white">
                {content.credibility.title}
              </h2>
            ) : null}
            <p
              className={`mx-auto max-w-3xl text-pretty text-base font-medium leading-snug text-white/90 [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] transition-all duration-500 ease-out first-line:font-semibold first-line:text-white group-hover:scale-[1.02] group-hover:text-white group-hover:[text-shadow:0_4px_28px_rgba(0,0,0,0.45),0_0_40px_rgba(255,255,255,0.12)] sm:leading-relaxed md:text-lg lg:text-xl lg:leading-relaxed ${
                content.credibility.title?.trim() ? "mt-3" : ""
              }`}
            >
              {content.credibility.description}
            </p>
          </div>
        </section>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
