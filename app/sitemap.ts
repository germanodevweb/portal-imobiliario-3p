import type { MetadataRoute } from "next";
import {
  getPublishedPropertySlugsForSitemap,
  getAvailableCities,
  getAvailableNeighborhoods,
  getAvailablePropertyTypes,
  getAvailableTypeCityPairs,
} from "@/lib/queries/properties";
import { BASE_URL } from "@/lib/seo";

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
      url: `${BASE_URL}/quem-somos`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contato`,
      changeFrequency: "monthly",
      priority: 0.4,
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
  const [propertySlugs, cities, neighborhoods, propertyTypes, typeCityPairs] =
    await Promise.all([
      getPublishedPropertySlugsForSitemap(),
      getAvailableCities(),
      getAvailableNeighborhoods(),
      getAvailablePropertyTypes(),
      getAvailableTypeCityPairs(),
    ]);

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

  return [
    ...buildStaticRoutes(),
    ...cityRoutes,
    ...neighborhoodRoutes,
    ...typeRoutes,
    ...typeCityRoutes,
    ...propertyRoutes,
  ];
}
