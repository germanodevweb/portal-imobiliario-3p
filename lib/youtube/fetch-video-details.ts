import "server-only";


export type YouTubeVideoDetails = {
  title: string;
  description: string;
  publishedAt: Date;
  durationIso: string;
};

type YouTubeApiItem = {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      maxres?: { url?: string };
      standard?: { url?: string };
      high?: { url?: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
};

/**
 * Busca metadados oficiais via YouTube Data API v3 (server-only).
 */
export async function fetchYouTubeVideoDetails(
  videoId: string
): Promise<YouTubeVideoDetails | null> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  let res: Response;
  try {
    res = await fetch(url.toString(), { next: { revalidate: 0 } });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let json: { items?: YouTubeApiItem[] };
  try {
    json = (await res.json()) as { items?: YouTubeApiItem[] };
  } catch {
    return null;
  }

  const item = json.items?.[0];
  const title = item?.snippet?.title?.trim();
  const description = item?.snippet?.description?.trim() ?? "";
  const publishedRaw = item?.snippet?.publishedAt;
  const durationIso = item?.contentDetails?.duration?.trim();

  if (!title || !publishedRaw || !durationIso) return null;

  const publishedAt = new Date(publishedRaw);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return {
    title,
    description,
    publishedAt,
    durationIso,
  };
}
