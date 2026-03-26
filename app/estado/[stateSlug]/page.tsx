import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getStateContext,
  getPublishedPropertiesByStateSlug,
  countPublishedPropertiesByStateSlug,
  getCitiesByStateSlug,
  getPriceRangeByStateSlug,
  getAvailableStates,
} from "@/lib/queries/properties";
import { getRecentPosts } from "@/lib/queries/blog";
import { BlogSection } from "@/app/components/BlogSection";
import {
  buildStatePageTitle,
  buildStatePageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
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

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type PageProps = {
  params: Promise<{ stateSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// generateStaticParams — pré-gera todas as páginas de estado no build
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const states = await getAvailableStates();
  return states.map(({ stateSlug }) => ({ stateSlug }));
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { stateSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count, cities] = await Promise.all([
    getStateContext(stateSlug),
    countPublishedPropertiesByStateSlug(stateSlug),
    getCitiesByStateSlug(stateSlug),
  ]);

  if (!context) return { title: "Estado não encontrado" };

  const evaluation = evaluateIndexation({ pageType: "state", publishedCount: count });
  const baseTitle = buildStatePageTitle(context.state);
  const title = buildPageTitle(baseTitle, page);
  const description = buildStatePageDescription(context.state, count, cities.length);
  const canonical = buildPaginatedCanonical(buildCanonicalUrl(`/estado/${stateSlug}`), page);

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

export default async function EstadoPage({ params, searchParams }: PageProps) {
  const { stateSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [context, count, cities, properties, priceRange, recentPosts] = await Promise.all([
    getStateContext(stateSlug),
    countPublishedPropertiesByStateSlug(stateSlug),
    getCitiesByStateSlug(stateSlug),
    getPublishedPropertiesByStateSlug(stateSlug, ITEMS_PER_PAGE, skip),
    getPriceRangeByStateSlug(stateSlug),
    getRecentPosts(2),
  ]);

  const { shouldExist } = evaluateIndexation({ pageType: "state", publishedCount: count });
  if (!context || !shouldExist) notFound();

  const { state } = context;
  const totalPages = calculateTotalPages(count);
  const canonical = buildPaginatedCanonical(buildCanonicalUrl(`/estado/${stateSlug}`), page);

  // JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: buildCanonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Imóveis", item: buildCanonicalUrl("/imoveis") },
      { "@type": "ListItem", position: 3, name: state, item: canonical },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Imóveis à Venda em ${state}`,
    description: buildStatePageDescription(state, count, cities.length),
    url: canonical,
    isPartOf: { "@type": "WebSite", url: buildCanonicalUrl("/") },
    numberOfItems: count,
  };

  const itemListJsonLd =
    properties.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Imóveis à Venda em ${state}`,
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
              <Link href="/imoveis" className="hover:text-green-700 transition-colors">
                Imóveis
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-zinc-800">
              {state}
            </li>
          </ol>
        </nav>

        {/* H1 + resumo */}
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Imóveis à Venda em {state}
        </h1>

        <p className="mt-2 text-sm font-medium text-green-700">
          {count} {count !== 1 ? "imóveis disponíveis" : "imóvel disponível"} em{" "}
          {cities.length} {cities.length !== 1 ? "cidades" : "cidade"}
        </p>

        {/* Bloco de dados — stats reais */}
        <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
          <div>
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Imóveis publicados
            </dt>
            <dd className="mt-1 text-xl font-bold text-zinc-900">{count}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Cidades cobertas
            </dt>
            <dd className="mt-1 text-xl font-bold text-zinc-900">{cities.length}</dd>
          </div>

          {priceRange && (
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Faixa de preço
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-900">
                {formatPriceShort(priceRange.minPrice)} –{" "}
                {formatPriceShort(priceRange.maxPrice)}
              </dd>
            </div>
          )}
        </dl>

        {/* Texto introdutório — dado + contexto */}
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-700">
          O mercado imobiliário de{" "}
          <strong className="font-semibold text-zinc-900">{state}</strong> conta com{" "}
          {count} {count !== 1 ? "imóveis publicados" : "imóvel publicado"} distribuídos
          em {cities.length} {cities.length !== 1 ? "cidades" : "cidade"}.
          {priceRange
            ? ` Os preços variam de ${formatPriceShort(priceRange.minPrice)} a ${formatPriceShort(priceRange.maxPrice)}, atendendo desde perfis de entrada até o segmento de alto padrão.`
            : ""}{" "}
          A 3Pinheiros Consultoria Imobiliária (CRECI 1317J) opera em todo o estado com
          foco em segurança jurídica, avaliação técnica e negociação eficiente.
        </p>

        {/* Grid de cidades — navegação principal da página */}
        {cities.length > 0 && (
          <section className="mt-10" aria-labelledby="cidades-heading">
            <h2
              id="cidades-heading"
              className="mb-4 text-lg font-semibold text-zinc-900"
            >
              Imóveis por cidade em {state}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {cities.map((c) => (
                <li key={c.citySlug}>
                  <Link
                    href={`/estado/${stateSlug}/cidade/${c.citySlug}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition-all hover:border-green-600 hover:text-green-700 hover:shadow-sm"
                  >
                    {c.city}
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
            Imóveis em destaque em {state}
          </h2>
          <PropertyList properties={properties} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/estado/${stateSlug}`}
          />
        </section>

        {/* Bloco semântico de contexto */}
        <section className="mt-12 rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
          <h2 className="mb-3 text-base font-semibold text-zinc-900">
            Sobre o mercado imobiliário em {state}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            {state} é um dos principais mercados imobiliários do Brasil,{" "}
            {cities.length > 1
              ? `com oportunidades distribuídas em cidades como ${cities
                  .slice(0, 3)
                  .map((c) => c.city)
                  .join(", ")}${cities.length > 3 ? " e outras" : ""}.`
              : cities.length === 1
                ? `com atuação concentrada em ${cities[0].city}.`
                : "com portfólio em atualização constante."}{" "}
            A 3Pinheiros oferece consultoria completa em compra, venda e avaliação de
            imóveis residenciais e comerciais, com equipe especializada no mercado local.
          </p>

          {/* Links internos — cidade → bairros */}
          {cities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.slice(0, 6).map((c) => (
                <Link
                  key={c.citySlug}
                  href={`/estado/${stateSlug}/cidade/${c.citySlug}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-green-600 hover:text-green-700"
                >
                  Imóveis em {c.city}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Blog relacionado — posts recentes do portal */}
        <BlogSection posts={recentPosts} />
      </main>

      <Footer />
    </>
  );
}
