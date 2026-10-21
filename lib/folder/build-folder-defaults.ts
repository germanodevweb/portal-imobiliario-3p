import { getSiteWhatsAppPhoneDisplay } from "@/lib/constants/contato";
import type { FolderPropertyDefaults } from "@/lib/folder/types";
import { pickPrimaryPhotoUrl } from "@/lib/folder/pick-primary-photo-url";
import { normalizeSavedDevelopmentName } from "@/lib/folder/development-name-input";
import {
  resolveFolderDevelopmentName,
  resolveFolderLocationLine,
} from "@/lib/folder/resolve-folder-display";
import { sanitizeNeighborhoodLabel } from "@/lib/folder/sanitize-neighborhood";
import { suggestFolderSealBannerText } from "@/lib/folder/suggest-seal";

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  developmentName?: string | null;
  neighborhood: string | null;
  city: string;
  bedrooms: number;
  garage: number;
  isLaunch: boolean;
  isOpportunity: boolean;
  isFeatured: boolean;
  featuredImage: string | null;
  images: {
    url: string;
    isPrimary: boolean;
    isHidden: boolean;
    sortOrder: number;
  }[];
};

export function buildFolderPropertyDefaults(
  property: PropertyRow
): FolderPropertyDefaults {
  const neighborhoodDisplay = sanitizeNeighborhoodLabel(property.neighborhood ?? "");
  const cityDisplay = sanitizeNeighborhoodLabel(property.city);
  const sitePhone = getSiteWhatsAppPhoneDisplay();

  return {
    propertyId: property.id,
    slug: property.slug,
    propertyEditHref: `/admin/imoveis/${property.id}/editar`,
    developmentNameDisplay: resolveFolderDevelopmentName(
      property.developmentName,
      property.title
    ),
    savedDevelopmentName: normalizeSavedDevelopmentName(property.developmentName),
    locationLine: resolveFolderLocationLine(
      property.neighborhood,
      property.city
    ),
    neighborhoodDisplay,
    cityDisplay,
    primaryPhotoUrl: pickPrimaryPhotoUrl(property.images, property.featuredImage),
    highlightBedrooms: property.bedrooms,
    highlightGarage: property.garage,
    showLeisure: true,
    sealBannerText: suggestFolderSealBannerText({
      isLaunch: property.isLaunch,
      isOpportunity: property.isOpportunity,
      isFeatured: property.isFeatured,
    }),
    showFullPhoto: false,
    phone: sitePhone ?? "",
    phoneRequired: !sitePhone,
  };
}
