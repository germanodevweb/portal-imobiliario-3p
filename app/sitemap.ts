import type { MetadataRoute } from "next";
import {
  getPublishedPropertySlugsForSitemap,
  getAvailableCities,
  getAvailableNeighborhoods,
  getAvailablePropertyTypes,
  getAvailableTypeCityPairs,
  getAvailableNeighborhoodTypePairs,
  getAvailableCityNeighborhoodPairs,
  getAvailableStates,
  getAvailableStateCityPairs,
  getAvailableBuyTypeCityPairs,
  getAvailableBuyTypeCityNeighborhoodTriples,
} from "@/lib/queries/properties";
import { getPublishedPostSlugsForSitemap } from "@/lib/queries/blog";
import { BASE_URL } from "@/lib/seo";
import { INVEST_ROUTES } from "@/lib/i18n/invest";

// Revalida o sitemap a cada hora via ISR.
// O Googlebot sempre receberá um snapshot recente sem pressionar o banco a cada request.
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Rotas estáticas — lastModified omitido intencionalmente.
// new Date() em nível de módulo congela no momento da carga do bundle,
// não reflete a data real de alteração do conteúdo.
// Omitir lastModified é mais honesto que enviar uma data imprecisa.
// ---------------------------------------------------------------------------

function buildStaticRoutes(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/imoveis`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/imoveis/alto-padrao`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/quem-somos`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contato`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}${INVEST_ROUTES.pt}`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}${INVEST_ROUTES.en}`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}${INVEST_ROUTES.fr}`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}${INVEST_ROUTES.es}`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}

// ---------------------------------------------------------------------------
// Sitemap principal — gerado a partir de dados reais do banco.
// Todas as queries rodam em paralelo em um único Promise.all.
//
// Estratégia de lastModified:
//   - Imóveis individuais → updatedAt real do banco (sinal preciso)
//   - Cidade, bairro, tipo → omitido (são agregações virtuais sem timestamp
//     próprio; new Date() seria um sinal falso para o Google)
// ---------------------------------------------------------------------------

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    propertySlugs,
    states,
    stateCityPairs,
    cities,
    neighborhoods,
    propertyTypes,
    typeCityPairs,
    neighborhoodTypePairs,
    cityNeighborhoodPairs,
    buyTypeCityPairs,
    buyTypeCityNeighborhoodTriples,
    postSlugs,
  ] = await Promise.all([
    getPublishedPropertySlugsForSitemap(),
    getAvailableStates(),
    getAvailableStateCityPairs(),
    getAvailableCities(),
    getAvailableNeighborhoods(),
    getAvailablePropertyTypes(),
    getAvailableTypeCityPairs(),
    getAvailableNeighborhoodTypePairs(),
    getAvailableCityNeighborhoodPairs(),
    getAvailableBuyTypeCityPairs(),
    getAvailableBuyTypeCityNeighborhoodTriples(),
    getPublishedPostSlugsForSitemap(),
  ]);

  const stateRoutes: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${BASE_URL}/estado/${s.stateSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const stateCityRoutes: MetadataRoute.Sitemap = stateCityPairs.map((p) => ({
    url: `${BASE_URL}/estado/${p.stateSlug}/cidade/${p.citySlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.77,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = propertySlugs.map((p) => ({
    url: `${BASE_URL}/imoveis/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cityRoutes: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE_URL}/cidade/${c.citySlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const neighborhoodRoutes: MetadataRoute.Sitemap = neighborhoods.map((n) => ({
    url: `${BASE_URL}/bairro/${n.neighborhoodSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const typeRoutes: MetadataRoute.Sitemap = propertyTypes.map((t) => ({
    url: `${BASE_URL}/tipo/${t.propertyTypeSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const typeCityRoutes: MetadataRoute.Sitemap = typeCityPairs.map((p) => ({
    url: `${BASE_URL}/tipo/${p.propertyTypeSlug}/cidade/${p.citySlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  const neighborhoodTypeRoutes: MetadataRoute.Sitemap = neighborhoodTypePairs.map((p) => ({
    url: `${BASE_URL}/bairro/${p.neighborhoodSlug}/tipo/${p.propertyTypeSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.70,
  }));

  const cityNeighborhoodRoutes: MetadataRoute.Sitemap = cityNeighborhoodPairs.map((p) => ({
    url: `${BASE_URL}/cidade/${p.citySlug}/bairro/${p.neighborhoodSlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.73,
  }));

  const buyTypeCityRoutes: MetadataRoute.Sitemap = buyTypeCityPairs.map((p) => ({
    url: `${BASE_URL}/comprar/${p.propertyTypeSlug}/${p.citySlug}`,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  const buyTypeCityNeighborhoodRoutes: MetadataRoute.Sitemap =
    buyTypeCityNeighborhoodTriples.map((t) => ({
      url: `${BASE_URL}/comprar/${t.propertyTypeSlug}/${t.citySlug}/${t.neighborhoodSlug}`,
      changeFrequency: "weekly" as const,
      priority: 0.70,
    }));

  const blogRoutes: MetadataRoute.Sitemap = postSlugs.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...buildStaticRoutes(),
    ...stateRoutes,
    ...stateCityRoutes,
    ...cityRoutes,
    ...cityNeighborhoodRoutes,
    ...neighborhoodRoutes,
    ...neighborhoodTypeRoutes,
    ...typeRoutes,
    ...typeCityRoutes,
    ...buyTypeCityRoutes,
    ...buyTypeCityNeighborhoodRoutes,
    ...blogRoutes,
    ...propertyRoutes,
  ];
}
