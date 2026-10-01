import { PropertyCard, type Property } from "./PropertyCard";

type PropertyListProps = {
  properties: Property[];
  /** Quantos cards do topo recebem `priority` na imagem (padrão: nenhum). */
  priorityCount?: number;
};

export function PropertyList({ properties, priorityCount = 0 }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">Nenhum imóvel encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
