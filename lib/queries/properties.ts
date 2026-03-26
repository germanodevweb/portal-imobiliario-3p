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
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
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
  isFeatured: true,
  isLaunch: true,
  isOpportunity: true,
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
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { citySlug, published: true },
    select: propertyCardSelect,
    // nulls: "first" garante que imóveis sem publishedAt preenchido
    // apareçam no topo ao invés de cair no final da listagem.
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
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
export const getAvailableCities = cache(async function (): Promise<CityEntry[]> {
  const results = await prisma.property.findMany({
    where: { published: true },
    select: { city: true, citySlug: true },
    distinct: ["citySlug"],
    orderBy: { city: "asc" },
  });

  return results;
});

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
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { neighborhoodSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
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
export const getAvailableNeighborhoods = cache(async function (): Promise<
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
});

// ---------------------------------------------------------------------------
// Queries para /tipo/[slug]
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por tipo.
 * Usado em: /tipo/[slug]
 */
export const getPublishedPropertiesByPropertyTypeSlug = cache(async function (
  propertyTypeSlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { propertyTypeSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
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
export const getAvailablePropertyTypes = cache(async function (): Promise<
  PropertyTypeEntry[]
> {
  return prisma.property.findMany({
    where: { published: true },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });
});

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
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { propertyTypeSlug: typeSlug, citySlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
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
export type PropertyImageWithAlt = {
  url: string;
  alt: string | null;
};

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
  featuredImageAlt: string | null;
  galleryImages: string[];
  /** Imagens com alt para SEO (ordem: principal primeiro, depois sortOrder) */
  images: PropertyImageWithAlt[];
  youtubeVideoId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  isFeatured: boolean;
  isLaunch: boolean;
  isOpportunity: boolean;
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
      featuredImageAlt: true,
      galleryImages: true,
      images: {
        select: { url: true, alt: true },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      youtubeVideoId: true,
      metaTitle: true,
      metaDescription: true,
      ogImage: true,
      isFeatured: true,
      isLaunch: true,
      isOpportunity: true,
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
export const getSimilarProperties = cache(async function (
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
});

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
// Queries de enriquecimento — faixa de preço e tipo predominante
// Usadas para diferenciar o conteúdo semântico de cada página programática,
// reduzindo risco de "thin content" entre páginas da mesma categoria.
// ---------------------------------------------------------------------------

export type PriceRange = { minPrice: string; maxPrice: string } | null;

/**
 * Faixa de preço (mín/máx) para imóveis publicados em uma cidade.
 * Usa aggregate com índice composto — query leve.
 */
export const getPriceRangeByCitySlug = cache(async function (
  citySlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { citySlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Faixa de preço para imóveis publicados em um bairro.
 */
export const getPriceRangeByNeighborhoodSlug = cache(async function (
  neighborhoodSlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { neighborhoodSlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Faixa de preço para um tipo de imóvel específico.
 */
export const getPriceRangeByPropertyTypeSlug = cache(async function (
  propertyTypeSlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { propertyTypeSlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Faixa de preço para um tipo de imóvel em uma cidade específica.
 */
export const getPriceRangeByTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { propertyTypeSlug: typeSlug, citySlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Tipo de imóvel mais frequente em uma cidade.
 * Retorna o propertyTypeSlug com maior contagem de publicados.
 */
export const getMostCommonTypeByCitySlug = cache(async function (
  citySlug: string
): Promise<string | null> {
  const result = await prisma.property.groupBy({
    by: ["propertyTypeSlug"],
    where: { citySlug, published: true },
    _count: { propertyTypeSlug: true },
    orderBy: { _count: { propertyTypeSlug: "desc" } },
    take: 1,
  });
  return result[0]?.propertyTypeSlug ?? null;
});

/**
 * Tipo de imóvel mais frequente em um bairro.
 */
export const getMostCommonTypeByNeighborhoodSlug = cache(async function (
  neighborhoodSlug: string
): Promise<string | null> {
  const result = await prisma.property.groupBy({
    by: ["propertyTypeSlug"],
    where: { neighborhoodSlug, published: true },
    _count: { propertyTypeSlug: true },
    orderBy: { _count: { propertyTypeSlug: "desc" } },
    take: 1,
  });
  return result[0]?.propertyTypeSlug ?? null;
});

// ---------------------------------------------------------------------------
// Queries para /estado/[stateSlug]/cidade/[citySlug]
// ---------------------------------------------------------------------------

/**
 * Contexto da cidade a partir do citySlug: nome de exibição + stateSlug do banco.
 * Usado para validar que a cidade pertence ao estado informado na URL.
 * Retorna null se não houver imóveis publicados para o citySlug.
 */
export async function getCityContext(
  citySlug: string
): Promise<{ city: string; stateSlug: string; state: string } | null> {
  const result = await prisma.property.findFirst({
    where: { citySlug, published: true },
    select: { city: true, stateSlug: true, state: true },
  });
  if (!result) return null;
  return { city: result.city, stateSlug: result.stateSlug, state: result.state };
}

/**
 * Imóveis publicados filtrados por estado E cidade simultaneamente.
 * O filtro duplo garante que URLs manipuladas (estado errado) retornem 0 resultados.
 * Usado em: /estado/[stateSlug]/cidade/[citySlug]
 */
export const getPublishedPropertiesByStateAndCity = cache(async function (
  stateSlug: string,
  citySlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { stateSlug, citySlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });
  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados para um estado + cidade específicos.
 * Usado em: governança de indexação, meta description.
 */
export const countPublishedPropertiesByStateAndCity = cache(async function (
  stateSlug: string,
  citySlug: string
): Promise<number> {
  return prisma.property.count({
    where: { stateSlug, citySlug, published: true },
  });
});

/**
 * Pares válidos (stateSlug, citySlug) com imóveis publicados.
 * Usado em: generateStaticParams de /estado/[stateSlug]/cidade/[citySlug] e sitemap.
 */
export async function getAvailableStateCityPairs(): Promise<
  { stateSlug: string; citySlug: string }[]
> {
  return prisma.property.findMany({
    where: { published: true },
    select: { stateSlug: true, citySlug: true },
    distinct: ["stateSlug", "citySlug"],
    orderBy: [{ stateSlug: "asc" }, { citySlug: "asc" }],
  });
}

// ---------------------------------------------------------------------------
// Queries para /estado/[stateSlug]
// ---------------------------------------------------------------------------

/**
 * Nome de exibição do estado a partir do slug.
 * Usa findFirst com índice stateSlug — query leve de verificação de existência.
 */
export async function getStateContext(
  stateSlug: string
): Promise<{ state: string } | null> {
  const result = await prisma.property.findFirst({
    where: { stateSlug, published: true },
    select: { state: true },
  });
  if (!result) return null;
  return { state: result.state };
}

/**
 * Imóveis publicados filtrados por estado.
 * Usado em: /estado/[stateSlug]
 */
export const getPublishedPropertiesByStateSlug = cache(async function (
  stateSlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { stateSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados em um estado.
 * Usado em: governança de indexação, meta description.
 */
export const countPublishedPropertiesByStateSlug = cache(async function (
  stateSlug: string
): Promise<number> {
  return prisma.property.count({
    where: { stateSlug, published: true },
  });
});

/**
 * Cidades com imóveis publicados em um estado.
 * Usado em: grid de cidades em /estado/[stateSlug].
 */
export async function getCitiesByStateSlug(stateSlug: string): Promise<CityEntry[]> {
  return prisma.property.findMany({
    where: { stateSlug, published: true },
    select: { city: true, citySlug: true },
    distinct: ["citySlug"],
    orderBy: { city: "asc" },
  });
}

/**
 * Faixa de preço para imóveis publicados em um estado.
 * Usado em: bloco de dados semânticos em /estado/[stateSlug].
 */
export const getPriceRangeByStateSlug = cache(async function (
  stateSlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { stateSlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Lista de estados com imóveis publicados.
 * Usado em: generateStaticParams de /estado/[stateSlug] e sitemap.
 */
export async function getAvailableStates(): Promise<
  { stateSlug: string; state: string }[]
> {
  return prisma.property.findMany({
    where: { published: true },
    select: { stateSlug: true, state: true },
    distinct: ["stateSlug"],
    orderBy: { state: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Queries para /bairro/[slug]/tipo/[typeSlug]
// ---------------------------------------------------------------------------

/**
 * Imóveis publicados filtrados por bairro e tipo.
 * Usado em: /bairro/[slug]/tipo/[typeSlug]
 */
export const getPublishedPropertiesByNeighborhoodAndType = cache(async function (
  neighborhoodSlug: string,
  propertyTypeSlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: { neighborhoodSlug, propertyTypeSlug, published: true },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis publicados em um bairro para um tipo específico.
 * Usado em: governança de indexação, metadata.
 */
export const countPublishedPropertiesByNeighborhoodAndType = cache(async function (
  neighborhoodSlug: string,
  propertyTypeSlug: string
): Promise<number> {
  return prisma.property.count({
    where: { neighborhoodSlug, propertyTypeSlug, published: true },
  });
});

/**
 * Faixa de preço para imóveis de um tipo em um bairro específico.
 * Usado em: bloco de dados semânticos em /bairro/[slug]/tipo/[typeSlug].
 */
export const getPriceRangeByNeighborhoodAndType = cache(async function (
  neighborhoodSlug: string,
  propertyTypeSlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: { neighborhoodSlug, propertyTypeSlug, published: true },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Pares válidos (citySlug, neighborhoodSlug) com imóveis publicados.
 * Usado em: generateStaticParams de /cidade/[citySlug]/bairro/[slug] e sitemap.
 */
export async function getAvailableCityNeighborhoodPairs(): Promise<
  { citySlug: string; neighborhoodSlug: string }[]
> {
  const results = await prisma.property.findMany({
    where: { published: true, neighborhoodSlug: { not: null } },
    select: { citySlug: true, neighborhoodSlug: true },
    distinct: ["citySlug", "neighborhoodSlug"],
  });

  return results.filter(
    (r): r is { citySlug: string; neighborhoodSlug: string } =>
      r.neighborhoodSlug !== null
  );
}

/**
 * Pares válidos (neighborhoodSlug, propertyTypeSlug) com imóveis publicados.
 * Usado em: generateStaticParams de /bairro/[slug]/tipo/[typeSlug] e sitemap.
 */
export async function getAvailableNeighborhoodTypePairs(): Promise<
  { neighborhoodSlug: string; propertyTypeSlug: string }[]
> {
  const results = await prisma.property.findMany({
    where: { published: true, neighborhoodSlug: { not: null } },
    select: { neighborhoodSlug: true, propertyTypeSlug: true },
    distinct: ["neighborhoodSlug", "propertyTypeSlug"],
  });

  return results.filter(
    (r): r is { neighborhoodSlug: string; propertyTypeSlug: string } =>
      r.neighborhoodSlug !== null
  );
}

// ---------------------------------------------------------------------------
// Queries para /comprar/[typeSlug]/[citySlug] e /comprar/[typeSlug]/[citySlug]/[neighborhoodSlug]
// Intenção comercial: apenas imóveis à venda (transactionType = SALE).
// ---------------------------------------------------------------------------

const SALE_WHERE = { transactionType: "SALE" as const } as const;

/**
 * Imóveis à venda filtrados por tipo e cidade.
 * Usado em: /comprar/[typeSlug]/[citySlug]
 */
export const getPublishedPropertiesByBuyTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      published: true,
      ...SALE_WHERE,
    },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });
  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis à venda de um tipo em uma cidade.
 */
export const countPublishedPropertiesByBuyTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string
): Promise<number> {
  return prisma.property.count({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      published: true,
      ...SALE_WHERE,
    },
  });
});

/**
 * Contexto tipo+cidade para comprar: nome da cidade.
 * Retorna null se não houver imóveis à venda para essa combinação.
 */
export async function getBuyTypeCityContext(
  typeSlug: string,
  citySlug: string
): Promise<{ city: string } | null> {
  return prisma.property.findFirst({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      published: true,
      ...SALE_WHERE,
    },
    select: { city: true },
  });
}

/**
 * Faixa de preço para imóveis à venda de um tipo em uma cidade.
 */
export const getPriceRangeByBuyTypeAndCity = cache(async function (
  typeSlug: string,
  citySlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      published: true,
      ...SALE_WHERE,
    },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Pares (typeSlug, citySlug) com imóveis à venda.
 * Usado em: generateStaticParams de /comprar/[typeSlug]/[citySlug].
 */
export async function getAvailableBuyTypeCityPairs(): Promise<
  { propertyTypeSlug: string; citySlug: string }[]
> {
  return prisma.property.findMany({
    where: { published: true, ...SALE_WHERE },
    select: { propertyTypeSlug: true, citySlug: true },
    distinct: ["propertyTypeSlug", "citySlug"],
    orderBy: [{ propertyTypeSlug: "asc" }, { citySlug: "asc" }],
  });
}

/**
 * Bairros com imóveis à venda de um tipo em uma cidade.
 * Usado em: links internos /comprar/[type]/[city]/[neighborhood].
 */
export async function getNeighborhoodsWithSaleByTypeAndCity(
  typeSlug: string,
  citySlug: string
): Promise<NeighborhoodEntry[]> {
  return prisma.property.findMany({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      published: true,
      neighborhoodSlug: { not: null },
      ...SALE_WHERE,
    },
    select: { neighborhood: true, neighborhoodSlug: true },
    distinct: ["neighborhoodSlug"],
    orderBy: { neighborhood: "asc" },
  });
}

/**
 * Tipos de imóvel com imóveis à venda em uma cidade.
 * Usado em: links internos /comprar/[otherType]/[city].
 */
export async function getPropertyTypesWithSaleByCity(
  citySlug: string
): Promise<PropertyTypeEntry[]> {
  return prisma.property.findMany({
    where: { citySlug, published: true, ...SALE_WHERE },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });
}

/**
 * Imóveis à venda filtrados por tipo, cidade e bairro.
 * Usado em: /comprar/[typeSlug]/[citySlug]/[neighborhoodSlug]
 */
export const getPublishedPropertiesByBuyTypeCityAndNeighborhood = cache(async function (
  typeSlug: string,
  citySlug: string,
  neighborhoodSlug: string,
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      neighborhoodSlug,
      published: true,
      ...SALE_WHERE,
    },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });
  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Total de imóveis à venda de um tipo em um bairro de uma cidade.
 */
export const countPublishedPropertiesByBuyTypeCityAndNeighborhood = cache(async function (
  typeSlug: string,
  citySlug: string,
  neighborhoodSlug: string
): Promise<number> {
  return prisma.property.count({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      neighborhoodSlug,
      published: true,
      ...SALE_WHERE,
    },
  });
});

/**
 * Contexto tipo+cidade+bairro para comprar.
 * Valida hierarquia: bairro pertence à cidade e existe estoque à venda.
 */
export async function getBuyTypeCityNeighborhoodContext(
  typeSlug: string,
  citySlug: string,
  neighborhoodSlug: string
): Promise<{ city: string; neighborhood: string; citySlug: string } | null> {
  const result = await prisma.property.findFirst({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      neighborhoodSlug,
      published: true,
      ...SALE_WHERE,
    },
    select: { city: true, neighborhood: true, citySlug: true },
  });
  if (!result?.neighborhood) return null;
  return result as { city: string; neighborhood: string; citySlug: string };
}

/**
 * Faixa de preço para imóveis à venda de um tipo em um bairro de uma cidade.
 */
export const getPriceRangeByBuyTypeCityAndNeighborhood = cache(async function (
  typeSlug: string,
  citySlug: string,
  neighborhoodSlug: string
): Promise<PriceRange> {
  const agg = await prisma.property.aggregate({
    where: {
      propertyTypeSlug: typeSlug,
      citySlug,
      neighborhoodSlug,
      published: true,
      ...SALE_WHERE,
    },
    _min: { price: true },
    _max: { price: true },
  });
  if (!agg._min.price || !agg._max.price) return null;
  return { minPrice: String(agg._min.price), maxPrice: String(agg._max.price) };
});

/**
 * Triplas (typeSlug, citySlug, neighborhoodSlug) com imóveis à venda.
 * Usado em: generateStaticParams de /comprar/[typeSlug]/[citySlug]/[neighborhoodSlug].
 */
export async function getAvailableBuyTypeCityNeighborhoodTriples(): Promise<
  { propertyTypeSlug: string; citySlug: string; neighborhoodSlug: string }[]
> {
  const results = await prisma.property.findMany({
    where: { published: true, neighborhoodSlug: { not: null }, ...SALE_WHERE },
    select: { propertyTypeSlug: true, citySlug: true, neighborhoodSlug: true },
    distinct: ["propertyTypeSlug", "citySlug", "neighborhoodSlug"],
    orderBy: [
      { propertyTypeSlug: "asc" },
      { citySlug: "asc" },
      { neighborhoodSlug: "asc" },
    ],
  });
  return results.filter(
    (r): r is { propertyTypeSlug: string; citySlug: string; neighborhoodSlug: string } =>
      r.neighborhoodSlug !== null
  );
}

/**
 * Outros tipos à venda no mesmo bairro de uma cidade.
 * Filtra por citySlug + neighborhoodSlug para validar hierarquia.
 */
export async function getPropertyTypesWithSaleByCityAndNeighborhood(
  citySlug: string,
  neighborhoodSlug: string
): Promise<PropertyTypeEntry[]> {
  return prisma.property.findMany({
    where: {
      citySlug,
      neighborhoodSlug,
      published: true,
      ...SALE_WHERE,
    },
    select: { propertyTypeSlug: true },
    distinct: ["propertyTypeSlug"],
    orderBy: { propertyTypeSlug: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Query de busca com filtros — /imoveis?cidade=...&tipo=...&quartos=...
// ---------------------------------------------------------------------------

/**
 * Filtros aceitos pela busca geral de imóveis em /imoveis.
 * Todos os campos são opcionais — combinação condicional no WHERE do Prisma.
 */
export type PropertyFilters = {
  citySlug?: string;
  neighborhoodSlug?: string;
  propertyTypeSlug?: string;
  // bedrooms: valor exato 1-3, ou 4 representa "4 ou mais"
  bedrooms?: number;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: boolean;
  isLaunch?: boolean;
  isOpportunity?: boolean;
};

/**
 * Imóveis publicados com filtros condicionais.
 * Cada campo presente no filtro adiciona uma cláusula AND ao WHERE.
 * Campos ausentes não afetam a query.
 * Usado em: /imoveis com query params.
 */
export const getFilteredProperties = cache(async function (
  filters: PropertyFilters,
  limit = 24,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: {
      published: true,
      ...(filters.citySlug ? { citySlug: filters.citySlug } : {}),
      ...(filters.neighborhoodSlug ? { neighborhoodSlug: filters.neighborhoodSlug } : {}),
      ...(filters.propertyTypeSlug ? { propertyTypeSlug: filters.propertyTypeSlug } : {}),
      ...(filters.bedrooms !== undefined
        ? { bedrooms: filters.bedrooms >= 4 ? { gte: 4 } : filters.bedrooms }
        : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            price: {
              ...(filters.minPrice ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.isFeatured === true ? { isFeatured: true } : {}),
      ...(filters.isLaunch === true ? { isLaunch: true } : {}),
      ...(filters.isOpportunity === true ? { isOpportunity: true } : {}),
    },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    take: limit,
    ...(skip > 0 ? { skip } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

/**
 * Contagem de imóveis com os mesmos filtros condicionais.
 * Usado em: exibição do total na listagem, generateMetadata.
 */
export const countFilteredProperties = cache(async function (
  filters: PropertyFilters
): Promise<number> {
  return prisma.property.count({
    where: {
      published: true,
      ...(filters.citySlug ? { citySlug: filters.citySlug } : {}),
      ...(filters.neighborhoodSlug ? { neighborhoodSlug: filters.neighborhoodSlug } : {}),
      ...(filters.propertyTypeSlug ? { propertyTypeSlug: filters.propertyTypeSlug } : {}),
      ...(filters.bedrooms !== undefined
        ? { bedrooms: filters.bedrooms >= 4 ? { gte: 4 } : filters.bedrooms }
        : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            price: {
              ...(filters.minPrice ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.isFeatured === true ? { isFeatured: true } : {}),
      ...(filters.isLaunch === true ? { isLaunch: true } : {}),
      ...(filters.isOpportunity === true ? { isOpportunity: true } : {}),
    },
  });
});

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

// ---------------------------------------------------------------------------
// Apartamentos de Alto Padrão — acima de R$ 1,5 milhão
// Usado em: /imoveis/alto-padrao
// ---------------------------------------------------------------------------

const ALTO_PADRAO_MIN_PRICE = "1500000";

export const getAltoPadraoApartments = cache(async function (
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: {
      published: true,
      isSold: false,
      type: "APARTAMENTO",
      price: { gte: ALTO_PADRAO_MIN_PRICE },
    },
    select: propertyCardSelect,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

export const countAltoPadraoApartments = cache(async function (): Promise<number> {
  return prisma.property.count({
    where: {
      published: true,
      isSold: false,
      type: "APARTAMENTO",
      price: { gte: ALTO_PADRAO_MIN_PRICE },
    },
  });
});

// ---------------------------------------------------------------------------
// Investimento — vitrine de imóveis a partir de R$ 350.000
// Usado em: /investir-no-brasil, /en/invest-in-brazil, /fr/investir-au-bresil, /es/invertir-en-brasil
// Filtro: published, não vendidos, price >= 350000.
// ---------------------------------------------------------------------------

const INVESTMENT_MIN_PRICE = "350000";

export const getInternationalInvestmentProperties = cache(async function (
  limit?: number,
  skip = 0
): Promise<PropertyCardData[]> {
  const results = await prisma.property.findMany({
    where: {
      published: true,
      isSold: false,
      price: { gte: INVESTMENT_MIN_PRICE },
    },
    select: propertyCardSelect,
    orderBy: [
      { isLaunch: "desc" },
      { publishedAt: { sort: "desc", nulls: "first" } },
      { createdAt: "desc" },
    ],
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip > 0 ? { skip } : {}),
  });

  return results.map((p) => ({ ...p, price: String(p.price) }));
});

export const countInternationalInvestmentProperties = cache(async function (): Promise<number> {
  return prisma.property.count({
    where: {
      published: true,
      isSold: false,
      price: { gte: INVESTMENT_MIN_PRICE },
    },
  });
});
