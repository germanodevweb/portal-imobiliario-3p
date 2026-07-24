import type { FilterLocationNeighborhood } from "@/lib/imoveis/filter-location-types";

export function filterNeighborhoodsByCitySlug(
  neighborhoods: FilterLocationNeighborhood[],
  citySlug: string
): FilterLocationNeighborhood[] {
  const filtered = citySlug
    ? neighborhoods.filter((n) => n.citySlug === citySlug)
    : neighborhoods;

  return [...filtered].sort((a, b) =>
    a.neighborhood.localeCompare(b.neighborhood, "pt-BR", { sensitivity: "base" })
  );
}

/** Descarta bairro se não pertencer à cidade selecionada. */
export function resolveNeighborhoodSlugForCity(
  citySlug: string,
  neighborhoodSlug: string,
  neighborhoods: FilterLocationNeighborhood[]
): string {
  if (!neighborhoodSlug) return "";
  if (!citySlug) return neighborhoodSlug;

  const valid = neighborhoods.some(
    (n) => n.citySlug === citySlug && n.neighborhoodSlug === neighborhoodSlug
  );
  return valid ? neighborhoodSlug : "";
}
