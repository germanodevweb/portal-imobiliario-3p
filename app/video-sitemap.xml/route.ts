import { getIndexablePropertyVideoPagesForSitemap } from "@/lib/queries/properties";
import { escapeXml } from "@/lib/feed";
import {
  BASE_URL,
  buildPropertyVideoWatchPagePath,
  resolvePropertyVideoSeo,
} from "@/lib/seo";
import { iso8601DurationToSeconds } from "@/lib/youtube/duration";
import { resolveYouTubeThumbnailUrl } from "@/lib/youtube/thumbnail";

export const revalidate = 3600;

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export async function GET() {
  const rows = await getIndexablePropertyVideoPagesForSitemap();

  const urlEntries = await Promise.all(
    rows.map(async (row) => {
      const pageUrl = `${BASE_URL}${buildPropertyVideoWatchPagePath(row.slug)}`;
      const thumbnailUrl = await resolveYouTubeThumbnailUrl(row.youtubeVideoId);
      const seo = resolvePropertyVideoSeo(
        {
          youtubeVideoId: row.youtubeVideoId,
          youtubeTitle: row.youtubeTitle,
          youtubeDescription: row.youtubeDescription,
          youtubePublishedAt: row.youtubePublishedAt,
          youtubeDurationIso: row.youtubeDurationIso,
          propertyTitle: row.title,
          propertyDescription: row.description,
        },
        thumbnailUrl
      );

      const durationSec = iso8601DurationToSeconds(seo.durationIso);
      const publicationDate = seo.uploadDateIso;
      if (!publicationDate || durationSec === null) {
        return "";
      }

      return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(seo.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(seo.name)}</video:title>
      <video:description>${escapeXml(seo.description.slice(0, 2048))}</video:description>
      <video:player_loc>${escapeXml(seo.embedUrl)}</video:player_loc>
      <video:publication_date>${escapeXml(publicationDate)}</video:publication_date>
      <video:duration>${durationSec}</video:duration>
    </video:video>
  </url>`;
    })
  );

  const urls = urlEntries.filter(Boolean).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`;

  return xmlResponse(xml);
}
