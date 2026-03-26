import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByCitySlug,
  countPublishedPropertiesByCitySlug,
  getRelatedNeighborhoodsByCitySlug,
  getAvailablePropertyTypesByCitySlug,
  getAvailableCities,
  getPriceRangeByCitySlug,
  getMostCommonTypeByCitySlug,
} from "@/lib/queries/properties";
import { getPostsByTag } from "@/lib/queries/blog";
import { BlogSection } from "@/app/components/BlogSection";
import {
  buildCityPageTitle,
  buildCityPageDescription,
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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// SSG: pré-gera rotas para cidades com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const cities = await getAvailableCities();
  return cities.map((c) => ({ slug: c.citySlug }));
}

// ---------------------------------------------------------------------------
// Metadata programática por cidade
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [properties, count] = await Promise.all([
    getPublishedPropertiesByCitySlug(slug, 1),
    countPublishedPropertiesByCitySlug(slug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "city", publishedCount: count });

  if (!evaluation.shouldExist) {
    return { title: "Cidade não encontrada | 3Pinheiros" };
  }

  const city = properties[0].city;
  const baseTitle = buildCityPageTitle(city);
  const title = buildPageTitle(baseTitle, page);
  const description = buildCityPageDescription(city, count);
  const canonical = buildPaginatedCanonical(buildCanonicalUrl(`/cidade/${slug}`), page);

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

export default async function CidadePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [properties, count, neighborhoods, propertyTypes, priceRange, mostCommonType, blogPosts] =
    await Promise.all([
      getPublishedPropertiesByCitySlug(slug, PROPERTIES_LIMIT, skip),
      countPublishedPropertiesByCitySlug(slug),
      getRelatedNeighborhoodsByCitySlug(slug),
      getAvailablePropertyTypesByCitySlug(slug),
      getPriceRangeByCitySlug(slug),
      getMostCommonTypeByCitySlug(slug),
      getPostsByTag(`cidade:${slug}`),
    ]);

  const evaluation = evaluateIndexation({ pageType: "city", publishedCount: count });
  if (!evaluation.shouldExist) notFound();

  const city = properties[0].city;
  const canonical = buildPaginatedCanonical(buildCanonicalUrl(`/cidade/${slug}`), page);
  const description = buildCityPageDescription(city, count);
  const totalPages = calculateTotalPages(count);

  const mostCommonTypeLabel = mostCommonType ? getPropertyTypeLabel(mostCommonType) : null;
  const typeCount = propertyTypes.length;

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
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Imóveis à Venda em ${city}`,
    description,
    url: canonical,
    numberOfItems: count,
    publisher: {
      "@type": "Organization",
      name: "3Pinheiros Consultoria Imobiliária",
      url: buildCanonicalUrl("/"),
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda em ${city}`,
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

        {/* Breadcrumb visível */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/imoveis" className="transition-colors hover:text-green-700">
            Imóveis
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{city}</span>
        </nav>

        {/* H1 semântico com contagem */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {count} {count !== 1 ? "imóveis" : "imóvel"} à venda em {city}
        </h1>

        {/* Bloco de dados reais — diferencia semanticamente cada cidade */}
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
          {typeCount > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Categorias
              </dt>
              <dd className="mt-1 text-2xl font-bold text-zinc-900">{typeCount}</dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório contextual com dados reais */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          {priceRange
            ? `Em ${city}, os imóveis publicados têm preços de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}.`
            : `Veja todos os imóveis disponíveis em ${city}.`}
          {mostCommonTypeLabel
            ? ` A categoria mais presente na cidade é ${mostCommonTypeLabel.toLowerCase()}.`
            : ""}
          {neighborhoods.length > 0
            ? ` O acervo está distribuído em ${neighborhoods.length} ${neighborhoods.length !== 1 ? "bairros" : "bairro"}.`
            : ""}
          {" "}A 3Pinheiros oferece consultoria personalizada para compra, venda e
          investimento com atendimento especializado na região. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`Listagem de imóveis em ${city}`}>
          <PropertyList properties={properties} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/cidade/${slug}`}
          />
        </section>

        {/* Links para bairros — silo: cidade → bairro */}
        {neighborhoods.length > 0 && (
          <section className="mt-14" aria-label={`Bairros com imóveis em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Imóveis por bairro em {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore imóveis disponíveis em cada bairro de {city}.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {neighborhoods.map((n) =>
                n.neighborhoodSlug && n.neighborhood ? (
                  <li key={n.neighborhoodSlug}>
                    <Link
                      href={`/cidade/${slug}/bairro/${n.neighborhoodSlug}`}
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

        {/* Links para tipos — silo: cidade → tipo */}
        {propertyTypes.length > 0 && (
          <section className="mt-10" aria-label={`Tipos de imóvel em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Tipos de imóvel em {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Filtre por categoria e encontre o imóvel ideal.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {propertyTypes.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/tipo/${t.propertyTypeSlug}/cidade/${slug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cluster editorial: posts do blog relacionados a esta cidade */}
        <BlogSection
          posts={blogPosts}
          heading={`Blog: mercado imobiliário em ${city}`}
          description={`Artigos e guias sobre imóveis em ${city}.`}
        />

        {/* Bloco de contexto semântico */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Mercado imobiliário em ${city}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Mercado imobiliário em {city}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {city} reúne opções para diferentes perfis de comprador: famílias em
            busca de casas em bairros residenciais, jovens profissionais
            interessados em apartamentos próximos a centros comerciais e
            investidores focados em valorização patrimonial de longo prazo.
            {priceRange
              ? ` O mercado local pratica preços de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}, com boa variedade de opções em diferentes bairros.`
              : ""}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros atua em {city} com consultoria completa — da análise do
            perfil do comprador à assessoria jurídica e financiamento habitacional.
            Atendimento presencial e remoto. CRECI 1317J.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Ver todos os imóveis
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
