import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import { BlogSection } from "@/app/components/BlogSection";
import {
  getPublishedPropertiesByNeighborhoodSlug,
  countPublishedPropertiesByNeighborhoodSlug,
  getNeighborhoodContext,
  getPriceRangeByNeighborhoodSlug,
  getMostCommonTypeByNeighborhoodSlug,
  getRelatedNeighborhoodsByCitySlug,
  getAvailablePropertyTypesByNeighborhoodSlug,
  getAvailableCityNeighborhoodPairs,
} from "@/lib/queries/properties";
import { getPostsByTag } from "@/lib/queries/blog";
import {
  buildCityNeighborhoodPageTitle,
  buildCityNeighborhoodPageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
  formatPriceShort,
  SITE_NAME,
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

const PROPERTIES_LIMIT = ITEMS_PER_PAGE;

// No Next.js App Router, o segmento [slug] é o citySlug (do parent /cidade/[slug])
// e [neighborhoodSlug] é o slug do bairro.
type PageProps = {
  params: Promise<{ slug: string; neighborhoodSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// SSG: pré-gera todas as combinações cidade+bairro com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const pairs = await getAvailableCityNeighborhoodPairs();
  return pairs.map((p) => ({
    slug: p.citySlug,
    neighborhoodSlug: p.neighborhoodSlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug: citySlug, neighborhoodSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count] = await Promise.all([
    getNeighborhoodContext(neighborhoodSlug),
    countPublishedPropertiesByNeighborhoodSlug(neighborhoodSlug),
  ]);

  // Valida que o bairro pertence à cidade informada na URL
  if (!context || context.citySlug !== citySlug) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  const evaluation = evaluateIndexation({ pageType: "cityNeighborhood", publishedCount: count });

  if (!evaluation.shouldExist) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  const { neighborhood, city } = context;
  const allNeighborhoods = await getRelatedNeighborhoodsByCitySlug(citySlug);
  const neighborhoodCount = allNeighborhoods.length;

  const baseTitle = buildCityNeighborhoodPageTitle(neighborhood, city);
  const title = buildPageTitle(baseTitle, page);
  const description = buildCityNeighborhoodPageDescription(
    neighborhood,
    city,
    count,
    neighborhoodCount
  );
  // Canonical aponta para /bairro/[slug] — URL principal do bairro.
  // Evita duplicate content entre cidade/bairro e bairro (mesma listagem).
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/bairro/${neighborhoodSlug}`),
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

export default async function CidadeBairroPage({ params, searchParams }: PageProps) {
  const { slug: citySlug, neighborhoodSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  // Contexto e contagem inicial em paralelo
  const [context, count] = await Promise.all([
    getNeighborhoodContext(neighborhoodSlug),
    countPublishedPropertiesByNeighborhoodSlug(neighborhoodSlug),
  ]);

  // Valida: bairro deve existir E pertencer à cidade da URL
  if (!context || context.citySlug !== citySlug) notFound();

  const evaluation = evaluateIndexation({ pageType: "cityNeighborhood", publishedCount: count });
  if (!evaluation.shouldExist) notFound();

  const { neighborhood, city } = context;
  const totalPages = calculateTotalPages(count);

  // Busca paralela: imóveis, bairros da cidade, tipos no bairro, preço, tipo predominante, blog
  const [
    properties,
    allNeighborhoodsInCity,
    propertyTypes,
    priceRange,
    mostCommonType,
    blogPosts,
  ] = await Promise.all([
    getPublishedPropertiesByNeighborhoodSlug(neighborhoodSlug, PROPERTIES_LIMIT, skip),
    getRelatedNeighborhoodsByCitySlug(citySlug),
    getAvailablePropertyTypesByNeighborhoodSlug(neighborhoodSlug),
    getPriceRangeByNeighborhoodSlug(neighborhoodSlug),
    getMostCommonTypeByNeighborhoodSlug(neighborhoodSlug),
    // Prioridade: bairro → tipo → cidade
    getPostsByTag(`bairro:${neighborhoodSlug}`).then((posts) =>
      posts.length > 0
        ? posts
        : getPostsByTag(`cidade:${citySlug}`)
    ),
  ]);

  // Canonical aponta para /bairro/[slug] — URL principal do bairro (evita duplicate content)
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/bairro/${neighborhoodSlug}`),
    page
  );
  const cityCanonical = buildCanonicalUrl(`/cidade/${citySlug}`);
  const neighborhoodCanonical = buildCanonicalUrl(`/bairro/${neighborhoodSlug}`);
  const description = buildCityNeighborhoodPageDescription(
    neighborhood,
    city,
    count,
    allNeighborhoodsInCity.length
  );

  // Bairros da cidade excluindo o bairro atual
  const otherNeighborhoods = allNeighborhoodsInCity.filter(
    (n) => n.neighborhoodSlug !== neighborhoodSlug && n.neighborhoodSlug && n.neighborhood
  );

  const mostCommonTypeLabel = mostCommonType ? getPropertyTypeLabel(mostCommonType) : null;

  // -------------------------------------------------------------------------
  // JSON-LD
  // -------------------------------------------------------------------------

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: buildCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Imóveis",
        item: buildCanonicalUrl("/imoveis"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city,
        item: cityCanonical,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: neighborhood,
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Bairro ${neighborhood} em ${city} — Imóveis à Venda`,
    description,
    url: canonical,
    numberOfItems: count,
    // Este bairro É PARTE da cidade — silo geográfico explícito
    isPartOf: { "@type": "WebPage", url: cityCanonical },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: buildCanonicalUrl("/"),
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda no ${neighborhood}, ${city}`,
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

        {/* Breadcrumb: Início > Imóveis > Cidade > Bairro */}
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
          <Link href={cityCanonical} className="transition-colors hover:text-green-700">
            {city}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{neighborhood}</span>
        </nav>

        {/* H1 — framing cidade-primeiro, diferente de /bairro/[slug] */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Bairro {neighborhood} em {city}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {count} {count !== 1 ? "imóveis disponíveis" : "imóvel disponível"} neste bairro
        </p>

        {/* Links de contexto — ambos os nós pai do silo */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
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
            Ver bairro isolado:{" "}
            <Link
              href={neighborhoodCanonical}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              /bairro/{neighborhoodSlug}
            </Link>
          </span>
        </div>

        {/* Bloco de dados reais */}
        <dl className="mt-5 flex flex-wrap gap-6 sm:gap-10">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Imóveis publicados
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
          {mostCommonTypeLabel && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tipo predominante
              </dt>
              <dd className="mt-1 text-2xl font-bold text-zinc-900">{mostCommonTypeLabel}</dd>
            </div>
          )}
          {otherNeighborhoods.length > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Outros bairros em {city}
              </dt>
              <dd className="mt-1 text-2xl font-bold text-zinc-900">
                {otherNeighborhoods.length}
              </dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório — enfatiza relação com a cidade */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          O {neighborhood} é um dos bairros de {city} com imóveis publicados no portal.
          {priceRange
            ? ` Os preços no bairro vão de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}.`
            : ""}
          {mostCommonTypeLabel
            ? ` A categoria mais encontrada é ${mostCommonTypeLabel.toLowerCase()}.`
            : ""}
          {otherNeighborhoods.length > 0
            ? ` ${city} ainda conta com ${otherNeighborhoods.length} ${otherNeighborhoods.length !== 1 ? "outros bairros" : "outro bairro"} disponíveis para comparação.`
            : ""}
          {" "}A 3Pinheiros oferece consultoria especializada na região. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`Imóveis no ${neighborhood}, ${city}`}>
          <PropertyList properties={properties} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/cidade/${citySlug}/bairro/${neighborhoodSlug}`}
          />
        </section>

        {/* DIFERENCIAL desta página: outros bairros da mesma cidade — silo geográfico */}
        {otherNeighborhoods.length > 0 && (
          <section
            className="mt-14"
            aria-label={`Outros bairros de ${city}`}
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              Outros bairros em {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore imóveis em outros bairros da cidade e compare opções.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherNeighborhoods.map((n) => (
                <li key={n.neighborhoodSlug}>
                  <Link
                    href={`/cidade/${citySlug}/bairro/${n.neighborhoodSlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {n.neighborhood}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tipos disponíveis neste bairro — silo: bairro → bairro+tipo */}
        {propertyTypes.length > 0 && (
          <section className="mt-10" aria-label={`Tipos de imóvel no ${neighborhood}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Tipos de imóvel no {neighborhood}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {propertyTypes.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/bairro/${neighborhoodSlug}/tipo/${t.propertyTypeSlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cluster editorial */}
        <BlogSection
          posts={blogPosts}
          heading={`Blog: bairro ${neighborhood} em ${city}`}
          description={`Artigos e guias sobre imóveis em ${city}.`}
        />

        {/* Bloco de contexto semântico — cidade-centric */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`${neighborhood} em ${city}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Por que comprar no {neighborhood}, {city}?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            O {neighborhood} combina localização estratégica com oferta variada de
            imóveis.
            {priceRange
              ? ` Com preços entre ${formatPriceShort(priceRange.minPrice)} e ${formatPriceShort(priceRange.maxPrice)}, o bairro atende desde compradores do primeiro imóvel até investidores em busca de valorização dentro de ${city}.`
              : ` O bairro atende desde compradores do primeiro imóvel até investidores em busca de valorização dentro de ${city}.`}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros atua em {city} com consultoria completa — avaliação de
            imóvel, negociação, financiamento e assessoria jurídica. Atendimento
            presencial e remoto. CRECI 1317J.
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
              href={neighborhoodCanonical}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Visão geral do {neighborhood}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
