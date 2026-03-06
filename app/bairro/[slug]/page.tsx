import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByNeighborhoodSlug,
  countPublishedPropertiesByNeighborhoodSlug,
  getNeighborhoodContext,
  getAvailablePropertyTypesByNeighborhoodSlug,
  getAvailableNeighborhoods,
} from "@/lib/queries/properties";
import {
  buildNeighborhoodPageTitle,
  buildNeighborhoodPageDescription,
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

type PageProps = { params: Promise<{ slug: string }> };

// ---------------------------------------------------------------------------
// SSG: pré-gera rotas para bairros com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const neighborhoods = await getAvailableNeighborhoods();
  return neighborhoods.map((n) => ({ slug: n.neighborhoodSlug }));
}

// ---------------------------------------------------------------------------
// Metadata programática por bairro
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [context, count] = await Promise.all([
    getNeighborhoodContext(slug),
    countPublishedPropertiesByNeighborhoodSlug(slug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "neighborhood", publishedCount: count });

  if (!evaluation.shouldExist || !context) {
    return { title: "Bairro não encontrado | 3Pinheiros" };
  }

  const { neighborhood, city } = context;
  const title = buildNeighborhoodPageTitle(neighborhood, city);
  const description = buildNeighborhoodPageDescription(neighborhood, city, count);
  const canonical = buildCanonicalUrl(`/bairro/${slug}`);

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

export default async function BairroPage({ params }: PageProps) {
  const { slug } = await params;

  const [context, count] = await Promise.all([
    getNeighborhoodContext(slug),
    countPublishedPropertiesByNeighborhoodSlug(slug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "neighborhood", publishedCount: count });
  if (!evaluation.shouldExist || !context) notFound();

  const { neighborhood, city, citySlug } = context;

  const [properties, propertyTypes] = await Promise.all([
    getPublishedPropertiesByNeighborhoodSlug(slug, PROPERTIES_LIMIT),
    getAvailablePropertyTypesByNeighborhoodSlug(slug),
  ]);

  const canonical = buildCanonicalUrl(`/bairro/${slug}`);
  const cityCanonical = buildCanonicalUrl(`/cidade/${citySlug}`);
  const description = buildNeighborhoodPageDescription(neighborhood, city, count);

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
    name: `Imóveis à Venda no ${neighborhood}, ${city}`,
    description,
    url: canonical,
    numberOfItems: count,
    isPartOf: { "@type": "WebPage", url: cityCanonical },
    publisher: {
      "@type": "Organization",
      name: "3Pinheiros Consultoria Imobiliária",
      url: buildCanonicalUrl("/"),
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda no ${neighborhood}`,
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

        {/* Breadcrumb visível — 4 níveis: raiz > imóveis > cidade > bairro */}
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
            href={`/cidade/${citySlug}`}
            className="transition-colors hover:text-green-700"
          >
            {city}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{neighborhood}</span>
        </nav>

        {/* H1 semântico com contagem */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {count} {count !== 1 ? "imóveis" : "imóvel"} à venda no {neighborhood}
        </h1>

        {/* Link de retorno para a cidade — upward linking do silo */}
        <p className="mt-2 text-sm text-zinc-500">
          Bairro em{" "}
          <Link
            href={`/cidade/${citySlug}`}
            className="font-medium text-green-700 underline-offset-2 hover:underline"
          >
            {city}
          </Link>
        </p>

        {/* Texto introdutório contextual */}
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
          Explore os imóveis disponíveis no {neighborhood}, bairro localizado em {city}.
          Veja opções de casas, apartamentos e imóveis comerciais com fotos,
          preços atualizados e informações completas.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`Listagem de imóveis no ${neighborhood}`}>
          <PropertyList properties={properties} />

          {count > PROPERTIES_LIMIT && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              Exibindo {PROPERTIES_LIMIT} de {count}{" "}
              {count !== 1 ? "imóveis" : "imóvel"} no {neighborhood}.
            </p>
          )}
        </section>

        {/* Links para tipos disponíveis no bairro — silo: bairro → tipo */}
        {propertyTypes.length > 0 && (
          <section className="mt-14" aria-label={`Tipos de imóvel no ${neighborhood}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              Tipos de imóvel no {neighborhood}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Filtre por categoria e encontre o imóvel ideal neste bairro.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {propertyTypes.map((t) => (
                <li key={t.propertyTypeSlug}>
                  <Link
                    href={`/tipo/${t.propertyTypeSlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {getPropertyTypeLabel(t.propertyTypeSlug)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bloco de contexto semântico — reforça relevância topical do bairro */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Sobre o mercado imobiliário no ${neighborhood}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Mercado imobiliário no {neighborhood}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            O {neighborhood} é um bairro de {city} com perfil residencial e
            diversidade de opções imobiliárias. Imóveis na região atendem desde
            compradores em busca do primeiro imóvel até investidores interessados
            em rentabilidade e valorização patrimonial de longo prazo.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros oferece consultoria especializada para quem busca imóveis
            no {neighborhood} e região. Analisamos o perfil do comprador,
            apresentamos as melhores opções e acompanhamos todo o processo de
            compra até a entrega das chaves. CRECI 1317J.
          </p>

          {/* Links internos: bairro → cidade → listagem geral → contato */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Falar com um consultor
            </Link>
            <Link
              href={`/cidade/${citySlug}`}
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
            >
              Ver imóveis em {city}
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
