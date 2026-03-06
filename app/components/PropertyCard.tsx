import Image from "next/image";
import Link from "next/link";

export type Property = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  neighborhood: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  featuredImage: string | null;
};

export function PropertyCard({ property }: { property: Property }) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(property.price));

  const location = property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;

  return (
    <Link
      href={`/imoveis/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
    >
      {/* Imagem */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {property.featuredImage ? (
          <Image
            src={property.featuredImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            Sem imagem
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          {location}
        </p>

        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
          {property.title}
        </h2>

        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          {property.bedrooms > 0 && (
            <span>{property.bedrooms} dorm{property.bedrooms !== 1 ? "s." : "."}</span>
          )}
          {property.bathrooms > 0 && (
            <>
              <span className="text-zinc-300">|</span>
              <span>{property.bathrooms} banh.</span>
            </>
          )}
          {property.area && (
            <>
              <span className="text-zinc-300">|</span>
              <span>{property.area} m²</span>
            </>
          )}
        </div>

        <p className="mt-1 text-base font-bold text-green-700">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
