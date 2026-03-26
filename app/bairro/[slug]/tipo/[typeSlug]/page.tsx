import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { PropertyList } from "@/app/components/PropertyList";
import {
  getPublishedPropertiesByNeighborhoodAndType,
  countPublishedPropertiesByNeighborhoodAndType,
  getNeighborhoodContext,
  getAvailableNeighborhoodTypePairs,
} from "@/lib/queries/properties";
import {
  buildNeighborhoodTypePageTitle,
  buildNeighborhoodTypePageDescription,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  getPropertyTypeLabel,
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

type PageProps = {
  params: Promise<{ slug: string; typeSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ---------------------------------------------------------------------------
// SSG: pré-gera combinações bairro+tipo com imóveis publicados
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const pairs = await getAvailableNeighborhoodTypePairs();
  return pairs.map((p) => ({
    slug: p.neighborhoodSlug,
    typeSlug: p.propertyTypeSlug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata programática por bairro+tipo
// ---------------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug: neighborhoodSlug, typeSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);

  const [context, count] = await Promise.all([
    getNeighborhoodContext(neighborhoodSlug),
    countPublishedPropertiesByNeighborhoodAndType(neighborhoodSlug, typeSlug),
  ]);

  const evaluation = evaluateIndexation({
    pageType: "neighborhoodType",
    publishedCount: count,
  });

  if (!evaluation.shouldExist || !context) {
    return { title: "Página não encontrada | 3Pinheiros" };
  }

  const typeName = getPropertyTypeLabel(typeSlug);
  const { neighborhood, city } = context;
  const baseTitle = buildNeighborhoodTypePageTitle(typeName, neighborhood, city);
  const title = buildPageTitle(baseTitle, page);
  const description = buildNeighborhoodTypePageDescription(typeName, neighborhood, city, count);
  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/bairro/${neighborhoodSlug}/tipo/${typeSlug}`),
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

export default async function BairroTipoPage({ params, searchParams }: PageProps) {
  const { slug: neighborhoodSlug, typeSlug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = getSkip(page);

  const [context, count] = await Promise.all([
    getNeighborhoodContext(neighborhoodSlug),
    countPublishedPropertiesByNeighborhoodAndType(neighborhoodSlug, typeSlug),
  ]);

  const evaluation = evaluateIndexation({
    pageType: "neighborhoodType",
    publishedCount: count,
  });

  if (!evaluation.shouldExist || !context) notFound();

  const { neighborhood, city, citySlug } = context;
  const typeName = getPropertyTypeLabel(typeSlug);
  const totalPages = calculateTotalPages(count);

  const properties = await getPublishedPropertiesByNeighborhoodAndType(
    neighborhoodSlug,
    typeSlug,
    PROPERTIES_LIMIT,
    skip
  );

  const canonical = buildPaginatedCanonical(
    buildCanonicalUrl(`/bairro/${neighborhoodSlug}/tipo/${typeSlug}`),
    page
  );

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-green-700">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/imoveis" className="transition-colors hover:text-green-700">
            Imóveis
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/cidade/${citySlug}`} className="transition-colors hover:text-green-700">
            {city}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/bairro/${neighborhoodSlug}`} className="transition-colors hover:text-green-700">
            {neighborhood}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-zinc-800">{typeName}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {typeName} à Venda no {neighborhood}, {city}
          </h1>
          <p className="mt-2 text-zinc-600">
            {count === 0
              ? "Nenhum imóvel encontrado."
              : `${count} ${typeName.toLowerCase()}${count !== 1 ? "s" : ""} no ${neighborhood}`}
          </p>
        </div>

        {count > 0 ? (
          <>
            <PropertyList properties={properties} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/bairro/${neighborhoodSlug}/tipo/${typeSlug}`}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <p className="text-zinc-600">Nenhum {typeName.toLowerCase()} disponível no {neighborhood}.</p>
            <Link
              href={`/bairro/${neighborhoodSlug}`}
              className="mt-4 inline-flex rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              Ver todos os imóveis no {neighborhood}
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
