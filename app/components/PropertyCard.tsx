import Image from "next/image";
import Link from "next/link";
import { getWatermarkedImageUrl } from "@/lib/cloudinary/watermark";
import { formatPriceBrl } from "@/lib/currency";
import { banhLabel, dormLabel, formatPropertyAreaM2Line } from "@/lib/utils/property-display";

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
  isFeatured?: boolean;
  isLaunch?: boolean;
  isOpportunity?: boolean;
};

export function PropertyCard({ property }: { property: Property }) {
  const formattedPrice = formatPriceBrl(Number(property.price));

  const location = property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;

  return (
    <Link
      href={`/imoveis/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-green-700/30 bg-white shadow-sm shadow-green-950/6 transition-all hover:-translate-y-0.5 hover:border-green-700/55 hover:shadow-md hover:shadow-green-950/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
    >
      {/* Imagem */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {property.featuredImage ? (
          <Image
            src={getWatermarkedImageUrl(property.featuredImage)}
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
        {/* Badges comerciais */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {property.isFeatured && (
            <span className="rounded bg-amber-500/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Destaque
            </span>
          )}
          {property.isLaunch && (
            <span className="rounded bg-green-600/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Lançamento
            </span>
          )}
          {property.isOpportunity && (
            <span className="rounded bg-red-600/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Oportunidade
            </span>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700 sm:text-xs">
          {location}
        </p>

        <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-900 sm:text-base">
          {property.title}
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
          <span>{dormLabel(property.bedrooms)}</span>
          <span className="text-zinc-300">|</span>
          <span>{banhLabel(property.bathrooms)}</span>
          <span className="text-zinc-300">|</span>
          <span>{formatPropertyAreaM2Line(property.area)}</span>
        </div>

        <p className="mt-1 whitespace-nowrap text-[15px] font-bold text-green-700 sm:text-base">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
