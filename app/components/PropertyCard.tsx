import Image from "next/image";
import Link from "next/link";
import {
  getWatermarkedImageUrl,
  shouldUseUnoptimizedNextImage,
} from "@/lib/cloudinary/watermark";
import { publicPropertyImageSrc } from "@/lib/utils/public-property-image-src";
import { formatPropertyPriceBrl } from "@/lib/utils/property-price";
import {
  banhLabel,
  dormLabel,
  formatPropertyAreaM2Line,
  isPropertyTypeAreaOnly,
  type PropertyAreaFields,
} from "@/lib/utils/property-display";
import { buildCanonicalUrl } from "@/lib/seo";
import {
  buildPropertyWhatsAppInterestMessage,
  getWhatsAppContactHref,
} from "@/lib/constants/contato";
import { PropertyWhatsAppLink } from "@/app/components/PropertyWhatsAppLink";

export type Property = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  neighborhood: string | null;
  propertyTypeSlug: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  areaMin?: number | null;
  areaMax?: number | null;
  featuredImage: string | null;
  isFeatured?: boolean;
  isLaunch?: boolean;
  isOpportunity?: boolean;
};

type PropertyCardProps = {
  property: Property;
  /** Primeiro card acima da dobra — LCP (fetchpriority high, sem lazy). */
  priority?: boolean;
};

const cardShellClass =
  "flex flex-col overflow-hidden rounded-xl border-2 border-zinc-400/85 bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_10px_28px_-14px_rgba(15,23,42,0.4)] ring-1 ring-zinc-300/80 transition-all max-md:active:border-green-700/60 max-md:active:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_16px_40px_-16px_rgba(6,78,59,0.4)] max-md:active:ring-green-700/30 hover:-translate-y-0.5 hover:border-green-700/55 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_16px_40px_-16px_rgba(6,78,59,0.4)] hover:ring-green-700/25";

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const formattedPrice = formatPropertyPriceBrl(property.price);
  const areaOnly = isPropertyTypeAreaOnly(property.propertyTypeSlug);
  const areaFields: PropertyAreaFields = {
    area: property.area,
    areaMin: property.areaMin ?? null,
    areaMax: property.areaMax ?? null,
  };

  const location = property.neighborhood
    ? `${property.neighborhood}, ${property.city}`
    : property.city;

  const detailHref = `/imoveis/${property.slug}`;
  const whatsAppHref = getWhatsAppContactHref(
    buildPropertyWhatsAppInterestMessage(
      property.title,
      buildCanonicalUrl(detailHref)
    )
  );

  return (
    <article className={cardShellClass}>
      <Link
        href={detailHref}
        className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          {property.featuredImage ? (
            <Image
              src={publicPropertyImageSrc(
                getWatermarkedImageUrl(property.featuredImage, "compact")
              )}
              alt={property.title}
              fill
              priority={priority}
              unoptimized={shouldUseUnoptimizedNextImage(property.featuredImage)}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Sem imagem
            </div>
          )}
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

        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700 sm:text-xs">
            {location}
          </p>

          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-900 sm:text-base">
            {property.title}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
            {areaOnly ? (
              <span>{formatPropertyAreaM2Line(areaFields)}</span>
            ) : (
              <>
                <span>{dormLabel(property.bedrooms)}</span>
                <span className="text-zinc-300">|</span>
                <span>{banhLabel(property.bathrooms)}</span>
                <span className="text-zinc-300">|</span>
                <span>{formatPropertyAreaM2Line(areaFields)}</span>
              </>
            )}
          </div>

          <p className="mt-1 whitespace-nowrap text-[15px] font-bold text-green-700 sm:text-base">
            {formattedPrice}
          </p>
        </div>
      </Link>

      <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
        <PropertyWhatsAppLink
          href={whatsAppHref}
          propertySlug={property.slug}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-green-600 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          WhatsApp
        </PropertyWhatsAppLink>
      </div>
    </article>
  );
}
