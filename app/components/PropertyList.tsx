import { PropertyCard, type Property } from "./PropertyCard";

export function PropertyList({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">Nenhum imóvel encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
