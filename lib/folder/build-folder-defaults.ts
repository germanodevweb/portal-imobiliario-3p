import { IMAGE_ENVIRONMENTS } from "@/lib/constants/image-environments";
import type { FolderPropertyDefaults, FolderGalleryImage } from "@/lib/folder/types";
import { parseListingDevelopmentName } from "@/lib/folder/parse-listing-name";
import { pickDefaultFolderPhotos } from "@/lib/folder/pick-default-photos";
import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";
import { suggestFolderSeal } from "@/lib/folder/suggest-seal";

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  neighborhood: string | null;
  bedrooms: number;
  isLaunch: boolean;
  isOpportunity: boolean;
  isFeatured: boolean;
  featuredImage: string | null;
  images: {
    url: string;
    environment: string | null;
    isPrimary: boolean;
    isHidden: boolean;
    sortOrder: number;
  }[];
};

function environmentDisplayLabel(environment: string | null): string {
  const env = environment?.trim() ?? "";
  if (!env) return "Sem ambiente";
  const matched = IMAGE_ENVIRONMENTS.find(
    (e) => e.value === env || e.label.toLowerCase() === env.toLowerCase()
  );
  return matched ? matched.label : env;
}

function mapGallery(property: PropertyRow): FolderGalleryImage[] {
  const rows =
    property.images.length > 0
      ? property.images
      : property.featuredImage
        ? [
            {
              url: property.featuredImage,
              environment: null,
              isPrimary: true,
              isHidden: false,
              sortOrder: 0,
            },
          ]
        : [];

  return rows
    .filter((r) => r.url.trim() && !r.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => ({
      url: r.url,
      environmentLabel: environmentDisplayLabel(r.environment),
      isHidden: r.isHidden,
      sortOrder: r.sortOrder,
      isPrimary: r.isPrimary,
    }));
}

export function buildFolderPropertyDefaults(
  property: PropertyRow
): FolderPropertyDefaults {
  const gallery = mapGallery(property);
  const pickRows =
    property.images.length > 0
      ? property.images
      : gallery.map((g, i) => ({
          url: g.url,
          environment: null as string | null,
          isPrimary: g.isPrimary,
          isHidden: g.isHidden,
          sortOrder: i,
        }));

  const photoUrls = pickDefaultFolderPhotos(
    pickRows.map((r) => ({
      url: r.url,
      environment: r.environment,
      isPrimary: r.isPrimary,
      isHidden: r.isHidden,
      sortOrder: r.sortOrder,
    })),
    property.featuredImage
  );

  const neighborhood = sanitizeNeighborhoodLabel(property.neighborhood ?? "");

  return {
    propertyId: property.id,
    slug: property.slug,
    description: property.description?.trim() ?? "",
    developmentName: parseListingDevelopmentName(property.title),
    subtitle: "",
    neighborhood,
    bedrooms: property.bedrooms,
    locationText: "",
    nearbyPoints: [],
    seal: suggestFolderSeal({
      isLaunch: property.isLaunch,
      isOpportunity: property.isOpportunity,
      isFeatured: property.isFeatured,
    }),
    footerPhrase: "Seu novo capítulo começa aqui!",
    showWhatsApp: true,
    photoUrls,
    gallery,
  };
}
