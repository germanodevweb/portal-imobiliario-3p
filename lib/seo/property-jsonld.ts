/**
 * JSON-LD RealEstateListing — montagem pura (sem I/O).
 */

import { htmlToPlainText } from "@/lib/utils/html-to-plain-text";
import { hasPropertyListedPrice } from "@/lib/utils/property-price";
import {
  buildPropertyAreaFloorSizeJsonLd,
  type PropertyAreaFields,
} from "@/lib/utils/property-area";
import {
  buildRealEstateListingImageUrls,
  jsonLdPostalAddressEnhancements,
} from "@/lib/seo";
import { jsonLdOrganizationRef } from "@/lib/seo/site-entity-jsonld";

export type PropertyJsonLdType =
  | "CASA"
  | "APARTAMENTO"
  | "COBERTURA"
  | "TERRENO"
  | "LOTE"
  | "FAZENDA"
  | "COMERCIAL"
  | "STUDIO";

export type PropertyJsonLdInput = PropertyAreaFields & {
  title: string;
  description: string | null;
  type: PropertyJsonLdType;
  propertyTypeSlug: string;
  transactionType: "SALE" | "RENT";
  price: string;
  city: string;
  neighborhood: string | null;
  state: string;
  country: string | null;
  postalCode: string | null;
  bedrooms: number;
  bathrooms: number;
  featuredImage: string | null;
  galleryImages: string[];
  images: readonly { url: string }[];
  isSold: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

function mapPropertyToAboutSchemaType(
  type: PropertyJsonLdType
): string {
  switch (type) {
    case "APARTAMENTO":
    case "COBERTURA":
    case "STUDIO":
      return "Apartment";
    case "CASA":
      return "SingleFamilyResidence";
    case "TERRENO":
    case "LOTE":
      return "Landform";
    case "FAZENDA":
      return "SingleFamilyResidence";
    case "COMERCIAL":
      return "LocalBusiness";
    default:
      return "Accommodation";
  }
}

function buildAboutPlace(input: PropertyJsonLdInput): Record<string, unknown> {
  const aboutType = mapPropertyToAboutSchemaType(input.type);
  const floorSize = buildPropertyAreaFloorSizeJsonLd(input);

  const about: Record<string, unknown> = {
    "@type": aboutType,
    name: input.title,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressRegion: input.state,
      ...jsonLdPostalAddressEnhancements(input.country, input.postalCode),
    },
  };

  if (input.bedrooms > 0 && aboutType !== "Landform" && aboutType !== "LocalBusiness") {
    about.numberOfBedrooms = input.bedrooms;
  }
  if (input.bathrooms > 0 && aboutType !== "Landform") {
    about.numberOfBathroomsTotal = input.bathrooms;
  }
  if (floorSize) {
    about.floorSize = floorSize;
  }

  return about;
}

function buildListingOffer(
  input: PropertyJsonLdInput,
  canonical: string
): Record<string, unknown> | null {
  if (!hasPropertyListedPrice(input.price)) return null;

  const price = Number(input.price);
  const availability = input.isSold
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";

  const base: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "BRL",
    availability,
    url: canonical,
    seller: jsonLdOrganizationRef(),
  };

  if (input.transactionType === "RENT") {
    return {
      ...base,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "BRL",
        billingDuration: "P1M",
        unitText: "mês",
      },
    };
  }

  return {
    ...base,
    price,
  };
}

export function buildPropertyJsonLd(
  input: PropertyJsonLdInput,
  canonical: string,
  options?: { imageUrls?: string[] }
): Record<string, unknown> {
  const listingImageUrls =
    options?.imageUrls ??
    buildRealEstateListingImageUrls({
      featuredImage: input.featuredImage,
      galleryImages: input.galleryImages,
      images: input.images,
    });

  const datePostedIso = (
    input.publishedAt ? new Date(input.publishedAt) : new Date(input.updatedAt)
  ).toISOString();

  const fallbackDescription = `${input.title} em ${input.city}.`;
  const description = htmlToPlainText(
    input.description ?? fallbackDescription,
    5000
  );

  const offer = buildListingOffer(input, canonical);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: input.title,
    description,
    url: canonical,
    ...(listingImageUrls.length > 0 ? { image: listingImageUrls } : {}),
    datePosted: datePostedIso,
    about: buildAboutPlace(input),
    contentLocation: {
      "@type": "Place",
      name: input.neighborhood
        ? `${input.neighborhood}, ${input.city}`
        : input.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.city,
        addressRegion: input.state,
        ...jsonLdPostalAddressEnhancements(input.country, input.postalCode),
      },
    },
    publisher: jsonLdOrganizationRef(),
    ...(offer ? { offers: offer } : {}),
  };
}

