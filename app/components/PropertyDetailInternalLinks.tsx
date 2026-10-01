import Link from "next/link";
import { PropertyList } from "@/app/components/PropertyList";
import type { PropertyCardData } from "@/lib/queries/properties";
import { getPropertyTypeLabel } from "@/lib/seo";

export type NeighborhoodLinkItem = {
  neighborhood: string;
  neighborhoodSlug: string;
  count: number;
};

type PropertyDetailInternalLinksProps = {
  city: string;
  citySlug: string;
  propertyTypeSlug: string;
  typeInCityProperties: PropertyCardData[];
  typeInCityTotal: number;
  nearbyNeighborhoods: NeighborhoodLinkItem[];
  launchProperties: PropertyCardData[];
};

const linkRowClass =
  "flex min-h-[44px] items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-green-50 hover:text-green-800";

export function PropertyDetailInternalLinks({
  city,
  citySlug,
  propertyTypeSlug,
  typeInCityProperties,
  typeInCityTotal,
  nearbyNeighborhoods,
  launchProperties,
}: PropertyDetailInternalLinksProps) {
  const typeName = getPropertyTypeLabel(propertyTypeSlug);
  const typeCityHref = `/tipo/${propertyTypeSlug}/cidade/${citySlug}`;

  return (
    <div className="mt-14 space-y-14">
      {nearbyNeighborhoods.length > 0 && (
        <section aria-labelledby="property-nearby-neighborhoods-heading">
          <h2
            id="property-nearby-neighborhoods-heading"
            className="text-xl font-bold tracking-tight text-zinc-900"
          >
            Bairros próximos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Outros bairros de {city} com imóveis publicados no portal.
          </p>
          <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
            {nearbyNeighborhoods.map((nb) => (
              <li key={nb.neighborhoodSlug}>
                <Link href={`/bairro/${nb.neighborhoodSlug}`} className={linkRowClass}>
                  <span>
                    Imóveis em <span className="font-medium">{nb.neighborhood}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-zinc-500">{nb.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <Link
              href={`/cidade/${citySlug}`}
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-green-700 hover:underline"
            >
              Ver todos os bairros em {city}
            </Link>
          </p>
        </section>
      )}

      {typeInCityProperties.length > 0 && (
        <section aria-labelledby="property-type-in-city-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="property-type-in-city-heading"
                className="text-xl font-bold tracking-tight text-zinc-900"
              >
                Mais {typeName.toLowerCase()} em {city}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {typeInCityTotal} opções publicadas nesta categoria.
              </p>
            </div>
            <Link
              href={typeCityHref}
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-green-700 hover:underline"
            >
              Ver listagem completa
            </Link>
          </div>
          <div className="mt-6">
            <PropertyList properties={typeInCityProperties} priorityCount={0} />
          </div>
        </section>
      )}

      {launchProperties.length > 0 && (
        <section aria-labelledby="property-launches-city-heading">
          <h2
            id="property-launches-city-heading"
            className="text-xl font-bold tracking-tight text-zinc-900"
          >
            Lançamentos em {city}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Empreendimentos e unidades marcados como lançamento.
          </p>
          <div className="mt-6">
            <PropertyList properties={launchProperties} priorityCount={0} />
          </div>
          <p className="mt-4">
            <Link
              href={`/imoveis?cidade=${citySlug}&lancamento=1`}
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-green-700 hover:underline"
            >
              Ver todos os lançamentos em {city}
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
