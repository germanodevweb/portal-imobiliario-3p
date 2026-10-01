import { BASE_URL } from "@/lib/seo";
import {
  buildGoogleAdsRealEstateShortDescription,
  csvFeedResponse,
  escapeCsvField,
  formatFeedPrice,
  getFeedTypeName,
  resolveFeedPlainDescription,
} from "@/lib/feed";
import {
  getPropertiesForMetaCatalogFeed,
  isValidMetaCatalogPrice,
  resolveMetaCatalogFeedImages,
} from "@/lib/feed/meta-catalog";
import {
  toGoogleAdsListingId,
  toGoogleAdsListingType,
  toGoogleAdsPropertyType,
  truncateGoogleAdsListingName,
} from "@/lib/feed/google-ads-real-estate";

export const revalidate = 3600;

const CSV_HEADERS = [
  "Listing ID",
  "Listing name",
  "Final URL",
  "Image URL",
  "City name",
  "Description",
  "Price",
  "Property type",
  "Listing type",
  "Contextual keywords",
  "Address",
] as const;

function buildContextualKeywords(
  propertyTypeSlug: string,
  transactionType: "SALE" | "RENT"
): string {
  const typeName = getFeedTypeName(propertyTypeSlug);
  const listingType = toGoogleAdsListingType(transactionType);
  return `${listingType}; ${typeName}`;
}

function buildGoogleAdsAddress(city: string, state: string): string {
  const stateCode = state.trim().length <= 3 ? state.trim().toUpperCase() : state.trim();
  return `${city}, ${stateCode}, Brasil`;
}

export async function GET() {
  const properties = await getPropertiesForMetaCatalogFeed();

  const rows: string[] = [CSV_HEADERS.join(",")];

  for (const p of properties) {
    if (!isValidMetaCatalogPrice(p.price)) continue;
    if (p.isSold) continue;

    const { imageLink } = resolveMetaCatalogFeedImages(p);
    if (!imageLink) continue;

    const typeName = getFeedTypeName(p.propertyTypeSlug);
    const txLabel = p.transactionType === "SALE" ? "a venda" : "para alugar";
    const pageUrl = `${BASE_URL}/imoveis/${p.slug}`;

    const longPlain = resolveFeedPlainDescription(
      p.description,
      {
        typeName,
        txLabel,
        city: p.city,
        neighborhood: p.neighborhood,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        areaMin: p.areaMin,
        areaMax: p.areaMax,
      },
      5000
    );

    const shortDescription =
      buildGoogleAdsRealEstateShortDescription({
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        areaMin: p.areaMin,
        areaMax: p.areaMax,
      }) || longPlain.slice(0, 25);

    const cells = [
      toGoogleAdsListingId(p.id),
      truncateGoogleAdsListingName(p.title),
      pageUrl,
      imageLink,
      p.city,
      shortDescription,
      formatFeedPrice(p.price),
      toGoogleAdsPropertyType(p.propertyTypeSlug),
      toGoogleAdsListingType(p.transactionType),
      buildContextualKeywords(p.propertyTypeSlug, p.transactionType),
      buildGoogleAdsAddress(p.city, p.state),
    ].map(escapeCsvField);

    rows.push(cells.join(","));
  }

  return csvFeedResponse(rows.join("\n"));
}
