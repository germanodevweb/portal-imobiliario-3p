import { cache } from "react";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos derivados das queries — sem `any`, sem duplicação de schema
// ---------------------------------------------------------------------------

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  neighborhood: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  featuredImage: string | null;
};

export type CityEntry = {
  city: string;
  citySlug: string;
};

export type NeighborhoodEntry = {
  neighborhood: string | null;
  neighborhoodSlug: string | null;
};

export type PropertyTypeEntry = {
  propertyTypeSlug: string;
};

// ---------------------------------------------------------------------------
// Seleção reutilizável para cards de imóvel
// Evita transferir campos pesados (galleryImages, description, etc.)
// ---------------------------------------------------------------------------

const propertyCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  city: true,
  neighborhood: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  featuredImage: true,
} as const;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por cidade.
 * Usado em: /cidade/[slug], home em destaque futuramente segmentada.
 */
export const getPublishedPropertiesByCitySlug = cache(async function (
  citySlug: string,
  limit?: number
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { citySlug, published: true },
    select: propertyCardSelect,
    // nulls: "first" garante que imóveis sem publishedAt preenchido
    // apareçam no topo ao invés de cair no final da listagem.
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados em uma cidade.
 * Usado em: meta description, h1, breadcrumb de contagem.
 */
export const countPublishedPropertiesByCitySlug = cache(async function (
  citySlug: string
): Promise<number> {
  return prisma.property.count({
    where: { citySlug, published: true },
  });
});

/**
 * Lista deduplicada de cidades com imóveis publicados.
 * Usado em: sitemap, navegação programática, links internos.
 */
export async function getAvailableCities(): Promise<CityEntry[]> {
  const results = await prisma.property.findMany({
    where: { published: true },
    select: { city: true, citySlug: true },
    distinct: ["citySlug"],
    orderBy: { city: "asc" },
  });

  return results;
}

/**
 * Bairros disponíveis em uma cidade com imóveis publicados.
 * Usado em: faceted navigation, links internos /bairro/[slug].
 */
export async function getRelatedNeighborhoodsByCitySlug(
  citySlug: string
): Promise<NeighborhoodEntry[]> {
  const results = await prisma.property.findMany({
    where: {
      citySlug,
      published: true,
      neighborhoodSlug: { not: null },
    },
    select: { neighborhood: true, neighborhoodSlug: true },
    distinct: ["neighborhoodSlug"],
    orderBy: { neighborhood: "asc" },
  });

  return results;
}

/**
 * Tipos de imóvel disponíveis em uma cidade.
 * Usado em: filtros programáticos, links /tipo/[slug] por cidade.
 */
export async function getAvailablePropertyTypesByCitySlug(
  citySlug: string
): Promise<PropertyTypeEntry[]> {
  const results = await prisma.property.findMany({
    where: { citySlug, published: true },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });

  return results;
}

// ---------------------------------------------------------------------------
// Queries para /bairro/[slug]
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por bairro.
 * Usado em: /bairro/[slug]
 */
export const getPublishedPropertiesByNeighborhoodSlug = cache(async function (
  neighborhoodSlug: string,
  limit?: number
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { neighborhoodSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados em um bairro.
 * Usado em: meta description, h1, critério de indexação.
 */
export const countPublishedPropertiesByNeighborhoodSlug = cache(async function (
  neighborhoodSlug: string
): Promise<number> {
  return prisma.property.count({
    where: { neighborhoodSlug, published: true },
  });
});

/**
 * Retorna o contexto de exibição de um bairro a partir do slug:
 * nome do bairro, nome da cidade e citySlug para o link de retorno.
 * Usa findFirst no índice de neighborhoodSlug — query leve.
 */
export async function getNeighborhoodContext(
  neighborhoodSlug: string
): Promise<{ neighborhood: string; city: string; citySlug: string } | null> {
  const result = await prisma.property.findFirst({
    where: { neighborhoodSlug, published: true },
    select: { neighborhood: true, city: true, citySlug: true },
  });

  if (!result?.neighborhood) return null;
  return result as { neighborhood: string; city: string; citySlug: string };
}

/**
 * Tipos de imóvel disponíveis em um bairro.
 * Usado em: links internos bairro → tipo.
 */
export async function getAvailablePropertyTypesByNeighborhoodSlug(
  neighborhoodSlug: string
): Promise<PropertyTypeEntry[]> {
  return prisma.property.findMany({
    where: { neighborhoodSlug, published: true },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });
}

/**
 * Lista deduplicada de bairros com imóveis publicados.
 * Usado em: generateStaticParams de /bairro/[slug].
 */
export async function getAvailableNeighborhoods(): Promise<
  { neighborhoodSlug: string; neighborhood: string }[]
> {
  const results = await prisma.property.findMany({
    where: { published: true, neighborhoodSlug: { not: null } },
    select: { neighborhoodSlug: true, neighborhood: true },
    distinct: ["neighborhoodSlug"],
    orderBy: { neighborhood: "asc" },
  });

  return results.filter(
    (r): r is { neighborhoodSlug: string; neighborhood: string } =>
      r.neighborhoodSlug !== null && r.neighborhood !== null
  );
}

// ---------------------------------------------------------------------------
// Queries para /tipo/[slug]
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por tipo.
 * Usado em: /tipo/[slug]
 */
export const getPublishedPropertiesByPropertyTypeSlug = cache(async function (
  propertyTypeSlug: string,
  limit?: number
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { propertyTypeSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados de um tipo.
 * Usado em: meta description, h1, critério de indexação.
 */
export const countPublishedPropertiesByPropertyTypeSlug = cache(async function (
  propertyTypeSlug: string
): Promise<number> {
  return prisma.property.count({
    where: { propertyTypeSlug, published: true },
  });
});

/**
 * Cidades que possuem imóveis publicados de um determinado tipo.
 * Usado em: links internos tipo → cidade.
 */
export async function getCitiesByPropertyTypeSlug(
  propertyTypeSlug: string
): Promise<CityEntry[]> {
  return prisma.property.findMany({
    where: { propertyTypeSlug, published: true },
    select: { city: true, citySlug: true },
    distinct: ["citySlug"],
    orderBy: { city: "asc" },
  });
}

/**
 * Bairros que possuem imóveis publicados de um determinado tipo.
 * Usado em: links internos tipo → bairro.
 */
export async function getNeighborhoodsByPropertyTypeSlug(
  propertyTypeSlug: string
): Promise<NeighborhoodEntry[]> {
  return prisma.property.findMany({
    where: {
      propertyTypeSlug,
      published: true,
      neighborhoodSlug: { not: null },
    },
    select: { neighborhood: true, neighborhoodSlug: true },
    distinct: ["neighborhoodSlug"],
    orderBy: { neighborhood: "asc" },
  });
}

/**
 * Lista deduplicada de tipos com imóveis publicados.
 * Usado em: generateStaticParams de /tipo/[slug].
 */
export async function getAvailablePropertyTypes(): Promise<PropertyTypeEntry[]> {
  return prisma.property.findMany({
    where: { published: true },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Queries para /tipo/[slug]/cidade/[citySlug]
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por tipo E cidade simultaneamente.
 * Usado em: /tipo/[typeSlug]/cidade/[citySlug]
 */
export const getPublishedPropertiesByTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string,
  limit?: number
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { propertyTypeSlug: typeSlug, citySlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados de um tipo em uma cidade específica.
 * Usado em: meta description, h1, critério de indexação.
 */
export const countPublishedPropertiesByTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string
): Promise<number> {
  return prisma.property.count({
    where: { propertyTypeSlug: typeSlug, citySlug, published: true },
  });
});

/**
 * Retorna o nome de exibição da cidade a partir do typeSlug + citySlug.
 * Usa findFirst com os dois índices — query leve de verificação de existência.
 * Retorna null se não há imóveis publicados para essa combinação.
 */
export async function getTypeCityContext(
  typeSlug: string,
  citySlug: string
): Promise<{ city: string } | null> {
  return prisma.property.findFirst({
    where: { propertyTypeSlug: typeSlug, citySlug, published: true },
    select: { city: true },
  });
}

/**
 * Todos os pares tipo+cidade com imóveis publicados.
 * Usado em: generateStaticParams de /tipo/[slug]/cidade/[citySlug].
 */
export async function getAvailableTypeCityPairs(): Promise<
  { propertyTypeSlug: string; citySlug: string }[]
> {
  return prisma.property.findMany({
    where: { published: true },
    select: { propertyTypeSlug: true, citySlug: true },
    distinct: ["propertyTypeSlug", "citySlug"],
    orderBy: [{ propertyTypeSlug: "asc" }, { citySlug: "asc" }],
  });
}

// ---------------------------------------------------------------------------
// Queries para /imoveis/[slug]
// ---------------------------------------------------------------------------

/**
 * Dados completos de um imóvel para a página de detalhe.
 * Inclui todos os campos de SEO on-page, mídia e localização.
 */
export type PropertyDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  transactionType: "SALE" | "RENT";
  price: string;
  city: string;
  neighborhood: string | null;
  state: string;
  citySlug: string;
  neighborhoodSlug: string | null;
  stateSlug: string;
  propertyTypeSlug: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area: number | null;
  featuredImage: string | null;
  galleryImages: string[];
  youtubeVideoId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  isFeatured: boolean;
  isSold: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

/**
 * Busca um imóvel publicado pelo slug com todos os campos necessários.
 * Envolto em React.cache para deduplicação entre generateMetadata e o componente.
 */
export const getPropertyBySlug = cache(async function (
  slug: string
): Promise<PropertyDetail | null> {
  const result = await prisma.property.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      transactionType: true,
      price: true,
      city: true,
      neighborhood: true,
      state: true,
      citySlug: true,
      neighborhoodSlug: true,
      stateSlug: true,
      propertyTypeSlug: true,
      bedrooms: true,
      bathrooms: true,
      garage: true,
      area: true,
      featuredImage: true,
      galleryImages: true,
      youtubeVideoId: true,
      metaTitle: true,
      metaDescription: true,
      ogImage: true,
      isFeatured: true,
      isSold: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!result) return null;
  return { ...result, price: String(result.price) } as PropertyDetail;
});

/**
 * Imóveis semelhantes ao imóvel atual com cascata semântica:
 * 1. Mesmo bairro  (mais relevante)
 * 2. Mesma cidade  (fallback regional)
 * 3. Mesmo tipo    (fallback categórico)
 *
 * Retorna vazio se não houver imóveis publicados em nenhum nível.
 */
export async function getSimilarProperties(
  opts: {
    currentSlug: string;
    neighborhoodSlug: string | null;
    citySlug: string;
    propertyTypeSlug: string;
  },
  limit = 4
): Promise<PropertyCardData[]> {
  const { currentSlug, neighborhoodSlug, citySlug, propertyTypeSlug } = opts;
  const exclude = { not: currentSlug };
  const order = [
    { publishedAt: { sort: "desc" as const, nulls: "first" as const } },
    { createdAt: "desc" as const },
  ];

  if (neighborhoodSlug) {
    const results = await prisma.property.findMany({
      where: { neighborhoodSlug, published: true, slug: exclude },
      select: propertyCardSelect,
      orderBy: order,
      take: limit,
    });
    if (results.length > 0) {
      return results.map((p) => ({ ...p, price: String(p.price) }));
    }
  }

  const byCity = await prisma.property.findMany({
    where: { citySlug, published: true, slug: exclude },
    select: propertyCardSelect,
    orderBy: order,
    take: limit,
  });
  if (byCity.length > 0) {
    return byCity.map((p) => ({ ...p, price: String(p.price) }));
  }

  const byType = await prisma.property.findMany({
    where: { propertyTypeSlug, published: true, slug: exclude },
    select: propertyCardSelect,
    orderBy: order,
    take: limit,
  });
  return byType.map((p) => ({ ...p, price: String(p.price) }));
}

// ---------------------------------------------------------------------------
// Query para feed Meta Catalog
// ---------------------------------------------------------------------------

/**
 * Campos mínimos necessários para o feed Meta Catalog (RSS 2.0 + namespace g:).
 * Sem galeria, sem campos SEO on-page — apenas o necessário para o feed.
 * Filtrar itens sem featuredImage antes de incluir no XML (Meta rejeita sem image_link).
 */
export type MetaFeedProperty = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: string;
  featuredImage: string | null;
  isSold: boolean;
  transactionType: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  city: string;
  neighborhood: string | null;
  citySlug: string;
  propertyTypeSlug: string;
  updatedAt: Date;
};

export async function getPropertiesForMetaFeed(): Promise<MetaFeedProperty[]> {
  const results = await prisma.property.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      featuredImage: true,
      isSold: true,
      transactionType: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      city: true,
      neighborhood: true,
      citySlug: true,
      propertyTypeSlug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
}

// ---------------------------------------------------------------------------
// Queries para sitemap
// ---------------------------------------------------------------------------

/**
 * Slugs e datas de atualização de imóveis publicados.
 * Intencionalmente leve: sem imagens, sem preços, sem descrições.
 * Usado em: sitemap.ts
 */
export async function getPublishedPropertySlugsForSitemap(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.property.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Todos os imóveis publicados ordenados por data de publicação.
 * Usado em: home, listagem geral, sitemap de imóveis.
 */
export const getAllPublishedProperties = cache(async function (
  limit?: number
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});
