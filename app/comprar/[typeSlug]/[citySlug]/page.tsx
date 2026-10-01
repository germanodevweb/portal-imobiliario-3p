import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByBuyTypeAndCity,
  countPublishedPropertiesByBuyTypeAndCity,
  getBuyTypeCityContext,
  getNeighborhoodsWithSaleByTypeAndCity,
  getPropertyTypesWithSaleByCity,
  getAvailableBuyTypeCityPairs,
  getPriceRangeByBuyTypeAndCity,
} from "@/lib/queries/properties";
import { getPostsByTag } from "@/lib/queries/blog";
import { BlogSection } from "@/app/components/BlogSection";
import {
  buildBuyTypeCityPageTitle,
  buildBuyTypeCityPageDescription,
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
  notFoundIfPageOutOfRange,
} from "@/lib/pagination";
import {
  serializeJsonLd,
  buildBreadcrumbListJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/site-entity-jsonld";

const PROPERTIES_LIMIT = ITEMS_PER_PAGE;

type PageProps = {
  params: Promise<{ typeSlug: string; citySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// SSG: pré-gera todas as combinações tipo+cidade com imóveis à venda
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const pairs = await getAvailableBuyTypeCityPairs();
  return pairs.map((p) => ({
    typeSlug: p.propertyTypeSlug,
    citySlug: p.citySlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata programática — intenção comercial (comprar)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { typeSlug, citySlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count, priceRange] = await Promise.all([
    getBuyTypeCityContext(typeSlug, citySlug),
    countPublishedPropertiesByBuyTypeAndCity(typeSlug, citySlug),
    getPriceRangeByBuyTypeAndCity(typeSlug, citySlug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "buyTypeCity", publishedCount: count });

  if (!evaluation.shouldExist || !context) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  notFoundIfPageOutOfRange(page, calculateTotalPages(count));

  const typeName = getPropertyTypeLabel(typeSlug);
  const { city } = context;
  const baseTitle = buildBuyTypeCityPageTitle(typeName, city);
  const title = buildPageTitle(baseTitle, page);
  const description = buildBuyTypeCityPageDescription(
    typeName,
    city,
    count,
    priceRange
  );
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/comprar/${typeSlug}/${citySlug}`),
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

export default async function ComprarTypeCityPage({ params, searchParams }: PageProps) {
  const { typeSlug, citySlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [context, count] = await Promise.all([
    getBuyTypeCityContext(typeSlug, citySlug),
    countPublishedPropertiesByBuyTypeAndCity(typeSlug, citySlug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "buyTypeCity", publishedCount: count });
  if (!evaluation.shouldExist || !context) notFound();

  const typeName = getPropertyTypeLabel(typeSlug);
  const { city } = context;
  const totalPages = calculateTotalPages(count);
  notFoundIfPageOutOfRange(page, totalPages);

  const [properties, neighborhoods, otherTypes, priceRange, blogPosts] = await Promise.all([
    getPublishedPropertiesByBuyTypeAndCity(typeSlug, citySlug, PROPERTIES_LIMIT, skip),
    getNeighborhoodsWithSaleByTypeAndCity(typeSlug, citySlug),
    getPropertyTypesWithSaleByCity(citySlug),
    getPriceRangeByBuyTypeAndCity(typeSlug, citySlug),
    getPostsByTag(`tipo:${typeSlug}`).then((posts) =>
      posts.length > 0 ? posts : getPostsByTag(`cidade:${citySlug}`)
    ),
  ]);

  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/comprar/${typeSlug}/${citySlug}`),
    page
  );
  const cityCanonical = buildCanonicalUrl(`/cidade/${citySlug}`);
  const typeCanonical = buildCanonicalUrl(`/tipo/${typeSlug}`);
  const description = buildBuyTypeCityPageDescription(
    typeName,
    city,
    count,
    priceRange
  );

  const neighborhoodCount = neighborhoods.filter(
    (n) => n.neighborhoodSlug && n.neighborhood
  ).length;
  const relatedTypes = otherTypes.filter((t) => t.propertyTypeSlug !== typeSlug);

  // -------------------------------------------------------------------------
  // JSON-LD
  // -------------------------------------------------------------------------

  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: "Início", url: buildCanonicalUrl("/") },
    { name: "Imóveis", url: buildCanonicalUrl("/imoveis") },
    { name: "Comprar", url: buildCanonicalUrl("/imoveis") },
    { name: typeName, url: typeCanonical },
    { name: city, url: canonical },
  ]);

  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: `Comprar ${typeName} em ${city}`,
    description,
    url: canonical,
    numberOfItems: count,
    isPartOfUrl: cityCanonical,
  });

  const itemListJsonLd = buildItemListJsonLd({
    name: `Comprar ${typeName} em ${city}`,
    numberOfItems: properties.length,
    items: properties.map((p) => ({
      url: buildCanonicalUrl(`/imoveis/${p.slug}`),
      name: p.title,
    })),
  });

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb: Início > Imóveis > Comprar > Tipo > Cidade */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/imoveis" className="transition-colors hover:text-green-700">
            Imóveis
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/tipo/${typeSlug}`} className="transition-colors hover:text-green-700">
            {typeName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{city}</span>
        </nav>

        {/* H1 semântico com intenção comercial */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Comprar {typeName.toLowerCase()} em {city}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {count} {count !== 1 ? "imóveis à venda" : "imóvel à venda"} nesta região
        </p>

        {/* Links de retorno para silos geográfico e de tipo */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span>
            Tipo:{" "}
            <Link
              href={`/tipo/${typeSlug}`}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              {typeName}
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
          {neighborhoodCount > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Bairros
              </dt>
              <dd className="mt-1 text-2xl font-bold text-zinc-900">{neighborhoodCount}</dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório contextual */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {priceRange
            ? `${count} ${count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")} à venda em ${city}, com preços de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}.`
            : `${count} ${count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")} à venda em ${city}.`}
          {neighborhoodCount > 0
            ? ` Distribuídos em ${neighborhoodCount} ${neighborhoodCount !== 1 ? "bairros" : "bairro"} da cidade.`
            : ""}
          {" "}Veja fotos, preços atualizados e informações completas.
          A 3Pinheiros oferece consultoria especializada para compra na região. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`${typeName} à venda em ${city}`}>
          <PropertyList properties={properties} priorityCount={1} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/comprar/${typeSlug}/${citySlug}`}
          />
        </section>

        {/* Links para bairros — silo comprar tipo+cidade → bairro */}
        {neighborhoods.length > 0 && (
          <section className="mt-14" aria-label={`Bairros com ${typeName.toLowerCase()} à venda em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Comprar {typeName.toLowerCase()} por bairro em {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Refine sua busca por bairro dentro de {city}.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {neighborhoods.map((n) =>
                n.neighborhoodSlug && n.neighborhood ? (
                  <li key={n.neighborhoodSlug}>
                    <Link
                      href={`/comprar/${typeSlug}/${citySlug}/${n.neighborhoodSlug}`}
                      className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                    >
                      {n.neighborhood}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </section>
        )}

        {/* Links para outros tipos à venda na mesma cidade */}
        {relatedTypes.length > 0 && (
          <section className="mt-10" aria-label={`Outros tipos à venda em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Outros tipos à venda em {city}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {relatedTypes.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/comprar/${t.propertyTypeSlug}/${citySlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Links para páginas geográficas e de tipo existentes */}
        <section className="mt-10" aria-label="Explorar mais">
          <h2 className="text-lg font-semibold text-zinc-900">
            Explorar mais
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={cityCanonical}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Todos os imóveis em {city}
            </Link>
            <Link
              href={typeCanonical}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Todos os {typeName.toLowerCase()}
            </Link>
            <Link
              href={`/tipo/${typeSlug}/cidade/${citySlug}`}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              {typeName} em {city} (venda e locação)
            </Link>
          </div>
        </section>

        <BlogSection
          posts={blogPosts}
          heading={`Blog: ${typeName.toLowerCase()} em ${city}`}
          description={`Artigos e guias sobre ${typeName.toLowerCase()} na região.`}
        />

        {/* Bloco de contexto semântico */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Comprar ${typeName.toLowerCase()} em ${city}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Por que comprar {typeName.toLowerCase()} em {city}?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {city} oferece {typeName.toLowerCase()} para diferentes perfis de compradores.
            {priceRange
              ? ` Os preços praticados na cidade vão de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}, com opções compactas para jovens profissionais e imóveis maiores para famílias.`
              : " Desde imóveis compactos para jovens profissionais até opções maiores para famílias em busca de conforto e localização privilegiada."}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros é especialista em compra de {typeName.toLowerCase()} na região
            de {city}. Nossa equipe acompanha cada etapa — da análise do imóvel à
            assinatura do contrato — com transparência e assessoria jurídica completa. CRECI 1317J.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
            <Link
              href={cityCanonical}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Ver todos os imóveis em {city}
            </Link>
            <Link
              href={typeCanonical}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Ver todos os {typeName.toLowerCase()}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
