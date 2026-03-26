import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import { BlogSection } from "@/app/components/BlogSection";
import {
  getCityContext,
  getPublishedPropertiesByStateAndCity,
  countPublishedPropertiesByStateAndCity,
  getRelatedNeighborhoodsByCitySlug,
  getPriceRangeByCitySlug,
  getCitiesByStateSlug,
  getAvailableStateCityPairs,
} from "@/lib/queries/properties";
import { getPostsByTag, getRecentPosts } from "@/lib/queries/blog";
import {
  buildStateCityPageTitle,
  buildStateCityPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  formatPriceShort,
} from "@/lib/seo";
import { evaluateIndexation, buildRobotsDirective } from "@/lib/indexation";
import { Pagination } from "@/app/components/Pagination";
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
  params: Promise<{ stateSlug: string; citySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PROPERTIES_LIMIT = ITEMS_PER_PAGE;

// ---------------------------------------------------------------------------
// generateStaticParams — pré-gera todas as combinações estado+cidade no build
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const pairs = await getAvailableStateCityPairs();
  return pairs.map((p) => ({ stateSlug: p.stateSlug, citySlug: p.citySlug }));
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count, neighborhoods] = await Promise.all([
    getCityContext(citySlug),
    countPublishedPropertiesByStateAndCity(stateSlug, citySlug),
    getRelatedNeighborhoodsByCitySlug(citySlug),
  ]);

  // Valida hierarquia: a cidade deve pertencer ao estado informado na URL
  if (!context || context.stateSlug !== stateSlug) {
    return { title: "Cidade não encontrada" };
  }

  const evaluation = evaluateIndexation({ pageType: "stateCity", publishedCount: count });
  const baseTitle = buildStateCityPageTitle(context.city, context.state);
  const title = buildPageTitle(baseTitle, page);
  const description = buildStateCityPageDescription(
    context.city,
    context.state,
    count,
    neighborhoods.filter((n) => n.neighborhoodSlug !== null).length
  );
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/estado/${stateSlug}/cidade/${citySlug}`),
    page
  );

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({ title, description, url: canonical }),
    twitter: buildTwitterCard({ title, description }),
    robots: buildRobotsDirective(evaluation),
  };
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default async function EstadoCidadePage({ params, searchParams }: PageProps) {
  const { stateSlug, citySlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [context, count, neighborhoods, properties, priceRange, otherCities] =
    await Promise.all([
      getCityContext(citySlug),
      countPublishedPropertiesByStateAndCity(stateSlug, citySlug),
      getRelatedNeighborhoodsByCitySlug(citySlug),
      getPublishedPropertiesByStateAndCity(stateSlug, citySlug, PROPERTIES_LIMIT, skip),
      getPriceRangeByCitySlug(citySlug),
      getCitiesByStateSlug(stateSlug),
    ]);

  // Valida que a cidade pertence ao estado — impede URLs manipuladas
  const evaluation = evaluateIndexation({ pageType: "stateCity", publishedCount: count });
  if (!context || context.stateSlug !== stateSlug || !evaluation.shouldExist) notFound();

  const { city, state } = context;
  const totalPages = calculateTotalPages(count);
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/estado/${stateSlug}/cidade/${citySlug}`),
    page
  );
  const stateCanonical = buildCanonicalUrl(`/estado/${stateSlug}`);

  const validNeighborhoods = neighborhoods.filter(
    (n): n is { neighborhood: string; neighborhoodSlug: string } =>
      n.neighborhoodSlug !== null && n.neighborhood !== null
  );

  const otherCitiesInState = otherCities.filter((c) => c.citySlug !== citySlug);

  // Busca posts do blog — tag de cidade com fallback para posts recentes
  let blogPosts = await getPostsByTag(`cidade:${citySlug}`, 2);
  if (blogPosts.length === 0) {
    blogPosts = await getRecentPosts(2);
  }

  // JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: buildCanonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: state, item: stateCanonical },
      { "@type": "ListItem", position: 3, name: city, item: canonical },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city} em ${state}: Imóveis à Venda`,
    description: buildStateCityPageDescription(city, state, count, validNeighborhoods.length),
    url: canonical,
    isPartOf: { "@type": "WebPage", url: stateCanonical },
    numberOfItems: count,
  };

  const itemListJsonLd =
    properties.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Imóveis em ${city}, ${state}`,
          numberOfItems: properties.length,
          itemListElement: properties.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: buildCanonicalUrl(`/imoveis/${p.slug}`),
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-green-700 transition-colors">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/estado/${stateSlug}`}
                className="hover:text-green-700 transition-colors"
              >
                {state}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-zinc-800">
              {city}
            </li>
          </ol>
        </nav>

        {/* H1 — framing regional, distinto de /cidade/[slug] */}
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Imóveis em {city}, estado de {state}
        </h1>

        <p className="mt-2 text-sm font-medium text-green-700">
          {count} {count !== 1 ? "imóveis disponíveis" : "imóvel disponível"}
          {validNeighborhoods.length > 0 && (
            <> em {validNeighborhoods.length} {validNeighborhoods.length !== 1 ? "bairros" : "bairro"}</>
          )}
        </p>

        {/* Stats block */}
        <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Imóveis publicados
            </dt>
            <dd className="mt-1 text-xl font-bold text-zinc-900">{count}</dd>
          </div>

          {validNeighborhoods.length > 0 && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Bairros cobertos
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-900">
                {validNeighborhoods.length}
              </dd>
            </div>
          )}

          {priceRange && (
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Faixa de preço
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-900">
                {formatPriceShort(priceRange.minPrice)} –{" "}
                {formatPriceShort(priceRange.maxPrice)}
              </dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório com dados reais */}
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-700">
          {city} é um dos principais mercados imobiliários do estado de{" "}
          <strong className="font-semibold text-zinc-900">{state}</strong>, com {count}{" "}
          {count !== 1 ? "imóveis publicados" : "imóvel publicado"}
          {validNeighborhoods.length > 0
            ? ` distribuídos em ${validNeighborhoods.length} ${validNeighborhoods.length !== 1 ? "bairros" : "bairro"}`
            : ""}
          {priceRange
            ? `. Os preços variam de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}`
            : ""}
          . A 3Pinheiros (CRECI 1317J) oferece consultoria especializada para compra,
          venda e avaliação de imóveis residenciais e comerciais em {city} e região.
        </p>

        {/* Outros cidades do estado — navegação horizontal (diferenciador principal) */}
        {otherCitiesInState.length > 0 && (
          <section className="mt-10" aria-labelledby="outras-cidades-heading">
            <h2
              id="outras-cidades-heading"
              className="mb-4 text-lg font-semibold text-zinc-900"
            >
              Outras cidades em {state}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {otherCitiesInState.map((c) => (
                <li key={c.citySlug}>
                  <Link
                    href={`/estado/${stateSlug}/cidade/${c.citySlug}`}
                    className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:border-green-600 hover:text-green-700"
                  >
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bairros disponíveis em citySlug */}
        {validNeighborhoods.length > 0 && (
          <section className="mt-10" aria-labelledby="bairros-heading">
            <h2
              id="bairros-heading"
              className="mb-4 text-lg font-semibold text-zinc-900"
            >
              Bairros de {city} com imóveis disponíveis
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {validNeighborhoods.map((n) => (
                <li key={n.neighborhoodSlug}>
                  <Link
                    href={`/cidade/${citySlug}/bairro/${n.neighborhoodSlug}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition-all hover:border-green-600 hover:text-green-700 hover:shadow-sm"
                  >
                    {n.neighborhood}
                    <span aria-hidden="true" className="ml-2 text-zinc-400">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Vitrine de imóveis */}
        <section className="mt-12" aria-labelledby="imoveis-heading">
          <h2
            id="imoveis-heading"
            className="mb-6 text-lg font-semibold text-zinc-900"
          >
            Imóveis disponíveis em {city}
          </h2>
          <PropertyList properties={properties} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/estado/${stateSlug}/cidade/${citySlug}`}
          />
        </section>

        {/* Bloco semântico — contexto e links internos */}
        <section className="mt-12 rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
          <h2 className="mb-3 text-base font-semibold text-zinc-900">
            Sobre o mercado imobiliário de {city} no estado de {state}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            {city} integra o mercado imobiliário de{" "}
            {state}
            {otherCitiesInState.length > 0
              ? `, ao lado de cidades como ${otherCitiesInState
                  .slice(0, 2)
                  .map((c) => c.city)
                  .join(" e ")}.`
              : "."}{" "}
            A 3Pinheiros atua em toda a região com foco em segurança jurídica,
            avaliação técnica e negociação eficiente.
          </p>

          {/* Links internos de silo */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/estado/${stateSlug}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-green-600 hover:text-green-700"
            >
              ← Todos os imóveis em {state}
            </Link>
            <Link
              href={`/cidade/${citySlug}`}
              className="rounded-full border border-green-700 bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
            >
              Ver página completa de {city}
            </Link>
          </div>
        </section>

        {/* Blog relacionado */}
        <BlogSection posts={blogPosts} />
      </main>

      <Footer />
    </>
  );
}
