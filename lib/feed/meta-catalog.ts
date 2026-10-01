import { prisma } from "@/lib/prisma";
import { getFeedImageUrl } from "@/lib/cloudinary/feed-image";
import { isLegacyCode49PropertyImageUrl } from "@/lib/property/legacy-image-url";
import { hasPropertyListedPrice } from "@/lib/utils/property-price";
import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

/** Campos necessários para montar o catálogo Meta (RSS + namespace g:). */
export type MetaCatalogFeedProperty = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: string;
  featuredImage: string | null;
  galleryImages: string[];
  imageUrls: string[];
  isSold: boolean;
  transactionType: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  areaMin: number | null;
  areaMax: number | null;
  city: string;
  state: string;
  neighborhood: string | null;
  citySlug: string;
  stateSlug: string;
  propertyTypeSlug: string;
  updatedAt: Date;
};

const DIRECT_IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|avif)(\?|#|$)/i;
const CLOUDINARY_IMAGE_UPLOAD = /res\.cloudinary\.com\/[^/]+\/image\/upload\//i;

/**
 * URL pública HTTPS que o crawler da Meta consegue buscar como imagem direta.
 * Rejeita hosts legados Code49 (/admin/imovel/) que respondem HTML de login.
 */
export function isValidMetaCatalogImageUrl(raw: string): boolean {
  const normalized = normalizePublicImageUrl(raw.trim());
  if (!normalized) return false;
  if (isLegacyCode49PropertyImageUrl(normalized)) return false;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:") return false;

    const pathWithQuery = `${parsed.pathname}${parsed.search}`;
    return (
      DIRECT_IMAGE_EXT.test(pathWithQuery) ||
      CLOUDINARY_IMAGE_UPLOAD.test(normalized)
    );
  } catch {
    return false;
  }
}

/** Entrega final para g:image_link — sem marca d'água (política Meta). */
export function toMetaCatalogImageLink(raw: string): string {
  return getFeedImageUrl(raw);
}

function dedupeImageCandidates(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export type MetaCatalogFeedImages = {
  imageLink: string | null;
  /** Até 10 URLs adicionais (galeria), excluindo image_link principal. */
  additionalImageLinks: string[];
};

function collectMetaCatalogImageLinks(property: {
  featuredImage: string | null;
  galleryImages: string[];
  imageUrls: string[];
}): string[] {
  const candidates = dedupeImageCandidates([
    property.featuredImage,
    ...property.galleryImages,
    ...property.imageUrls,
  ]);

  const links: string[] = [];
  for (const candidate of candidates) {
    if (!isValidMetaCatalogImageUrl(candidate)) continue;
    links.push(toMetaCatalogImageLink(candidate));
  }
  return links;
}

/**
 * featuredImage → galleryImages → PropertyImage (visíveis, ordem da galeria).
 * Retorna null se nenhuma URL for válida para o catálogo Meta.
 */
export function resolveMetaCatalogImageUrl(property: {
  featuredImage: string | null;
  galleryImages: string[];
  imageUrls: string[];
}): string | null {
  return collectMetaCatalogImageLinks(property)[0] ?? null;
}

export function resolveMetaCatalogFeedImages(property: {
  featuredImage: string | null;
  galleryImages: string[];
  imageUrls: string[];
}): MetaCatalogFeedImages {
  const links = collectMetaCatalogImageLinks(property);
  if (links.length === 0) {
    return { imageLink: null, additionalImageLinks: [] };
  }
  return {
    imageLink: links[0],
    additionalImageLinks: links.slice(1, 11),
  };
}

export function isValidMetaCatalogPrice(
  price: string | number | null | undefined
): boolean {
  return hasPropertyListedPrice(price);
}

/** Query exclusiva do feed Meta — inclui galeria para fallback de image_link. */
export async function getPropertiesForMetaCatalogFeed(): Promise<
  MetaCatalogFeedProperty[]
> {
  const results = await prisma.property.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      featuredImage: true,
      galleryImages: true,
      isSold: true,
      transactionType: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      areaMin: true,
      areaMax: true,
      city: true,
      state: true,
      neighborhood: true,
      citySlug: true,
      stateSlug: true,
      propertyTypeSlug: true,
      updatedAt: true,
      images: {
        where: { isHidden: false },
        select: { url: true },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return results.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: String(p.price),
    featuredImage: p.featuredImage,
    galleryImages: p.galleryImages,
    imageUrls: p.images.map((img) => img.url),
    isSold: p.isSold,
    transactionType: p.transactionType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    areaMin: p.areaMin,
    areaMax: p.areaMax,
    city: p.city,
    state: p.state,
    neighborhood: p.neighborhood,
    citySlug: p.citySlug,
    stateSlug: p.stateSlug,
    propertyTypeSlug: p.propertyTypeSlug,
    updatedAt: p.updatedAt,
  }));
}
