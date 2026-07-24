"use client";

import { useMemo, useState } from "react";
import {
  filterNeighborhoodsByCitySlug,
  resolveNeighborhoodSlugForCity,
} from "@/lib/imoveis/filter-location-utils";
import type { FilterLocationNeighborhood } from "@/lib/imoveis/filter-location-types";

type CityOption = { city: string; citySlug: string };

type ImoveisFilterLocationFieldsProps = {
  cities: CityOption[];
  neighborhoods: FilterLocationNeighborhood[];
  defaultCity: string;
  defaultNeighborhood: string;
};

const selectClassName =
  "min-h-[44px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

export function ImoveisFilterLocationFields({
  cities,
  neighborhoods,
  defaultCity,
  defaultNeighborhood,
}: ImoveisFilterLocationFieldsProps) {
  const initialNeighborhood = useMemo(
    () =>
      resolveNeighborhoodSlugForCity(defaultCity, defaultNeighborhood, neighborhoods),
    [defaultCity, defaultNeighborhood, neighborhoods]
  );

  const [citySlug, setCitySlug] = useState(defaultCity);
  const [neighborhoodSlug, setNeighborhoodSlug] = useState(initialNeighborhood);

  const visibleNeighborhoods = useMemo(
    () => filterNeighborhoodsByCitySlug(neighborhoods, citySlug),
    [citySlug, neighborhoods]
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-cidade" className="text-xs font-semibold text-zinc-500">
          Cidade
        </label>
        <select
          id="filter-cidade"
          name="cidade"
          value={citySlug}
          autoComplete="off"
          onChange={(event) => {
            setCitySlug(event.target.value);
            setNeighborhoodSlug("");
          }}
          className={selectClassName}
        >
          <option value="">Todas</option>
          {cities.map((city) => (
            <option key={city.citySlug} value={city.citySlug}>
              {city.city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-bairro" className="text-xs font-semibold text-zinc-500">
          Bairro
        </label>
        <select
          id="filter-bairro"
          name="bairro"
          value={neighborhoodSlug}
          onChange={(event) => setNeighborhoodSlug(event.target.value)}
          className={selectClassName}
        >
          <option value="">Todos</option>
          {visibleNeighborhoods.map((neighborhood) => (
            <option
              key={neighborhood.neighborhoodSlug}
              value={neighborhood.neighborhoodSlug}
            >
              {neighborhood.neighborhood}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
