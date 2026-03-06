import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByTypeAndCity,
  countPublishedPropertiesByTypeAndCity,
  getTypeCityContext,
  getRelatedNeighborhoodsByCitySlug,
  getAvailablePropertyTypesByCitySlug,
  getAvailableTypeCityPairs,
} from "@/lib/queries/properties";
import {
  buildPropertyTypePageTitle,
  buildPropertyTypePageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
} from "@/lib/seo";
import {
  evaluateIndexation,
  buildRobotsDirective,
} from "@/lib/indexation";

const PROPERTIES_LIMIT = 24;

// params.slug é o typeSlug — nome herdado do segmento pai [slug]
type PageProps = { params: Promise<{ slug: string; citySlug: string }> };

// ---------------------------------------------------------------------------
// SSG: pré-gera todas as combinações tipo+cidade com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const pairs = await getAvailableTypeCityPairs();
  return pairs.map((p) => ({
    slug: p.propertyTypeSlug,
    citySlug: p.citySlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata programática por tipo+cidade
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: typeSlug, citySlug } = await params;

  const [context, count] = await Promise.all([
    getTypeCityContext(typeSlug, citySlug),
    countPublishedPropertiesByTypeAndCity(typeSlug, citySlug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "propertyTypeCity", publishedCount: count });

  if (!evaluation.shouldExist || !context) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  const typeName = getPropertyTypeLabel(typeSlug);
  const { city } = context;
  const title = buildPropertyTypePageTitle(typeName, city);
  const description = buildPropertyTypePageDescription(typeName, city, count);
  const canonical = buildCanonicalUrl(`/tipo/${typeSlug}/cidade/${citySlug}`);

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

export default async function TipoCidadePage({ params }: PageProps) {
  const { slug: typeSlug, citySlug } = await params;

  const [context, count] = await Promise.all([
    getTypeCityContext(typeSlug, citySlug),
    countPublishedPropertiesByTypeAndCity(typeSlug, citySlug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "propertyTypeCity", publishedCount: count });
  if (!evaluation.shouldExist || !context) notFound();

  const typeName = getPropertyTypeLabel(typeSlug);
  const { city } = context;

  const [properties, neighborhoods, otherTypes] = await Promise.all([
    getPublishedPropertiesByTypeAndCity(typeSlug, citySlug, PROPERTIES_LIMIT),
    getRelatedNeighborhoodsByCitySlug(citySlug),
    getAvailablePropertyTypesByCitySlug(citySlug),
  ]);

  const canonical = buildCanonicalUrl(`/tipo/${typeSlug}/cidade/${citySlug}`);
  const cityCanonical = buildCanonicalUrl(`/cidade/${citySlug}`);
  const typeCanonical = buildCanonicalUrl(`/tipo/${typeSlug}`);
  const description = buildPropertyTypePageDescription(typeName, city, count);

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
        name: typeName,
        item: typeCanonical,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: city,
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${typeName} à Venda em ${city}`,
    description,
    url: canonical,
    numberOfItems: count,
    isPartOf: [
      { "@type": "WebPage", url: typeCanonical },
      { "@type": "WebPage", url: cityCanonical },
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
    name: `${typeName} à Venda em ${city}`,
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

        {/* Breadcrumb: Início > Tipo > Cidade */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/imoveis" className="transition-colors hover:text-green-700">
            Imóveis
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/tipo/${typeSlug}`}
            className="transition-colors hover:text-green-700"
          >
            {typeName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{city}</span>
        </nav>

        {/* H1 semântico com contagem */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {count} {count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")} à venda em {city}
        </h1>

        {/* Links de retorno para os dois nós do silo */}
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
              href={`/cidade/${citySlug}`}
              className="font-medium text-green-700 underline-offset-2 hover:underline"
            >
              {city}
            </Link>
          </span>
        </div>

        {/* Texto introdutório contextual */}
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
          Veja as melhores opções de {typeName.toLowerCase()} à venda em {city}.
          Imóveis com fotos, preços atualizados e informações completas.
          A 3Pinheiros oferece consultoria especializada para compra, venda e
          investimento na região. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`${typeName} em ${city}`}>
          <PropertyList properties={properties} />

          {count > PROPERTIES_LIMIT && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              Exibindo {PROPERTIES_LIMIT} de {count}{" "}
              {count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")}{" "}
              em {city}.
            </p>
          )}
        </section>

        {/* Links para bairros da cidade — silo: tipo+cidade → bairro */}
        {neighborhoods.length > 0 && (
          <section className="mt-14" aria-label={`Bairros com ${typeName.toLowerCase()} em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              {typeName} por bairro em {city}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Refine sua busca por bairro dentro de {city}.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {neighborhoods.map((n) =>
                n.neighborhoodSlug && n.neighborhood ? (
                  <li key={n.neighborhoodSlug}>
                    <Link
                      href={`/bairro/${n.neighborhoodSlug}`}
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

        {/* Links para outros tipos na mesma cidade — silo: tipo+cidade → tipo */}
        {otherTypes.filter((t) => t.propertyTypeSlug !== typeSlug).length > 0 && (
          <section className="mt-10" aria-label={`Outros tipos de imóvel em ${city}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Outros tipos de imóvel em {city}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherTypes
                .filter((t) => t.propertyTypeSlug !== typeSlug)
                .map((t) => (
                  <li key={t.propertyTypeSlug}>
                    <Link
                      href={`/tipo/${t.propertyTypeSlug}/cidade/${citySlug}`}
                      className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                    >
                      {getPropertyTypeLabel(t.propertyTypeSlug)}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Bloco de contexto semântico */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Mercado de ${typeName.toLowerCase()} em ${city}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Mercado de {typeName.toLowerCase()} em {city}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {city} oferece uma variedade de {typeName.toLowerCase()} para
            diferentes perfis de compradores: desde imóveis compactos para
            jovens profissionais até opções maiores para famílias em busca de
            conforto e localização privilegiada.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros é especialista em {typeName.toLowerCase()} na região
            de {city}. Nossa equipe acompanha cada etapa da negociação — da
            análise do imóvel à assinatura do contrato — com transparência e
            assessoria jurídica completa. CRECI 1317J.
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
