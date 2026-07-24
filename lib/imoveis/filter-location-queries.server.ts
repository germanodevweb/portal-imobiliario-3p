import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ParsedImoveisSearchParams } from "@/lib/imoveis/search-params";
import type { FilterLocationNeighborhood } from "@/lib/imoveis/filter-location-types";
import { resolveNeighborhoodSlugForCity } from "@/lib/imoveis/filter-location-utils";
import type { PropertyFilters } from "@/lib/queries/properties";

const INVESTMENT_MIN_PRICE = "350000";
const ALTO_PADRAO_MIN_PRICE = "1500000";

export type { FilterLocationNeighborhood } from "@/lib/imoveis/filter-location-types";

async function fetchFilterNeighborhoods(
  where: Prisma.PropertyWhereInput
): Promise<FilterLocationNeighborhood[]> {
  const results = await prisma.property.findMany({
    where: {
      ...where,
      neighborhoodSlug: { not: null },
      neighborhood: { not: null },
    },
    select: {
      neighborhood: true,
      neighborhoodSlug: true,
      citySlug: true,
    },
    distinct: ["neighborhoodSlug"],
    orderBy: { neighborhood: "asc" },
  });

  const seen = new Set<string>();
  const neighborhoods: FilterLocationNeighborhood[] = [];

  for (const row of results) {
    if (!row.neighborhoodSlug || !row.neighborhood) continue;
    if (seen.has(row.neighborhoodSlug)) continue;
    seen.add(row.neighborhoodSlug);
    neighborhoods.push({
      neighborhood: row.neighborhood,
      neighborhoodSlug: row.neighborhoodSlug,
      citySlug: row.citySlug,
    });
  }

  return neighborhoods.sort((a, b) =>
    a.neighborhood.localeCompare(b.neighborhood, "pt-BR", { sensitivity: "base" })
  );
}

/** Bairros com imóveis publicados — /imoveis */
export const getImoveisFilterNeighborhoods = cache(async () =>
  fetchFilterNeighborhoods({ published: true })
);

/** Bairros com imóveis de alto padrão — /imoveis/alto-padrao */
export const getAltoPadraoFilterNeighborhoods = cache(async () =>
  fetchFilterNeighborhoods({
    published: true,
    isSold: false,
    price: { gte: ALTO_PADRAO_MIN_PRICE },
  })
);

/** Bairros na vitrine de investimento — /investir-no-brasil e traduções */
export const getInvestmentFilterNeighborhoods = cache(async () =>
  fetchFilterNeighborhoods({
    published: true,
    isSold: false,
    price: { gte: INVESTMENT_MIN_PRICE },
  })
);

function computeHasFilters(
  parsed: ParsedImoveisSearchParams,
  rawBairro: string
): boolean {
  const quartosParsed = parseInt(parsed.rawQuartos, 10);
  const bedroomsFilter =
    !Number.isNaN(quartosParsed) && quartosParsed >= 1 && quartosParsed <= 10
      ? quartosParsed
      : undefined;
  const minPriceFilter =
    parsed.rawPrecoMin && /^\d+(\.\d+)?$/.test(parsed.rawPrecoMin)
      ? parsed.rawPrecoMin
      : undefined;
  const maxPriceFilter =
    parsed.rawPrecoMax && /^\d+(\.\d+)?$/.test(parsed.rawPrecoMax)
      ? parsed.rawPrecoMax
      : undefined;

  return Boolean(
    parsed.rawCidade ||
      rawBairro ||
      parsed.rawTipo ||
      bedroomsFilter ||
      minPriceFilter ||
      maxPriceFilter ||
      parsed.rawDestaque ||
      parsed.rawLancamento ||
      parsed.rawOportunidade
  );
}

/** Alinha filtros da URL com a relação cidade → bairro dos dados da listagem. */
export function applyLocationFilterSanitization(
  parsed: ParsedImoveisSearchParams,
  neighborhoods: FilterLocationNeighborhood[]
): ParsedImoveisSearchParams {
  const rawBairro = resolveNeighborhoodSlugForCity(
    parsed.rawCidade,
    parsed.rawBairro,
    neighborhoods
  );

  if (rawBairro === parsed.rawBairro) {
    return parsed;
  }

  const filters: PropertyFilters = { ...parsed.filters };
  if (rawBairro) {
    filters.neighborhoodSlug = rawBairro;
  } else {
    delete filters.neighborhoodSlug;
  }

  return {
    ...parsed,
    rawBairro,
    filters,
    hasFilters: computeHasFilters(parsed, rawBairro),
  };
}
