import "server-only";

import {
  getPropertyBySlug,
  getPropertySlugPublicationState,
  type PropertyDetail,
} from "@/lib/queries/properties";
import {
  buildPropertyVideoWatchCanonical,
  buildPropertyVideoWatchPagePlainDescription,
  buildPropertyVideoWatchPageTitle,
  resolvePropertyVideoSeo,
  type ResolvedPropertyVideoSeo,
} from "@/lib/seo-property-video";
import { resolveYouTubeThumbnailUrl } from "@/lib/youtube/thumbnail";

export type PropertyVideoWatchPageData = {
  property: PropertyDetail & { youtubeVideoId: string };
  seo: ResolvedPropertyVideoSeo;
  thumbnailUrl: string;
  canonical: string;
  detailPath: string;
  metaTitle: string;
  metaDescription: string;
  plainDescription: string;
};

export async function loadPropertyVideoWatchPageData(
  slug: string
): Promise<PropertyVideoWatchPageData | null> {
  const publication = await getPropertySlugPublicationState(slug);
  if (publication.status !== "published") return null;

  const property = await getPropertyBySlug(slug);
  const videoId = property?.youtubeVideoId?.trim();
  if (!property || !videoId) return null;

  const thumbnailUrl = await resolveYouTubeThumbnailUrl(videoId);
  const seo = resolvePropertyVideoSeo(
    {
      youtubeVideoId: videoId,
      youtubeTitle: property.youtubeTitle,
      youtubeDescription: property.youtubeDescription,
      youtubePublishedAt: property.youtubePublishedAt,
      youtubeDurationIso: property.youtubeDurationIso,
      propertyTitle: property.title,
      propertyDescription: property.description,
    },
    thumbnailUrl
  );

  const canonical = buildPropertyVideoWatchCanonical(slug);
  const detailPath = `/imoveis/${slug}`;

  const metaTitle = buildPropertyVideoWatchPageTitle({
    propertyTypeSlug: property.propertyTypeSlug,
    transactionType: property.transactionType,
    bedrooms: property.bedrooms,
    area: property.area,
    areaMin: property.areaMin,
    areaMax: property.areaMax,
    neighborhood: property.neighborhood,
    city: property.city,
  });

  const metaDescription = seo.description.slice(0, 160);
  const plainDescription = buildPropertyVideoWatchPagePlainDescription(
    property.description
  );

  return {
    property: { ...property, youtubeVideoId: videoId },
    seo,
    thumbnailUrl,
    canonical,
    detailPath,
    metaTitle,
    metaDescription,
    plainDescription,
  };
}
