import "dotenv/config";
import sitemap from "../app/sitemap";
import { prisma } from "@/lib/prisma";
import { getPublishedPostSlugsForSitemap } from "@/lib/queries/blog";
import {
  getAvailableBuyTypeCityNeighborhoodTriples,
  getAvailableBuyTypeCityPairs,
  getAvailableCities,
  getAvailableCityNeighborhoodPairs,
  getAvailableNeighborhoods,
  getAvailableNeighborhoodTypePairs,
  getAvailablePropertyTypes,
  getAvailableStateCityPairs,
  getAvailableStates,
  getAvailableTypeCityPairs,
} from "@/lib/queries/properties";

const STATIC = 10;

async function legacyTotal(): Promise<number> {
  const [
    properties,
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
    prisma.property.count({ where: { published: true } }),
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

  return (
    STATIC +
    properties +
    states.length +
    stateCityPairs.length +
    cities.length +
    neighborhoods.length +
    propertyTypes.length +
    typeCityPairs.length +
    neighborhoodTypePairs.length +
    cityNeighborhoodPairs.length +
    buyTypeCityPairs.length +
    buyTypeCityNeighborhoodTriples.length +
    postSlugs.length
  );
}

async function main() {
  const [legacy, current] = await Promise.all([legacyTotal(), sitemap().then((s) => s.length)]);
  console.log(`Sitemap URLs (legado): ${legacy}`);
  console.log(`Sitemap URLs (novo): ${current}`);
  console.log(`Removidas: ${legacy - current}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
