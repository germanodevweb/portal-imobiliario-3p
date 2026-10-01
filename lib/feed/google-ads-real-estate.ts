import { getFeedTypeName } from "@/lib/feed";

/** Valores sugeridos pelo template Google Ads — Imóveis (remarketing dinâmico). */
const GOOGLE_ADS_PROPERTY_TYPE: Record<string, string> = {
  apartamento: "Apartment",
  casa: "House",
  "casa-em-condominio": "House",
  cobertura: "Apartment",
  kitnet: "Apartment",
  loft: "Apartment",
  sala: "Other",
  terreno: "Land",
  "imovel-comercial": "Other",
};

export function toGoogleAdsPropertyType(propertyTypeSlug: string): string {
  return (
    GOOGLE_ADS_PROPERTY_TYPE[propertyTypeSlug] ??
    getFeedTypeName(propertyTypeSlug)
  );
}

export function toGoogleAdsListingType(
  transactionType: "SALE" | "RENT"
): "For sale" | "For rent" {
  return transactionType === "SALE" ? "For sale" : "For rent";
}

/** ID alfanumérico (sem hífens) — compatível com tag de remarketing. */
export function toGoogleAdsListingId(propertyId: string): string {
  return propertyId.replace(/[^a-zA-Z0-9]/g, "");
}

export function truncateGoogleAdsListingName(title: string): string {
  const t = title.trim();
  return t.length > 25 ? `${t.slice(0, 22)}…` : t;
}
