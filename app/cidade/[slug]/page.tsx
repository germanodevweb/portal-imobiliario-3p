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
} from "@/lib/queries/properties";
import {
  buildCityPageTitle,
  buildCityPageDescription,
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
// SSG: pré-gera rotas para cidades com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const cities = await getAvailableCities();
  return cities.map((c) => ({ slug: c.citySlug }));
}

// ---------------------------------------------------------------------------
// Metadata programática por cidade
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [properties, count] = await Promise.all([
    getPublishedPropertiesByCitySlug(slug, 1),
    countPublishedPropertiesByCitySlug(slug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "city", publishedCount: count });

  if (!evaluation.shouldExist) {
    return { title: "Cidade não encontrada | 3Pinheiros" };
  }

  const city = properties[0].city;
  const title = buildCityPageTitle(city);
  const description = buildCityPageDescription(city, count);
  const canonical = buildCanonicalUrl(`/cidade/${slug}`);

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

export default async function CidadePage({ params }: PageProps) {
  const { slug } = await params;

  const [properties, count, neighborhoods, propertyTypes] = await Promise.all([
    getPublishedPropertiesByCitySlug(slug, PROPERTIES_LIMIT),
    countPublishedPropertiesByCitySlug(slug),
    getRelatedNeighborhoodsByCitySlug(slug),
    getAvailablePropertyTypesByCitySlug(slug),
  ]);

  const evaluation = evaluateIndexation({ pageType: "city", publishedCount: count });
  if (!evaluation.shouldExist) notFound();

  const city = properties[0].city;
  const canonical = buildCanonicalUrl(`/cidade/${slug}`);
  const description = buildCityPageDescription(city, count);

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

        {/* H1 semântico com contagem — sinal de conteúdo real */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {count} {count !== 1 ? "imóveis" : "imóvel"} à venda em {city}
        </h1>

        {/* Texto introdutório contextual */}
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
          Encontre casas, apartamentos, coberturas e imóveis comerciais em {city}.
          A 3Pinheiros oferece consultoria personalizada para compra, venda e
          investimento imobiliário com atendimento especializado na região.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`Listagem de imóveis em ${city}`}>
          <PropertyList properties={properties} />

          {count > PROPERTIES_LIMIT && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              Exibindo {PROPERTIES_LIMIT} de {count}{" "}
              {count !== 1 ? "imóveis" : "imóvel"} em {city}.
            </p>
          )}
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

        {/* Bloco de contexto semântico — reforça relevância topical */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Mercado imobiliário em ${city}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Mercado imobiliário em {city}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {city} concentra uma ampla diversidade de imóveis para diferentes perfis:
            famílias em busca de casas em bairros residenciais, jovens profissionais
            interessados em apartamentos próximos a centros comerciais e investidores
            focados em valorização patrimonial de longo prazo.
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
