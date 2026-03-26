import Image from "next/image";
import Link from "next/link";
import { getWatermarkedImageUrl } from "@/lib/cloudinary/watermark";
import { brlToEur, formatPriceEur, formatPriceBrl } from "@/lib/currency";
import type { PropertyCardData } from "@/lib/queries/properties";

type InvestmentPropertyCardProps = {
  property: PropertyCardData;
  eurToBrlRate: number;
};

export function InvestmentPropertyCard({ property, eurToBrlRate }: InvestmentPropertyCardProps) {
  const priceBrl = Number(property.price);
  const priceEur = brlToEur(priceBrl, eurToBrlRate);

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
            src={getWatermarkedImageUrl(property.featuredImage)}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            —
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {property.isFeatured && (
            <span className="rounded bg-amber-500/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Destaque
            </span>
          )}
          {property.isLaunch && (
            <span className="rounded bg-green-600/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Lançamento
            </span>
          )}
          {property.isOpportunity && (
            <span className="rounded bg-red-600/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Oportunidade
            </span>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          {location}
        </p>

        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-900">
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

        {/* Preço principal em EUR */}
        <p className="mt-2 text-base font-bold text-green-700">
          {formatPriceEur(priceEur)}
        </p>
        <p className="text-xs text-zinc-500">
          ≈ {formatPriceBrl(priceBrl)}
        </p>
      </div>
    </Link>
  );
}
