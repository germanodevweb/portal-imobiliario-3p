import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByBuyTypeCityAndNeighborhood,
  countPublishedPropertiesByBuyTypeCityAndNeighborhood,
  getBuyTypeCityNeighborhoodContext,
  getNeighborhoodsWithSaleByTypeAndCity,
  getPropertyTypesWithSaleByCityAndNeighborhood,
  getAvailableBuyTypeCityNeighborhoodTriples,
  getPriceRangeByBuyTypeCityAndNeighborhood,
} from "@/lib/queries/properties";
import { getPostsByTag } from "@/lib/queries/blog";
import { BlogSection } from "@/app/components/BlogSection";
import {
  buildBuyTypeCityNeighborhoodPageTitle,
  buildBuyTypeCityNeighborhoodPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
  formatPriceShort,
} from "@/lib/seo";
import {
  evaluateIndexation,
  buildRobotsDirective,
} from "@/lib/indexation";
import { Pagination } from "@/app/components/Pagination";
import {
  parsePage,
  calculateTotalPages,
  getSkip,
  buildPageTitle,
  buildPaginatedCanonical,
  ITEMS_PER_PAGE,
} from "@/lib/pagination";

const PROPERTIES_LIMIT = ITEMS_PER_PAGE;

type PageProps = {
  params: Promise<{ typeSlug: string; citySlug: string; neighborhoodSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// SSG: pré-gera todas as triplas tipo+cidade+bairro com imóveis à venda
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const triples = await getAvailableBuyTypeCityNeighborhoodTriples();
  return triples.map((t) => ({
    typeSlug: t.propertyTypeSlug,
    citySlug: t.citySlug,
    neighborhoodSlug: t.neighborhoodSlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata programática — intenção comercial (comprar tipo em bairro)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { typeSlug, citySlug, neighborhoodSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count] = await Promise.all([
    getBuyTypeCityNeighborhoodContext(typeSlug, citySlug, neighborhoodSlug),
    countPublishedPropertiesByBuyTypeCityAndNeighborhood(typeSlug, citySlug, neighborhoodSlug),
  ]);

  const evaluation = evaluateIndexation({
    pageType: "buyTypeCityNeighborhood",
    publishedCount: count,
  });

  if (!evaluation.shouldExist || !context) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  const typeName = getPropertyTypeLabel(typeSlug);
  const { neighborhood, city } = context;
  const baseTitle = buildBuyTypeCityNeighborhoodPageTitle(typeName, neighborhood, city);
  const title = buildPageTitle(baseTitle, page);
  const description = buildBuyTypeCityNeighborhoodPageDescription(
    typeName,
    neighborhood,
    city,
    count
  );
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/comprar/${typeSlug}/${citySlug}/${neighborhoodSlug}`),
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

export default async function ComprarTypeCityNeighborhoodPage({
  params,
  searchParams,
}: PageProps) {
  const { typeSlug, citySlug, neighborhoodSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [context, count] = await Promise.all([
    getBuyTypeCityNeighborhoodContext(typeSlug, citySlug, neighborhoodSlug),
    countPublishedPropertiesByBuyTypeCityAndNeighborhood(typeSlug, citySlug, neighborhoodSlug),
  ]);

  const evaluation = evaluateIndexation({
    pageType: "buyTypeCityNeighborhood",
    publishedCount: count,
  });
  if (!evaluation.shouldExist || !context) notFound();

  const typeName = getPropertyTypeLabel(typeSlug);
  const { neighborhood, city } = context;
  const totalPages = calculateTotalPages(count);

  const [
    properties,
    otherNeighborhoods,
    otherTypes,
    priceRange,
    blogPosts,
  ] = await Promise.all([
    getPublishedPropertiesByBuyTypeCityAndNeighborhood(
      typeSlug,
      citySlug,
      neighborhoodSlug,
      PROPERTIES_LIMIT,
      skip
    ),
    getNeighborhoodsWithSaleByTypeAndCity(typeSlug, citySlug),
    getPropertyTypesWithSaleByCityAndNeighborhood(citySlug, neighborhoodSlug),
    getPriceRangeByBuyTypeCityAndNeighborhood(typeSlug, citySlug, neighborhoodSlug),
    getPostsByTag(`bairro:${neighborhoodSlug}`).then((posts) =>
      posts.length > 0
        ? posts
        : getPostsByTag(`tipo:${typeSlug}`).then((p2) =>
            p2.length > 0 ? p2 : getPostsByTag(`cidade:${citySlug}`)
          )
    ),
  ]);

  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/comprar/${typeSlug}/${citySlug}/${neighborhoodSlug}`),
    page
  );
  const cityCanonical = buildCanonicalUrl(`/cidade/${citySlug}`);
  const neighborhoodCanonical = buildCanonicalUrl(`/bairro/${neighborhoodSlug}`);
  const typeCanonical = buildCanonicalUrl(`/tipo/${typeSlug}`);
  const parentComprarCanonical = buildCanonicalUrl(`/comprar/${typeSlug}/${citySlug}`);
  const description = buildBuyTypeCityNeighborhoodPageDescription(
    typeName,
    neighborhood,
    city,
    count
  );

  const relatedTypes = otherTypes.filter((t) => t.propertyTypeSlug !== typeSlug);
  const otherNeighborhoodsFiltered = otherNeighborhoods.filter(
    (n) =>
      n.neighborhoodSlug &&
      n.neighborhood &&
      n.neighborhoodSlug !== neighborhoodSlug
  );

  // -------------------------------------------------------------------------
  // JSON-LD
  // -------------------------------------------------------------------------

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: buildCanonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Imóveis", item: buildCanonicalUrl("/imoveis") },
      { "@type": "ListItem", position: 3, name: typeName, item: typeCanonical },
      { "@type": "ListItem", position: 4, name: city, item: parentComprarCanonical },
      {
        "@type": "ListItem",
        position: 5,
        name: neighborhood,
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Comprar ${typeName} no ${neighborhood}, ${city}`,
    description,
    url: canonical,
    numberOfItems: count,
    isPartOf: [
      { "@type": "WebPage", url: parentComprarCanonical },
      { "@type": "WebPage", url: neighborhoodCanonical },
      { "@type": "WebPage", url: typeCanonical },
    ],
    publisher: {
      "@type": "Organization",
      name: "3Pinheiros Consultoria Imobiliária",
      url: buildCanonicalUrl("/"),
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Comprar ${typeName} no ${neighborhood}`,
    numberOfItems: properties.length,
    itemListElement: properties.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: buildCanonicalUrl(`/imoveis/${p.slug}`),
      name: p.title,
    })),
  };

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb: Início > Imóveis > Tipo > Cidade > Bairro */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
        >
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/imoveis" className="transition-colors hover:text-green-700">
            Imóveis
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={typeCanonical} className="transition-colors hover:text-green-700">
            {typeName}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={parentComprarCanonical} className="transition-colors hover:text-green-700">
            {city}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{neighborhood}</span>
        </nav>

        {/* H1 semântico com intenção comercial */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Comprar {typeName.toLowerCase()} no {neighborhood}, {city}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {count} {count !== 1 ? "imóveis à venda" : "imóvel à venda"} neste bairro
        </p>

        {/* Links de contexto */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span>
            Bairro:{" "}
            <Link
              href={neighborhoodCanonical}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              {neighborhood}
            </Link>
          </span>
          <span>
            Cidade:{" "}
            <Link
              href={cityCanonical}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              {city}
            </Link>
          </span>
          <span>
            Tipo:{" "}
            <Link
              href={typeCanonical}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              {typeName}
            </Link>
          </span>
        </div>

        {/* Bloco de dados reais */}
        <dl className="mt-5 flex flex-wrap gap-6 sm:gap-10">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Imóveis à venda
            </dt>
            <dd className="mt-1 text-2xl font-bold text-zinc-900">{count}</dd>
          </div>
          {priceRange && (
            <>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  A partir de
                </dt>
                <dd className="mt-1 text-2xl font-bold text-green-700">
                  {formatPriceShort(priceRange.minPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Até
                </dt>
                <dd className="mt-1 text-2xl font-bold text-zinc-900">
                  {formatPriceShort(priceRange.maxPrice)}
                </dd>
              </div>
            </>
          )}
          {relatedTypes.length > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Outros tipos no bairro
              </dt>
              <dd className="mt-1 text-2xl font-bold text-zinc-900">{relatedTypes.length}</dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório contextual */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {priceRange
            ? `O ${neighborhood} possui ${count} ${count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")} à venda, com preços entre ${formatPriceShort(priceRange.minPrice)} e ${formatPriceShort(priceRange.maxPrice)}.`
            : `O ${neighborhood} possui ${count} ${count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")} à venda.`}
          {relatedTypes.length > 0
            ? ` Além ${count !== 1 ? `dos ${typeName.toLowerCase()}` : `do ${typeName.toLowerCase().replace(/s$/, "")}`}, o bairro também conta com outros ${relatedTypes.length} ${relatedTypes.length !== 1 ? "tipos" : "tipo"} de imóvel à venda.`
            : ""}
          {" "}A 3Pinheiros oferece consultoria especializada com atendimento completo,
          da busca ao contrato. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`${typeName} à venda no ${neighborhood}`}>
          <PropertyList properties={properties} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/comprar/${typeSlug}/${citySlug}/${neighborhoodSlug}`}
          />
        </section>

        {/* Outros bairros com o mesmo tipo à venda na cidade */}
        {otherNeighborhoodsFiltered.length > 0 && (
          <section
            className="mt-14"
            aria-label={`Outros bairros com ${typeName.toLowerCase()} à venda em ${city}`}
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              Comprar {typeName.toLowerCase()} em outros bairros de {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore opções em outros bairros da cidade.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherNeighborhoodsFiltered.map((n) => (
                <li key={n.neighborhoodSlug}>
                  <Link
                    href={`/comprar/${typeSlug}/${citySlug}/${n.neighborhoodSlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {n.neighborhood}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Outros tipos à venda no mesmo bairro */}
        {relatedTypes.length > 0 && (
          <section
            className="mt-10"
            aria-label={`Outros tipos à venda no ${neighborhood}`}
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              Outros tipos à venda no {neighborhood}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {relatedTypes.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/comprar/${t.propertyTypeSlug}/${citySlug}/${neighborhoodSlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <BlogSection
          posts={blogPosts}
          heading={`Blog: ${typeName.toLowerCase()} no ${neighborhood}`}
          description={`Artigos e guias sobre ${typeName.toLowerCase()} em ${city}.`}
        />

        {/* Bloco de contexto semântico */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Comprar ${typeName.toLowerCase()} no ${neighborhood}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Por que comprar {typeName.toLowerCase()} no {neighborhood}, {city}?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            O {neighborhood} é uma das regiões de {city} com oferta relevante de{" "}
            {typeName.toLowerCase()} à venda.
            {priceRange
              ? ` Os imóveis desta categoria no bairro têm preços entre ${formatPriceShort(priceRange.minPrice)} e ${formatPriceShort(priceRange.maxPrice)}, atendendo compradores com diferentes perfis e capacidade de investimento.`
              : " A região atende compradores com diferentes perfis, desde o primeiro imóvel até opções premium de alto padrão."}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros tem especialistas no mercado de {typeName.toLowerCase()} em{" "}
            {city}. Nossa equipe avalia o imóvel, negocia as melhores condições e
            acompanha todo o processo de compra, incluindo financiamento e assessoria
            jurídica. CRECI 1317J.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
            <Link
              href={neighborhoodCanonical}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Todos os imóveis no {neighborhood}
            </Link>
            <Link
              href={parentComprarCanonical}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Comprar {typeName.toLowerCase()} em toda {city}
            </Link>
            <Link
              href={`/bairro/${neighborhoodSlug}/tipo/${typeSlug}`}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              {typeName} no {neighborhood} (venda e locação)
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
