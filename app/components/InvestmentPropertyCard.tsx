import Image from "next/image";
import Link from "next/link";
import {
  getWatermarkedImageUrl,
  shouldUseUnoptimizedNextImage,
} from "@/lib/cloudinary/watermark";
import { publicPropertyImageSrc } from "@/lib/utils/public-property-image-src";
import { brlToEur, formatPriceEur, formatPriceBrl } from "@/lib/currency";
import {
  banhLabel,
  dormLabel,
  formatPropertyAreaM2Line,
  isPropertyTypeAreaOnly,
} from "@/lib/utils/property-display";
import type { PropertyCardData } from "@/lib/queries/properties";

type InvestmentPropertyCardProps = {
  property: PropertyCardData;
  eurToBrlRate: number;
};

export function InvestmentPropertyCard({ property, eurToBrlRate }: InvestmentPropertyCardProps) {
  const priceBrl = Number(property.price);
  const priceEur = brlToEur(priceBrl, eurToBrlRate);
  const areaOnly = isPropertyTypeAreaOnly(property.propertyTypeSlug);

  const location = property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;

  return (
    <Link
      href={`/imoveis/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border-2 border-zinc-400/85 bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_10px_28px_-14px_rgba(15,23,42,0.4)] ring-1 ring-zinc-300/80 transition-all max-md:active:border-green-700/60 max-md:active:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_16px_40px_-16px_rgba(6,78,59,0.4)] max-md:active:ring-green-700/30 hover:-translate-y-0.5 hover:border-green-700/55 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_16px_40px_-16px_rgba(6,78,59,0.4)] hover:ring-green-700/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
    >
      {/* Imagem */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {property.featuredImage ? (
          <Image
            src={publicPropertyImageSrc(
              getWatermarkedImageUrl(property.featuredImage, "compact")
            )}
            alt={property.title}
            fill
            unoptimized={shouldUseUnoptimizedNextImage(property.featuredImage)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 400px"
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

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
          {areaOnly ? (
            <span>{formatPropertyAreaM2Line(property.area)}</span>
          ) : (
            <>
              <span>{dormLabel(property.bedrooms)}</span>
              <span className="text-zinc-300">|</span>
              <span>{banhLabel(property.bathrooms)}</span>
              <span className="text-zinc-300">|</span>
              <span>{formatPropertyAreaM2Line(property.area)}</span>
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
