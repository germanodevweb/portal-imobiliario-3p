import { prisma } from "@/lib/prisma";
import { evaluateIndexation, type PageType } from "@/lib/indexation";

const PUBLISHED = { published: true } as const;
const PUBLISHED_SALE = { published: true, transactionType: "SALE" as const };

function isIndexable(pageType: PageType, publishedCount: number): boolean {
  return evaluateIndexation({ pageType, publishedCount }).shouldIndex;
}

function countAll(row: { _count: { _all: number } }): number {
  return row._count._all;
}

export type IndexableStateSlug = { stateSlug: string };
export type IndexableStateCityPair = { stateSlug: string; citySlug: string };
export type IndexableCitySlug = { citySlug: string };
export type IndexableNeighborhoodSlug = { neighborhoodSlug: string };
export type IndexablePropertyTypeSlug = { propertyTypeSlug: string };
export type IndexableTypeCityPair = {
  propertyTypeSlug: string;
  citySlug: string;
};
export type IndexableNeighborhoodTypePair = {
  neighborhoodSlug: string;
  propertyTypeSlug: string;
};
export type IndexableCityNeighborhoodPair = {
  citySlug: string;
  neighborhoodSlug: string;
};
export type IndexableBuyTypeCityPair = IndexableTypeCityPair;
export type IndexableBuyTypeCityNeighborhoodTriple = {
  propertyTypeSlug: string;
  citySlug: string;
  neighborhoodSlug: string;
};

export async function getIndexableStateSlugsForSitemap(): Promise<IndexableStateSlug[]> {
  const rows = await prisma.property.groupBy({
    by: ["stateSlug"],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("state", countAll(r)))
    .map((r) => ({ stateSlug: r.stateSlug }));
}

export async function getIndexableStateCityPairsForSitemap(): Promise<
  IndexableStateCityPair[]
> {
  const rows = await prisma.property.groupBy({
    by: ["stateSlug", "citySlug"],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("stateCity", countAll(r)))
    .map((r) => ({ stateSlug: r.stateSlug, citySlug: r.citySlug }));
}

export async function getIndexableCitySlugsForSitemap(): Promise<IndexableCitySlug[]> {
  const rows = await prisma.property.groupBy({
    by: ["citySlug"],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("city", countAll(r)))
    .map((r) => ({ citySlug: r.citySlug }));
}

export async function getIndexableNeighborhoodSlugsForSitemap(): Promise<
  IndexableNeighborhoodSlug[]
> {
  const rows = await prisma.property.groupBy({
    by: ["neighborhoodSlug"],
    where: { ...PUBLISHED, neighborhoodSlug: { not: null } },
    _count: { _all: true },
  });
  return rows
    .filter((r): r is typeof r & { neighborhoodSlug: string } => r.neighborhoodSlug !== null)
    .filter((r) => isIndexable("neighborhood", countAll(r)))
    .map((r) => ({ neighborhoodSlug: r.neighborhoodSlug }));
}

export async function getIndexablePropertyTypeSlugsForSitemap(): Promise<
  IndexablePropertyTypeSlug[]
> {
  const rows = await prisma.property.groupBy({
    by: ["propertyTypeSlug"],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("propertyType", countAll(r)))
    .map((r) => ({ propertyTypeSlug: r.propertyTypeSlug }));
}

export async function getIndexableTypeCityPairsForSitemap(): Promise<
  IndexableTypeCityPair[]
> {
  const rows = await prisma.property.groupBy({
    by: ["propertyTypeSlug", "citySlug"],
    where: PUBLISHED,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("propertyTypeCity", countAll(r)))
    .map((r) => ({
      propertyTypeSlug: r.propertyTypeSlug,
      citySlug: r.citySlug,
    }));
}

export async function getIndexableNeighborhoodTypePairsForSitemap(): Promise<
  IndexableNeighborhoodTypePair[]
> {
  const rows = await prisma.property.groupBy({
    by: ["neighborhoodSlug", "propertyTypeSlug"],
    where: { ...PUBLISHED, neighborhoodSlug: { not: null } },
    _count: { _all: true },
  });
  return rows
    .filter((r): r is typeof r & { neighborhoodSlug: string } => r.neighborhoodSlug !== null)
    .filter((r) => isIndexable("neighborhoodType", countAll(r)))
    .map((r) => ({
      neighborhoodSlug: r.neighborhoodSlug,
      propertyTypeSlug: r.propertyTypeSlug,
    }));
}

export async function getIndexableCityNeighborhoodPairsForSitemap(): Promise<
  IndexableCityNeighborhoodPair[]
> {
  const rows = await prisma.property.groupBy({
    by: ["citySlug", "neighborhoodSlug"],
    where: { ...PUBLISHED, neighborhoodSlug: { not: null } },
    _count: { _all: true },
  });
  return rows
    .filter((r): r is typeof r & { neighborhoodSlug: string } => r.neighborhoodSlug !== null)
    .filter((r) => isIndexable("cityNeighborhood", countAll(r)))
    .map((r) => ({
      citySlug: r.citySlug,
      neighborhoodSlug: r.neighborhoodSlug,
    }));
}

export async function getIndexableBuyTypeCityPairsForSitemap(): Promise<
  IndexableBuyTypeCityPair[]
> {
  const rows = await prisma.property.groupBy({
    by: ["propertyTypeSlug", "citySlug"],
    where: PUBLISHED_SALE,
    _count: { _all: true },
  });
  return rows
    .filter((r) => isIndexable("buyTypeCity", countAll(r)))
    .map((r) => ({
      propertyTypeSlug: r.propertyTypeSlug,
      citySlug: r.citySlug,
    }));
}

export async function getIndexableBuyTypeCityNeighborhoodTriplesForSitemap(): Promise<
  IndexableBuyTypeCityNeighborhoodTriple[]
> {
  const rows = await prisma.property.groupBy({
    by: ["propertyTypeSlug", "citySlug", "neighborhoodSlug"],
    where: { ...PUBLISHED_SALE, neighborhoodSlug: { not: null } },
    _count: { _all: true },
  });
  return rows
    .filter((r): r is typeof r & { neighborhoodSlug: string } => r.neighborhoodSlug !== null)
    .filter((r) => isIndexable("buyTypeCityNeighborhood", countAll(r)))
    .map((r) => ({
      propertyTypeSlug: r.propertyTypeSlug,
      citySlug: r.citySlug,
      neighborhoodSlug: r.neighborhoodSlug,
    }));
}
