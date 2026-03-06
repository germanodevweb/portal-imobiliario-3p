import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByPropertyTypeSlug,
  countPublishedPropertiesByPropertyTypeSlug,
  getCitiesByPropertyTypeSlug,
  getNeighborhoodsByPropertyTypeSlug,
  getAvailablePropertyTypes,
} from "@/lib/queries/properties";
import {
  buildPropertyTypeListTitle,
  buildPropertyTypeListDescription,
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
// SSG: pré-gera rotas para tipos com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const types = await getAvailablePropertyTypes();
  return types.map((t) => ({ slug: t.propertyTypeSlug }));
}

// ---------------------------------------------------------------------------
// Metadata programática por tipo
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const count = await countPublishedPropertiesByPropertyTypeSlug(slug);
  const evaluation = evaluateIndexation({ pageType: "propertyType", publishedCount: count });

  if (!evaluation.shouldExist) {
    return { title: "Tipo de imóvel não encontrado | 3Pinheiros" };
  }

  const typeName = getPropertyTypeLabel(slug);
  const title = buildPropertyTypeListTitle(typeName);
  const description = buildPropertyTypeListDescription(typeName, count);
  const canonical = buildCanonicalUrl(`/tipo/${slug}`);

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

export default async function TipoPage({ params }: PageProps) {
  const { slug } = await params;

  const count = await countPublishedPropertiesByPropertyTypeSlug(slug);
  const evaluation = evaluateIndexation({ pageType: "propertyType", publishedCount: count });
  if (!evaluation.shouldExist) notFound();

  const typeName = getPropertyTypeLabel(slug);

  const [properties, cities, neighborhoods] = await Promise.all([
    getPublishedPropertiesByPropertyTypeSlug(slug, PROPERTIES_LIMIT),
    getCitiesByPropertyTypeSlug(slug),
    getNeighborhoodsByPropertyTypeSlug(slug),
  ]);

  const canonical = buildCanonicalUrl(`/tipo/${slug}`);
  const description = buildPropertyTypeListDescription(typeName, count);

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
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${typeName} à Venda`,
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
    name: `${typeName} à Venda`,
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
          <span className="font-medium text-zinc-800">{typeName}</span>
        </nav>

        {/* H1 semântico com contagem */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {count} {count !== 1 ? `${typeName.toLowerCase()} disponíveis` : `${typeName.toLowerCase().replace(/s$/, "")} disponível`}
        </h1>

        {/* Texto introdutório contextual */}
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
          Explore nossa seleção de {typeName.toLowerCase()} à venda com fotos,
          preços atualizados e informações completas. Consultoria especializada
          pela 3Pinheiros para compra, venda e investimento. CRECI 1317J.
        </p>

        {/* Grid de imóveis */}
        <section className="mt-10" aria-label={`Listagem de ${typeName.toLowerCase()}`}>
          <PropertyList properties={properties} />

          {count > PROPERTIES_LIMIT && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              Exibindo {PROPERTIES_LIMIT} de {count}{" "}
              {count !== 1 ? typeName.toLowerCase() : typeName.toLowerCase().replace(/s$/, "")}.
            </p>
          )}
        </section>

        {/* Links para cidades — silo: tipo → cidade */}
        {cities.length > 0 && (
          <section className="mt-14" aria-label={`Cidades com ${typeName.toLowerCase()}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              {typeName} por cidade
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Filtre por localização e encontre {typeName.toLowerCase()} na sua cidade.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.citySlug}>
                  <Link
                    href={`/cidade/${c.citySlug}`}
                    className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:border-green-700 hover:text-green-700"
                  >
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Links para bairros — silo: tipo → bairro */}
        {neighborhoods.length > 0 && (
          <section className="mt-10" aria-label={`Bairros com ${typeName.toLowerCase()}`}>
            <h2 className="text-lg font-semibold text-zinc-900">
              {typeName} por bairro
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore {typeName.toLowerCase()} disponíveis em bairros específicos.
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

        {/* Bloco de contexto semântico — reforça relevância topical do tipo */}
        <section
          className="mt-14 rounded-xl bg-green-50 p-6 sm:p-8"
          aria-label={`Consultoria para ${typeName.toLowerCase()}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Consultoria especializada em {typeName.toLowerCase()}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A 3Pinheiros tem ampla experiência na negociação de{" "}
            {typeName.toLowerCase()} em São Paulo e região. Nossa equipe
            analisa o perfil do comprador, identifica as melhores opções do
            mercado e acompanha todo o processo: da visita ao imóvel até a
            assinatura do contrato e entrega das chaves.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Atendemos compradores, vendedores e investidores com foco em
            transparência, agilidade e resultado. Financiamento habitacional,
            análise jurídica e assessoria completa em cada negociação.
            CRECI 1317J.
          </p>

          {/* Links internos: tipo → imóveis → contato */}
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
